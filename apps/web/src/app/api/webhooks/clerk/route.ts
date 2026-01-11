import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { generateApiKey } from '@/lib/api-key';
import crypto from 'crypto';

// Simple webhook verification without svix
function verifyWebhook(
  payload: string,
  headers: { svixId: string; svixTimestamp: string; svixSignature: string },
  secret: string
): boolean {
  const signedContent = `${headers.svixId}.${headers.svixTimestamp}.${payload}`;

  // Decode the secret from base64
  const secretBytes = Buffer.from(secret.split('_')[1], 'base64');

  // Compute expected signature
  const expectedSignature = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  // The header contains multiple signatures separated by space
  const signatures = headers.svixSignature.split(' ');

  for (const sig of signatures) {
    const [version, signature] = sig.split(',');
    if (version === 'v1' && signature === expectedSignature) {
      return true;
    }
  }

  return false;
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.text();

  // Verify webhook signature
  const isValid = verifyWebhook(
    payload,
    { svixId, svixTimestamp, svixSignature },
    WEBHOOK_SECRET
  );

  if (!isValid) {
    console.error('Webhook verification failed');
    return new Response('Webhook verification failed', { status: 400 });
  }

  let evt: WebhookEvent;
  try {
    evt = JSON.parse(payload) as WebhookEvent;
  } catch {
    return new Response('Invalid payload', { status: 400 });
  }

  const eventType = evt.type;

  try {
    switch (eventType) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        const email = email_addresses[0]?.email_address ?? '';
        const name = [first_name, last_name].filter(Boolean).join(' ') || null;

        await db.insert(users).values({
          clerkId: id,
          email,
          name,
          imageUrl: image_url,
          apiKey: generateApiKey('usr'),
          subscriptionTier: 'free',
        });
        break;
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        const email = email_addresses[0]?.email_address ?? '';
        const name = [first_name, last_name].filter(Boolean).join(' ') || null;

        await db
          .update(users)
          .set({
            email,
            name,
            imageUrl: image_url,
            updatedAt: new Date(),
          })
          .where(eq(users.clerkId, id));
        break;
      }

      case 'user.deleted': {
        const { id } = evt.data;
        if (id) {
          await db.delete(users).where(eq(users.clerkId, id));
        }
        break;
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response('Internal error', { status: 500 });
  }
}
