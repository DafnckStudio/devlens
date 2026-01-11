import Link from 'next/link';
import { Camera, ArrowLeft } from 'lucide-react';

// Force dynamic to avoid prerender issues with Clerk
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dark-900 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 mb-6">
        <Camera className="h-8 w-8 text-primary-500" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-2">404</h1>
      <p className="text-dark-400 text-lg mb-8">Page not found</p>
      <Link
        href="/"
        className="flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-white hover:bg-primary-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Go back home
      </Link>
    </div>
  );
}
