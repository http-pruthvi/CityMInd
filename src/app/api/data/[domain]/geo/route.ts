import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { MOCK_GEO_MARKERS } from '@/lib/mock/data';
import type { DomainId, AlertSeverity, GeoMarker } from '@/types';

interface RouteParams {
  params: Promise<{ domain: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { domain } = await params;
    const domainId = domain as DomainId;

    // 1. Fetch alerts from DB that have geolocation
    const dbAlerts = await prisma.alert.findMany({
      where: {
        domain: domainId,
        latitude: { not: null },
        longitude: { not: null },
      },
    });

    // 2. Fetch citizen reports from DB that match the category
    // In our seed, citizen report categories are like "pothole", "streetlight", etc.
    // Let's query category matching the domain (or all if empty)
    const dbReports = await prisma.citizenReport.findMany({
      where: {
        category: domainId === 'mobility' ? 'pothole' : 
                  domainId === 'safety' ? 'safety' : 
                  domainId === 'waste' ? 'garbage' : undefined,
      },
    });

    const dbMarkers: GeoMarker[] = [];

    // Map Alerts to GeoMarkers
    dbAlerts.forEach((alert) => {
      dbMarkers.push({
        id: alert.id,
        lat: alert.latitude!,
        lng: alert.longitude!,
        type: 'alert',
        title: alert.title,
        description: alert.description,
        severity: alert.severity as AlertSeverity,
        domain: alert.domain as DomainId,
        status: alert.status,
        timestamp: alert.createdAt.toISOString(),
      });
    });

    // Map Citizen Reports to GeoMarkers
    dbReports.forEach((report) => {
      dbMarkers.push({
        id: report.id,
        lat: report.latitude,
        lng: report.longitude,
        type: 'report',
        title: report.title,
        description: report.description,
        severity: (report.priority || 'medium') as AlertSeverity,
        domain: domainId,
        status: report.status,
        timestamp: report.createdAt.toISOString(),
      });
    });

    // Combine DB markers and fallback to mock markers if empty (mock markers have rich sensors/assets)
    const mockMarkers = MOCK_GEO_MARKERS[domainId] || [];
    const data = [...dbMarkers, ...mockMarkers];

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
