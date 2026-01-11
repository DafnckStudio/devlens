'use client';

import { useEffect, useState } from 'react';
import { Camera, FolderKanban, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function isValidClerkKey(key: string | undefined): boolean {
  if (!key) return false;
  if (key === 'pk_test_placeholder') return false;
  return (key.startsWith('pk_test_') || key.startsWith('pk_live_')) && key.length > 50;
}

interface StatItem {
  label: string;
  value: number;
  icon: typeof Camera;
  color: string;
  bgColor: string;
}

interface FeedbackItem {
  id: string;
  description: string;
  screenshotUrl?: string;
  status: string;
  project?: { name: string };
}

// Demo data for when Clerk is not configured
const demoStats: StatItem[] = [
  {
    label: 'Total Projects',
    value: 2,
    icon: FolderKanban,
    color: 'text-primary-500',
    bgColor: 'bg-primary-500/10',
  },
  {
    label: 'Pending Feedback',
    value: 5,
    icon: AlertCircle,
    color: 'text-accent-500',
    bgColor: 'bg-accent-500/10',
  },
  {
    label: 'Resolved',
    value: 12,
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    label: 'Last 7 Days',
    value: 8,
    icon: Camera,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
];

const demoFeedback: FeedbackItem[] = [
  {
    id: 'demo-1',
    description: 'Button alignment is off on mobile view',
    status: 'pending',
    project: { name: 'Demo Project' },
  },
  {
    id: 'demo-2',
    description: 'Console error: undefined is not a function',
    status: 'in_progress',
    project: { name: 'Demo Project' },
  },
  {
    id: 'demo-3',
    description: 'Form validation not working correctly',
    status: 'resolved',
    project: { name: 'Another Project' },
  },
];

function DemoDashboard() {
  return (
    <div className="p-6 space-y-8">
      {/* Demo Banner */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-yellow-400">Demo Mode</p>
            <p className="text-yellow-400/80">
              You&apos;re viewing sample data. Configure Clerk to enable full functionality.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-dark-400 mt-1">Welcome back, Demo User</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {demoStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-dark-800 border border-dark-700 rounded-xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-dark-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions + Recent Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/projects"
              className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors"
            >
              <FolderKanban className="h-5 w-5 text-primary-500" />
              <span className="text-dark-200">Create New Project</span>
            </Link>
            <Link
              href="/feedback?status=pending"
              className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors"
            >
              <AlertCircle className="h-5 w-5 text-accent-500" />
              <span className="text-dark-200">View Pending Feedback</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors"
            >
              <Camera className="h-5 w-5 text-blue-500" />
              <span className="text-dark-200">Get Extension</span>
            </Link>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="lg:col-span-2 bg-dark-800 border border-dark-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Feedback</h2>
            <Link
              href="/feedback"
              className="text-sm text-primary-500 hover:text-primary-400"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {demoFeedback.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-dark-700/50"
              >
                <div className="w-16 h-12 bg-dark-600 rounded border border-dark-500 flex items-center justify-center">
                  <Camera className="h-5 w-5 text-dark-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-dark-200 text-sm truncate">{item.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-dark-400">{item.project?.name}</span>
                    <span className="text-dark-600">•</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        item.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-400'
                          : item.status === 'in_progress'
                          ? 'bg-blue-500/20 text-blue-400'
                          : item.status === 'resolved'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-dark-600 text-dark-400'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RealDashboard() {
  const [stats, setStats] = useState<StatItem[]>([
    {
      label: 'Total Projects',
      value: 0,
      icon: FolderKanban,
      color: 'text-primary-500',
      bgColor: 'bg-primary-500/10',
    },
    {
      label: 'Pending Feedback',
      value: 0,
      icon: AlertCircle,
      color: 'text-accent-500',
      bgColor: 'bg-accent-500/10',
    },
    {
      label: 'Resolved',
      value: 0,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Last 7 Days',
      value: 0,
      icon: Camera,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
  ]);
  const [recentFeedback, setRecentFeedback] = useState<FeedbackItem[]>([]);
  const [userName, setUserName] = useState('Developer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch dashboard stats from API
        const [projectsRes, feedbackRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/feedback?limit=5'),
        ]);

        if (projectsRes.ok) {
          const projects = await projectsRes.json();
          setStats((prev) => {
            const updated = [...prev];
            updated[0] = { ...updated[0], value: projects.length || 0 };
            return updated;
          });
        }

        if (feedbackRes.ok) {
          const feedback = await feedbackRes.json();
          setRecentFeedback(feedback.slice(0, 5));

          const pending = feedback.filter((f: FeedbackItem) => f.status === 'pending').length;
          const resolved = feedback.filter((f: FeedbackItem) => f.status === 'resolved').length;

          setStats((prev) => {
            const updated = [...prev];
            updated[1] = { ...updated[1], value: pending };
            updated[2] = { ...updated[2], value: resolved };
            updated[3] = { ...updated[3], value: feedback.length };
            return updated;
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-dark-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-dark-700 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-dark-800 border border-dark-700 rounded-xl p-5">
              <div className="animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 bg-dark-700 rounded-lg"></div>
                <div>
                  <div className="h-3 bg-dark-700 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-dark-700 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-dark-400 mt-1">Welcome back, {userName}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-dark-800 border border-dark-700 rounded-xl p-5"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-dark-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions + Recent Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/projects"
              className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors"
            >
              <FolderKanban className="h-5 w-5 text-primary-500" />
              <span className="text-dark-200">Create New Project</span>
            </Link>
            <Link
              href="/feedback?status=pending"
              className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors"
            >
              <AlertCircle className="h-5 w-5 text-accent-500" />
              <span className="text-dark-200">View Pending Feedback</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors"
            >
              <Camera className="h-5 w-5 text-blue-500" />
              <span className="text-dark-200">Get Extension</span>
            </Link>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="lg:col-span-2 bg-dark-800 border border-dark-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Feedback</h2>
            <Link
              href="/feedback"
              className="text-sm text-primary-500 hover:text-primary-400"
            >
              View all
            </Link>
          </div>

          {recentFeedback.length === 0 ? (
            <div className="text-center py-8">
              <Camera className="h-12 w-12 text-dark-600 mx-auto mb-3" />
              <p className="text-dark-400">No feedback yet</p>
              <p className="text-dark-500 text-sm mt-1">
                Install the Chrome extension to start capturing feedback
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentFeedback.map((item) => (
                <Link
                  key={item.id}
                  href={`/feedback/${item.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors"
                >
                  {item.screenshotUrl ? (
                    <img
                      src={item.screenshotUrl}
                      alt="Screenshot"
                      className="w-16 h-12 object-cover rounded border border-dark-600"
                    />
                  ) : (
                    <div className="w-16 h-12 bg-dark-600 rounded border border-dark-500 flex items-center justify-center">
                      <Camera className="h-5 w-5 text-dark-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-dark-200 text-sm truncate">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-dark-400">{item.project?.name}</span>
                      <span className="text-dark-600">•</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          item.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400'
                            : item.status === 'in_progress'
                            ? 'bg-blue-500/20 text-blue-400'
                            : item.status === 'resolved'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-dark-600 text-dark-400'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    setIsDemoMode(!isValidClerkKey(clerkKey));
  }, []);

  if (!mounted) {
    return (
      <div className="p-6 space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-dark-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-dark-700 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (isDemoMode) {
    return <DemoDashboard />;
  }

  return <RealDashboard />;
}
