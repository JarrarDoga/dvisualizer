import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

const updateDashboardSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  config: z.any().optional(),
  data: z.any().optional(),
  isPublic: z.boolean().optional(),
});

// GET /api/dashboards/[id] - Get a single dashboard
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const dashboard = await prisma.dashboard.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!dashboard) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      );
    }

    // Check access: either owner or public dashboard
    if (!dashboard.isPublic && dashboard.userId !== session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard' },
      { status: 500 }
    );
  }
}

// PUT /api/dashboards/[id] - Update a dashboard
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check ownership
    const existingDashboard = await prisma.dashboard.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingDashboard) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      );
    }

    if (existingDashboard.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = updateDashboardSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const dashboard = await prisma.dashboard.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Error updating dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to update dashboard' },
      { status: 500 }
    );
  }
}

// DELETE /api/dashboards/[id] - Delete a dashboard
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check ownership
    const existingDashboard = await prisma.dashboard.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingDashboard) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      );
    }

    if (existingDashboard.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.dashboard.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Dashboard deleted' });
  } catch (error) {
    console.error('Error deleting dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to delete dashboard' },
      { status: 500 }
    );
  }
}
