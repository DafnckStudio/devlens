import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key, { apiVersion: '2025-02-24.acacia' });
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe webhook not configured' },
      { status: 500 }
    );
  }

  const stripe = getStripeClient();
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      // Get the price to determine tier
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id;

      // Map price to tier (you'll set these in Stripe)
      const tierMap: Record<string, string> = {
        [process.env.STRIPE_PRO_PRICE_ID!]: 'pro',
        [process.env.STRIPE_TEAM_PRICE_ID!]: 'team',
      };
      const tier = tierMap[priceId] ?? 'pro';

      await db
        .update(users)
        .set({
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          subscriptionTier: tier,
          updatedAt: new Date(),
        })
        .where(eq(users.stripeCustomerId, customerId));
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const priceId = subscription.items.data[0]?.price.id;

      const tierMap: Record<string, string> = {
        [process.env.STRIPE_PRO_PRICE_ID!]: 'pro',
        [process.env.STRIPE_TEAM_PRICE_ID!]: 'team',
      };
      const tier = tierMap[priceId] ?? 'pro';

      await db
        .update(users)
        .set({
          subscriptionTier: tier,
          updatedAt: new Date(),
        })
        .where(eq(users.stripeCustomerId, customerId));
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await db
        .update(users)
        .set({
          subscriptionTier: 'free',
          stripeSubscriptionId: null,
          updatedAt: new Date(),
        })
        .where(eq(users.stripeCustomerId, customerId));
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      // Could send notification or take other action
      console.warn(`Payment failed for customer: ${customerId}`);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
