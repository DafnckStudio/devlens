import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import {
  Camera,
  FolderKanban,
  Home,
  Settings,
  CreditCard,
  Menu,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/projects', icon: FolderKanban, label: 'Projects' },
  { href: '/feedback', icon: Camera, label: 'Feedback' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-dark-300 transition-colors hover:bg-dark-700 hover:text-white"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-dark-700 p-4">
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10',
                },
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Account</p>
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

      {/* Mobile header */}
      <div className="flex flex-col flex-1">
        <header className="flex h-16 items-center justify-between border-b border-dark-700 bg-dark-800 px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">DevLens</span>
          </div>
          <div className="flex items-center gap-4">
            <UserButton />
            <button className="p-2 text-dark-300 hover:text-white">
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
