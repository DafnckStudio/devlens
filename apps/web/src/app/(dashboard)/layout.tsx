'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Camera,
  FolderKanban,
  Home,
  Settings,
  CreditCard,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

// Dynamic import of UserButton to avoid SSR issues when Clerk is not configured
const UserButton = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.UserButton),
  {
    ssr: false,
    loading: () => (
      <div className="w-10 h-10 rounded-full bg-dark-700 animate-pulse" />
    ),
  }
);

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/projects', icon: FolderKanban, label: 'Projects' },
  { href: '/feedback', icon: Camera, label: 'Feedback' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

function isValidClerkKey(key: string | undefined): boolean {
  if (!key) return false;
  if (key === 'pk_test_placeholder') return false;
  return (key.startsWith('pk_test_') || key.startsWith('pk_live_')) && key.length > 50;
}

function DemoUserButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem('devlens_demo_session');
    window.location.href = '/';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-medium hover:opacity-90 transition-opacity"
      >
        D
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-xl z-50">
            <div className="p-3 border-b border-dark-700">
              <p className="text-sm font-medium text-white">Demo User</p>
              <p className="text-xs text-dark-400">demo@devlens.app</p>
            </div>
            <div className="p-1">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-700 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function UserButtonWrapper({ isDemoMode }: { isDemoMode: boolean }) {
  if (isDemoMode) {
    return <DemoUserButton />;
  }

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: 'w-10 h-10',
        },
      }}
    />
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true); // Default to demo to avoid flash
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    setIsDemoMode(!isValidClerkKey(clerkKey));
  }, []);

  // Show a loading state until client-side hydration
  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-dark-900">
        <aside className="hidden md:flex w-64 flex-col border-r border-dark-700 bg-dark-800">
          <div className="flex h-16 items-center gap-2 px-6 border-b border-dark-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">DevLens</span>
          </div>
          <nav className="flex-1 px-3 py-4">
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-dark-700 rounded-lg animate-pulse" />
              ))}
            </div>
          </nav>
        </aside>
        <div className="flex flex-col flex-1">
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <div className="h-8 bg-dark-700 rounded w-48 animate-pulse mb-4" />
              <div className="h-4 bg-dark-700 rounded w-32 animate-pulse" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-dark-900">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-dark-700 bg-dark-800">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-dark-700">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">DevLens</span>
          {isDemoMode && (
            <span className="text-xs px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
              Demo
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                      isActive
                        ? 'bg-primary-500/10 text-primary-400'
                        : 'text-dark-300 hover:bg-dark-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-dark-700 p-4">
          <div className="flex items-center gap-3">
            <UserButtonWrapper isDemoMode={isDemoMode} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {isDemoMode ? 'Demo User' : 'Account'}
              </p>
              <Link
                href="/settings/billing"
                className="flex items-center gap-1 text-xs text-dark-400 hover:text-primary-400"
              >
                <CreditCard className="h-3 w-3" />
                Manage billing
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 flex-col border-r border-dark-700 bg-dark-800 z-50 transform transition-transform duration-200 md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-dark-700">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">DevLens</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-dark-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                      isActive
                        ? 'bg-primary-500/10 text-primary-400'
                        : 'text-dark-300 hover:bg-dark-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-dark-700 p-4">
          <div className="flex items-center gap-3">
            <UserButtonWrapper isDemoMode={isDemoMode} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {isDemoMode ? 'Demo User' : 'Account'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1">
        {/* Mobile header */}
        <header className="flex h-16 items-center justify-between border-b border-dark-700 bg-dark-800 px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">DevLens</span>
          </div>
          <div className="flex items-center gap-4">
            <UserButtonWrapper isDemoMode={isDemoMode} />
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-dark-300 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
