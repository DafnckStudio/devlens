import { NextRequest, NextResponse } from 'next/server';
import { db, feedbacks, projects, users } from '@/db';
import { eq, and, desc } from 'drizzle-orm';
import { put } from '@vercel/blob';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

// ============================================
// GET /api/feedback - List feedback for user
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') ?? '50');

    // Build query
    const conditions = [eq(feedbacks.userId, user.id)];
    if (projectId) {
      conditions.push(eq(feedbacks.projectId, projectId));
    }
    if (status) {
      conditions.push(eq(feedbacks.status, status));
    }

    const feedbackList = await db.query.feedbacks.findMany({
      where: and(...conditions),
      orderBy: [desc(feedbacks.createdAt)],
      limit,
      with: {
        project: true,
      },
    });

    return NextResponse.json({ feedbacks: feedbackList });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/feedback - Submit feedback from extension
// ============================================

const CreateFeedbackSchema = z.object({
  screenshot: z.string(), // base64 data URL
  pageUrl: z.string().url(),
  pageTitle: z.string().optional(),
  description: z.string().min(1),
  elementSelector: z.string().optional(),
  elementTagName: z.string().optional(),
  elementBoundingBox: z
    .object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  consoleErrors: z
    .array(
      z.object({
        type: z.enum(['error', 'warn', 'info']),
        message: z.string(),
        source: z.string().optional(),
        line: z.number().optional(),
        column: z.number().optional(),
        stack: z.string().optional(),
        timestamp: z.string(),
      })
    )
    .default([]),
  browserInfo: z.object({
    userAgent: z.string(),
    viewport: z.object({
      width: z.number(),
      height: z.number(),
    }),
    language: z.string(),
    platform: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // Get API key from header
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      );
    }

    // Find project by API key
    const project = await db.query.projects.findFirst({
      where: eq(projects.apiKey, apiKey),
      with: {
        user: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const data = CreateFeedbackSchema.parse(body);

    // Upload screenshot to Vercel Blob
    const base64Data = data.screenshot.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filename = `feedback/${project.id}/${Date.now()}.png`;

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: 'image/png',
    });

    // Create feedback
    const [feedback] = await db
      .insert(feedbacks)
      .values({
        projectId: project.id,
        userId: project.userId,
        screenshotUrl: blob.url,
        pageUrl: data.pageUrl,
        pageTitle: data.pageTitle,
        description: data.description,
        elementSelector: data.elementSelector,
        elementTagName: data.elementTagName,
        elementBoundingBox: data.elementBoundingBox,
        consoleErrors: data.consoleErrors,
        browserInfo: data.browserInfo,
        status: 'pending',
        priority: 'medium',
      })
      .returning();

    return NextResponse.json({ feedback }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    );
  }
}
