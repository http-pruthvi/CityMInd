import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { MOCK_TIMESERIES } from '@/lib/mock/data';
import type { DomainId } from '@/types';

interface RouteParams {
  params: Promise<{ domain: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { domain } = await params;
    const domainId = domain as DomainId;
    
    // Query historical metrics from db
    const dbMetrics = await prisma.metric.findMany({
      where: { domain: domainId },
      orderBy: { recordedAt: 'asc' },
    });

    if (dbMetrics.length > 0) {
      // Group points by metricId
      const seriesMap = new Map();
      
      for (const m of dbMetrics) {
        if (!seriesMap.has(m.metricId)) {
          seriesMap.set(m.metricId, {
            id: m.metricId,
            label: m.metricId.replace(/([A-Z])/g, ' $1'),
            unit: m.unit || '',
            color: '#06b6d4', // Default chart color
            data: [],
          });
        }
        seriesMap.get(m.metricId).data.push({
          timestamp: m.recordedAt.toISOString(),
          value: m.value,
        });
      }
      
      const data = Array.from(seriesMap.values());
      return NextResponse.json({ success: true, data });
    }

    // Fallback to mock data if db is empty for this domain
    const data = MOCK_TIMESERIES[domainId] || [];
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
