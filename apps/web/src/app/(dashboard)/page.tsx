import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db, users, feedbacks, projects } from '@/db';
import { eq, count, and, gte } from 'drizzle-orm';
import { Camera, FolderKanban, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering to avoid build-time auth issues
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  // Get user
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user) redirect('/sign-in');

  // Get stats
  const [projectsCount] = await db
    .select({ count: count() })
    .from(projects)
    .where(eq(projects.userId, user.id));

  const [pendingFeedbackCount] = await db
    .select({ count: count() })
    .from(feedbacks)
    .where(and(eq(feedbacks.userId, user.id), eq(feedbacks.status, 'pending')));

  const [resolvedFeedbackCount] = await db
    .select({ count: count() })
    .from(feedbacks)
    .where(and(eq(feedbacks.userId, user.id), eq(feedbacks.status, 'resolved')));

  // Get recent 7 days feedback count
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [recentFeedbackCount] = await db
    .select({ count: count() })
    .from(feedbacks)
    .where(
      and(eq(feedbacks.userId, user.id), gte(feedbacks.createdAt, sevenDaysAgo))
    );

  const stats = [
    {
      label: 'Total Projects',
      value: projectsCount?.count ?? 0,
      icon: FolderKanban,
      color: 'text-primary-500',
      bgColor: 'bg-primary-500/10',
    },
    {
      label: 'Pending Feedback',
      value: pendingFeedbackCount?.count ?? 0,
      icon: AlertCircle,
      color: 'text-accent-500',
      bgColor: 'bg-accent-500/10',
    },
    {
      label: 'Resolved',
      value: resolvedFeedbackCount?.count ?? 0,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Last 7 Days',
      value: recentFeedbackCount?.count ?? 0,
      icon: Camera,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
  ];

  // Get recent feedback
  const recentFeedback = await db.query.feedbacks.findMany({
    where: eq(feedbacks.userId, user.id),
    orderBy: (feedbacks, { desc }) => [desc(feedbacks.createdAt)],
    limit: 5,
    with: {
      project: true,
    },
  });

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-dark-400 mt-1">
          Welcome back, {user.name || 'Developer'}
        </p>
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
          <h2 className="text-lg font-semibold text-white mb-4">
            Quick Actions
          </h2>
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
                  {item.screenshotUrl && (
                    <img
                      src={item.screenshotUrl}
                      alt="Screenshot"
                      className="w-16 h-12 object-cover rounded border border-dark-600"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-dark-200 text-sm truncate">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-dark-400">
                        {item.project?.name}
                      </span>
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
