import { NextRequest, NextResponse } from 'next/server';
import { db, projects, users } from '@/db';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { generateApiKey } from '@/lib/api-key';

// ============================================
// GET /api/projects - List user's projects
// ============================================

export async function GET() {
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

    // Get projects
    const projectList = await db.query.projects.findMany({
      where: eq(projects.userId, user.id),
    });

    return NextResponse.json({ projects: projectList });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/projects - Create new project
// ============================================

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  domains: z.array(z.string()).default([]),
  localPath: z.string().optional(),
});

export async function POST(request: NextRequest) {
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

    // Check project limit based on subscription
    const existingProjects = await db.query.projects.findMany({
      where: eq(projects.userId, user.id),
    });

    const limits: Record<string, number> = {
      free: 1,
      pro: 10,
      team: 50,
    };

    const limit = limits[user.subscriptionTier] ?? 1;
    if (existingProjects.length >= limit) {
      return NextResponse.json(
        {
          error: `Project limit reached. Upgrade to create more projects.`,
          limit,
        },
        { status: 403 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const data = CreateProjectSchema.parse(body);

    // Create project
    const [project] = await db
      .insert(projects)
      .values({
        userId: user.id,
        name: data.name,
        domains: data.domains,
        localPath: data.localPath,
        apiKey: generateApiKey('proj'),
      })
      .returning();

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
