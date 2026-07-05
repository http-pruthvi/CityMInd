import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createWorkflow } from '@/lib/workflows/engine';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const domain = url.searchParams.get('domain');
    const status = url.searchParams.get('status');

    const filter: any = {};
    if (domain) filter.domain = domain;
    if (status) filter.status = status;

    const workflows = await prisma.workflow.findMany({
      where: filter,
      include: {
        actions: true,
        triggeredBy: true,
        approver: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: workflows,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, domain, priority, triggeredById, actions } = body;

    if (!title || !domain || !triggeredById || !actions || !Array.isArray(actions)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, domain, triggeredById, actions' },
        { status: 400 }
      );
    }

    const workflow = await createWorkflow({
      title,
      description,
      domain,
      priority,
      triggeredById,
      actions,
    });

    return NextResponse.json({
      success: true,
      data: workflow,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
