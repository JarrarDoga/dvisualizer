import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

const createDashboardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  config: z.any(),
  data: z.any().optional(),
  isPublic: z.boolean().optional().default(false),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const dashboards = await prisma.dashboard.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
        config: true,
      },
    });

    const dashboardsWithCounts = dashboards.map((dashboard) => {
      const config = dashboard.config as { charts?: unknown[] } | null;
      return {
        ...dashboard,
        chartCount: config?.charts?.length || 0,
      };
    });

    return NextResponse.json(dashboardsWithCounts);
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboards' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = createDashboardSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { name, description, config, data, isPublic } = parsed.data;

    const dashboard = await prisma.dashboard.create({
      data: {
        name,
        description,
        config,
        data,
        isPublic,
        userId: session.user.id,
      },
    });

    return NextResponse.json(dashboard, { status: 201 });
  } catch (error) {
    console.error('Error creating dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to create dashboard' },
      { status: 500 }
    );
  }
}
