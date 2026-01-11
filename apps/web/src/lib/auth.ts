import { auth, currentUser } from '@clerk/nextjs/server';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { generateApiKey } from './api-key';

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  return user;
}

export async function getOrCreateUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  // Check if user exists
  let user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUser.id),
  });

  // Create if not exists
  if (!user) {
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
        name: clerkUser.fullName,
        imageUrl: clerkUser.imageUrl,
        apiKey: generateApiKey('usr'),
        subscriptionTier: 'free',
      })
      .returning();
    user = newUser;
  }

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
