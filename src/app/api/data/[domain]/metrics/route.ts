import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import type { DomainId } from '@/types';

interface RouteParams {
  params: Promise<{ domain: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { domain } = await params;
    const domainId = domain as DomainId;
    
    // Query metrics from db
    const dbMetrics = await prisma.metric.findMany({
      where: { domain: domainId },
      orderBy: { recordedAt: 'desc' },
    });

    const latestMetricsMap = new Map();
    for (const m of dbMetrics) {
      if (!latestMetricsMap.has(m.metricId)) {
        latestMetricsMap.set(m.metricId, {
          id: m.id,
          metricId: m.metricId,
          value: m.value,
          previousValue: m.previousValue,
          change: m.change,
          changePercent: m.changePercent,
          trend: m.trend,
          timestamp: m.recordedAt.toISOString(),
          domain: m.domain as DomainId,
          unit: m.unit || undefined,
        });
      }
    }
    const data = Array.from(latestMetricsMap.values());
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
