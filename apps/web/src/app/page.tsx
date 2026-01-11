import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import LandingPage from './(marketing)/landing-content';

// Force dynamic rendering to avoid build-time auth issues
export const dynamic = 'force-dynamic';

// Check if Clerk credentials are valid (not placeholders)
function hasValidClerkCredentials(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!publishableKey || !secretKey) return false;
  if (publishableKey.includes('pk_test_placeholder')) return false;
  if (secretKey.includes('sk_test_placeholder')) return false;
  if (publishableKey.length < 50 || secretKey.length < 20) return false;

  return true;
}

export default async function HomePage() {
  // Only call auth() when Clerk is properly configured
  if (hasValidClerkCredentials()) {
    try {
      const { userId } = await auth();
      if (userId) {
        redirect('/dashboard');
      }
    } catch {
      // Auth failed, continue to landing page
    }
  }

  return <LandingPage />;
}
