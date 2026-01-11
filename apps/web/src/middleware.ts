import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Check if Clerk credentials are valid (not placeholders)
const hasValidClerkCredentials = () => {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;

  // Check if keys exist and are not placeholder values
  if (!publishableKey || !secretKey) return false;
  if (publishableKey.includes('your_') || publishableKey.includes('pk_test_placeholder')) return false;
  if (secretKey.includes('your_') || secretKey.includes('sk_test_placeholder')) return false;
  if (publishableKey.length < 20 || secretKey.length < 20) return false;

  return true;
};

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/(.*)',
  '/api/feedback', // POST from extension uses API key, not session
  '/pricing',
  '/about',
  '/docs(.*)',
]);

const isApiRoute = createRouteMatcher(['/api/(.*)']);

// Bypass middleware when Clerk is not configured
function bypassMiddleware(req: NextRequest) {
  return NextResponse.next();
}

// Create the actual middleware based on Clerk configuration
const middleware = hasValidClerkCredentials()
  ? clerkMiddleware(async (auth, req) => {
      // Allow public routes
      if (isPublicRoute(req)) {
        return;
      }

      // Protect all other routes
      await auth.protect();
    })
  : bypassMiddleware;

export default middleware;

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
