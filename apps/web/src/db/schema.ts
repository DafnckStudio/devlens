import {
  pgTable,
  text,
  timestamp,
  varchar,
  uuid,
  jsonb,
  index,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// USERS
// ============================================

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }),
    imageUrl: text('image_url'),
    apiKey: varchar('api_key', { length: 64 }).notNull().unique(),
    subscriptionTier: varchar('subscription_tier', { length: 20 })
      .notNull()
      .default('free'),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
    stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('users_clerk_id_idx').on(table.clerkId),
    index('users_api_key_idx').on(table.apiKey),
    index('users_email_idx').on(table.email),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  feedbacks: many(feedbacks),
}));

// ============================================
// PROJECTS
// ============================================

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    domains: jsonb('domains').$type<string[]>().notNull().default([]),
    localPath: text('local_path'),
    apiKey: varchar('api_key', { length: 64 }).notNull().unique(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('projects_user_id_idx').on(table.userId),
    index('projects_api_key_idx').on(table.apiKey),
  ]
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  feedbacks: many(feedbacks),
}));

// ============================================
// FEEDBACKS
// ============================================

export const feedbacks = pgTable(
  'feedbacks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Screenshot
    screenshotUrl: text('screenshot_url').notNull(),
    thumbnailUrl: text('thumbnail_url'),

    // Element info
    elementSelector: text('element_selector'),
    elementTagName: varchar('element_tag_name', { length: 50 }),
    elementBoundingBox: jsonb('element_bounding_box').$type<{
      x: number;
      y: number;
      width: number;
      height: number;
    }>(),

    // Page info
    pageUrl: text('page_url').notNull(),
    pageTitle: varchar('page_title', { length: 500 }),

    // Feedback content
    description: text('description').notNull(),

    // Console errors
    consoleErrors: jsonb('console_errors')
      .$type<
        Array<{
          type: 'error' | 'warn' | 'info';
          message: string;
          source?: string;
          line?: number;
          column?: number;
          stack?: string;
          timestamp: string;
        }>
      >()
      .notNull()
      .default([]),

    // Browser info
    browserInfo: jsonb('browser_info')
      .$type<{
        userAgent: string;
        viewport: { width: number; height: number };
        language: string;
        platform: string;
      }>()
      .notNull(),

    // Status
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    priority: varchar('priority', { length: 20 }).notNull().default('medium'),

    // Timestamps
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    resolvedAt: timestamp('resolved_at'),
  },
  (table) => [
    index('feedbacks_project_id_idx').on(table.projectId),
    index('feedbacks_user_id_idx').on(table.userId),
    index('feedbacks_status_idx').on(table.status),
    index('feedbacks_created_at_idx').on(table.createdAt),
  ]
);

export const feedbacksRelations = relations(feedbacks, ({ one }) => ({
  project: one(projects, {
    fields: [feedbacks.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [feedbacks.userId],
    references: [users.id],
  }),
}));

// ============================================
// TYPES
// ============================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Feedback = typeof feedbacks.$inferSelect;
export type NewFeedback = typeof feedbacks.$inferInsert;

export type SubscriptionTier = 'free' | 'pro' | 'team';
export type FeedbackStatus = 'pending' | 'in_progress' | 'resolved' | 'wont_fix';
export type FeedbackPriority = 'low' | 'medium' | 'high' | 'critical';
