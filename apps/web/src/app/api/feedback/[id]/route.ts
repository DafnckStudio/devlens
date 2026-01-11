import { NextRequest, NextResponse } from 'next/server';
import { db, feedbacks, users } from '@/db';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ============================================
// GET /api/feedback/[id] - Get single feedback
// ============================================

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get feedback
    const feedback = await db.query.feedbacks.findFirst({
      where: and(eq(feedbacks.id, id), eq(feedbacks.userId, user.id)),
      with: {
        project: true,
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

// ============================================
// PUT /api/feedback/[id] - Update feedback status
// ============================================

const UpdateFeedbackSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'resolved', 'wont_fix']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify ownership
    const existing = await db.query.feedbacks.findFirst({
      where: and(eq(feedbacks.id, id), eq(feedbacks.userId, user.id)),
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const data = UpdateFeedbackSchema.parse(body);

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.status) {
      updateData.status = data.status;
      if (data.status === 'resolved') {
        updateData.resolvedAt = new Date();
      }
    }

    if (data.priority) {
      updateData.priority = data.priority;
    }

    // Update feedback
    const [feedback] = await db
      .update(feedbacks)
      .set(updateData)
      .where(eq(feedbacks.id, id))
      .returning();

    return NextResponse.json({ feedback });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/feedback/[id] - Delete feedback
// ============================================

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify ownership and delete
    const [deleted] = await db
      .delete(feedbacks)
      .where(and(eq(feedbacks.id, id), eq(feedbacks.userId, user.id)))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to delete feedback' },
      { status: 500 }
    );
  }
}
