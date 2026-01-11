import { NextRequest, NextResponse } from 'next/server';
import { db, projects, users } from '@/db';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { generateApiKey } from '@/lib/api-key';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ============================================
// GET /api/projects/[id] - Get single project
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

    // Get project
    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, id), eq(projects.userId, user.id)),
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// ============================================
// PUT /api/projects/[id] - Update project
// ============================================

const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  domains: z.array(z.string()).optional(),
  localPath: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  regenerateApiKey: z.boolean().optional(),
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
    const existing = await db.query.projects.findFirst({
      where: and(eq(projects.id, id), eq(projects.userId, user.id)),
    });

    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Parse and validate body
    const body = await request.json();
    const data = UpdateProjectSchema.parse(body);

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.domains !== undefined) updateData.domains = data.domains;
    if (data.localPath !== undefined) updateData.localPath = data.localPath;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.regenerateApiKey) updateData.apiKey = generateApiKey('proj');

    // Update project
    const [project] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();

    return NextResponse.json({ project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/projects/[id] - Delete project
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
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
