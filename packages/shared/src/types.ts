// ============================================
// DevLens Shared Types
// ============================================

// User & Auth
export interface User {
  id: string;
  email: string;
  clerkId: string;
  stripeCustomerId?: string;
  subscriptionTier: SubscriptionTier;
  apiKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionTier = 'free' | 'pro' | 'team';

export interface SubscriptionLimits {
  projects: number;
  feedbackPerMonth: number;
  retentionDays: number;
  videoClips: boolean;
  teamMembers: number;
  apiAccess: boolean;
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    projects: 1,
    feedbackPerMonth: 10,
    retentionDays: 7,
    videoClips: false,
    teamMembers: 1,
    apiAccess: false,
  },
  pro: {
    projects: -1, // unlimited
    feedbackPerMonth: 100,
    retentionDays: 30,
    videoClips: true,
    teamMembers: 1,
    apiAccess: true,
  },
  team: {
    projects: -1,
    feedbackPerMonth: 500,
    retentionDays: 90,
    videoClips: true,
    teamMembers: 10,
    apiAccess: true,
  },
};

// Projects
export interface Project {
  id: string;
  userId: string;
  name: string;
  domains: string[]; // URL patterns for routing
  localPath?: string; // For VPS users
  apiKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  domains: string[];
  localPath?: string;
}

// Feedback
export interface Feedback {
  id: string;
  projectId: string;
  screenshotUrl: string;
  thumbnailUrl?: string;
  elementSelector?: string;
  elementTagName?: string;
  pageUrl: string;
  pageTitle: string;
  description: string;
  consoleErrors: ConsoleError[];
  browserInfo: BrowserInfo;
  status: FeedbackStatus;
  createdAt: Date;
  resolvedAt?: Date;
}

export type FeedbackStatus = 'pending' | 'in_progress' | 'resolved' | 'wont_fix';

export interface ConsoleError {
  type: 'error' | 'warn' | 'log';
  message: string;
  source?: string;
  line?: number;
  column?: number;
  timestamp: number;
}

export interface BrowserInfo {
  userAgent: string;
  viewport: { width: number; height: number };
  language: string;
  platform: string;
}

export interface CreateFeedbackInput {
  projectId?: string; // Optional, will be auto-detected from URL
  pageUrl: string;
  pageTitle: string;
  description: string;
  screenshot: string; // Base64
  elementSelector?: string;
  elementTagName?: string;
  consoleErrors: ConsoleError[];
  browserInfo: BrowserInfo;
}

// API Responses
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Extension Config
export interface ExtensionConfig {
  apiKey: string;
  apiUrl: string;
  userId: string;
  projects: ProjectSummary[];
}

export interface ProjectSummary {
  id: string;
  name: string;
  domains: string[];
}

// API Messages
export interface FeedbackListParams {
  projectId?: string;
  status?: FeedbackStatus;
  page?: number;
  pageSize?: number;
}

// Webhook Events
export type WebhookEvent =
  | { type: 'feedback.created'; data: Feedback }
  | { type: 'feedback.resolved'; data: Feedback }
  | { type: 'project.created'; data: Project };

// Claude Code Plugin Types
export interface PluginConfig {
  apiKey: string;
  apiUrl: string;
  projectMappings: ProjectMapping[];
}

export interface ProjectMapping {
  projectId: string;
  localPath: string;
}

export interface FeedbackForClaude {
  id: string;
  project: string;
  page: string;
  description: string;
  screenshotUrl: string;
  consoleErrors: string[];
  status: FeedbackStatus;
  createdAt: string;
}
