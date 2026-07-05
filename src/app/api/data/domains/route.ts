import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const domains = await prisma.domainConfig.findMany({
      orderBy: { id: 'asc' },
    });
    return NextResponse.json({ success: true, data: domains });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { domainId, enabled } = await request.json();

    if (!domainId || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: domainId, enabled (boolean)' },
        { status: 400 }
      );
    }

    const updated = await prisma.domainConfig.update({
      where: { id: domainId },
      data: { enabled },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
