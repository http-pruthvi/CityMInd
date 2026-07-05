import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import type { AlertSeverity, AlertStatus, DomainId } from '@/types';

interface AlertWithAssignee {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  domain: string;
  source: string | null;
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  acknowledgedAt: Date | null;
  resolvedAt: Date | null;
  assigneeId: string | null;
  tags: string | null;
  createdAt: Date;
  updatedAt: Date;
  assignee: { name: string } | null;
}

export async function GET() {
  try {
    const dbAlerts = await prisma.alert.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: { select: { name: true } },
      },
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

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
