import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import type { Prisma } from '@prisma/client';
import type { DomainId, AlertSeverity, AlertStatus } from '@/types';

type AlertWithAssignee = Prisma.AlertGetPayload<{
  include: { assignee: { select: { name: true } } };
}>;

interface RouteParams {
  params: Promise<{ domain: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { domain } = await params;
    const domainId = domain as DomainId;
    
    // Query live database alerts
    const dbAlerts = await prisma.alert.findMany({
      where: { domain: domainId },
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: {
          select: { name: true }
        }
      }
    });

    const data = dbAlerts.map((alert: AlertWithAssignee) => ({
      id: alert.id,
      title: alert.title,
      description: alert.description,
      severity: alert.severity as AlertSeverity,
      status: alert.status as AlertStatus,
      domain: alert.domain as DomainId,
      location:
        alert.latitude != null && alert.longitude != null
          ? {
              lat: alert.latitude,
              lng: alert.longitude,
              name: alert.locationName || undefined,
            }
          : undefined,
      locationName: alert.locationName || undefined,
      timestamp: alert.createdAt.toISOString(),
      createdAt: alert.createdAt.toISOString(),
      updatedAt: alert.updatedAt.toISOString(),
      assignee: alert.assigneeId || undefined,
      assigneeName: alert.assignee?.name || undefined,
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
