import { NextRequest, NextResponse } from 'next/server';
import { approveWorkflow, rejectWorkflow } from '@/lib/workflows/engine';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { action, userId, reason } = await request.json();

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: action ("approve" | "reject")' },
        { status: 400 }
      );
    }

    // Dynamically resolve operator user from database to prevent foreign key constraint issues
    let resolvedUserId = userId;
    if (!resolvedUserId || resolvedUserId === 'operator-1') {
      const db = require('@/lib/db/prisma').prisma;
      const operator = await db.user.findFirst({
        where: { role: 'operator' },
      });
      if (operator) {
        resolvedUserId = operator.id;
      } else {
        return NextResponse.json(
          { success: false, error: 'No operator user found in the database. Please run the seeder first.' },
          { status: 400 }
        );
      }
    }

    if (action === 'approve') {
      const workflow = await approveWorkflow(id, resolvedUserId);
      return NextResponse.json({
        success: true,
        data: workflow,
      });
    } else if (action === 'reject') {
      const workflow = await rejectWorkflow(id, resolvedUserId, reason);
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
