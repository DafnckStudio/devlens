'use client';

import { SignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function isValidClerkKey(key: string | undefined): boolean {
  if (!key) return false;
  if (key === 'pk_test_placeholder') return false;
  return (key.startsWith('pk_test_') || key.startsWith('pk_live_')) && key.length > 50;
}

function DemoSignUp() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoSignUp = () => {
    setIsLoading(true);
    // Set demo session in localStorage
    localStorage.setItem('devlens_demo_session', JSON.stringify({
      userId: 'demo_user',
      email: 'demo@devlens.app',
      name: 'Demo User',
      createdAt: new Date().toISOString(),
    }));
    // Redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-900">
      <div className="w-full max-w-md space-y-8 p-8 bg-dark-800 rounded-xl border border-dark-700">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">Get Started with DevLens</h2>
          <p className="mt-2 text-dark-400">Demo Mode - No sign up required</p>
        </div>

        <div className="bg-dark-700/50 rounded-lg p-4 border border-dark-600">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-dark-300">
              <p className="font-medium text-dark-200 mb-1">Demo Mode Active</p>
              <p>Clerk authentication is not configured. You can explore DevLens with a demo account.</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleDemoSignUp}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating Demo Account...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Start Demo
            </>
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-dark-500">
            Already have an account?{' '}
            <a href="/sign-in" className="text-primary-500 hover:text-primary-400">
              Sign in
            </a>
          </p>
        </div>

        <p className="text-center text-xs text-dark-600">
          To enable full authentication, configure Clerk environment variables.
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasValidClerkKey = isValidClerkKey(clerkKey);

  if (!hasValidClerkKey) {
    return <DemoSignUp />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-900">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-dark-800 border border-dark-700',
            headerTitle: 'text-white',
            headerSubtitle: 'text-dark-400',
            socialButtonsBlockButton:
              'bg-dark-700 border-dark-600 text-white hover:bg-dark-600',
            dividerLine: 'bg-dark-700',
            dividerText: 'text-dark-500',
            formFieldLabel: 'text-dark-300',
            formFieldInput:
              'bg-dark-700 border-dark-600 text-white placeholder:text-dark-500',
            footerActionLink: 'text-primary-500 hover:text-primary-400',
            formButtonPrimary:
              'bg-primary-500 hover:bg-primary-600 text-white',
          },
        }}
      />
    </div>
  );
}
