import type { Metadata } from 'next';
import { Inter, Space_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'DevLens - See what your users see',
    template: '%s | DevLens',
  },
  description:
    'Visual feedback tool for AI-assisted development. Capture screenshots, console errors, and route feedback directly to Claude Code.',
  keywords: [
    'developer tools',
    'feedback',
    'screenshot',
    'debugging',
    'AI development',
    'Claude Code',
  ],
  authors: [{ name: 'DafnckStudio' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://devlens.app',
    siteName: 'DevLens',
    title: 'DevLens - See what your users see',
    description:
      'Visual feedback tool for AI-assisted development. Capture screenshots, console errors, and route feedback directly to Claude Code.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevLens - See what your users see',
    description:
      'Visual feedback tool for AI-assisted development.',
  },
};

const clerkAppearance = {
  variables: {
    colorPrimary: '#6366F1',
    colorBackground: '#0F172A',
    colorText: '#F8FAFC',
    colorInputBackground: '#1E293B',
    colorInputText: '#F8FAFC',
  },
};

function isValidClerkKey(key: string | undefined): boolean {
  if (!key) return false;
  if (key === 'pk_test_placeholder') return false;
  // Clerk keys are base64-like and typically longer than 50 chars
  return (key.startsWith('pk_test_') || key.startsWith('pk_live_')) && key.length > 50;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasValidClerkKey = isValidClerkKey(clerkKey);

  const body = (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceMono.variable} font-sans antialiased bg-dark-900 text-white`}
      >
        {children}
      </body>
    </html>
  );

  if (!hasValidClerkKey) {
    return body;
  }

  return (
    <ClerkProvider appearance={clerkAppearance}>
      {body}
    </ClerkProvider>
  );
}
