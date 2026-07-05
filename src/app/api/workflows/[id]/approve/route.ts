import { NextRequest, NextResponse } from 'next/server';
import { approveWorkflow, rejectWorkflow } from '@/lib/workflows/engine';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { action, userId, reason } = await request.json();

    if (!action || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: action ("approve" | "reject"), userId' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      const workflow = await approveWorkflow(id, userId);
      return NextResponse.json({
        success: true,
        data: workflow,
      });
    } else if (action === 'reject') {
      const workflow = await rejectWorkflow(id, userId, reason);
      return NextResponse.json({
        success: true,
        data: workflow,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
