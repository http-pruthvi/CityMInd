import type { DomainId, Citation } from '@/types';
import { generateGroundedResponse } from '../../rag';
import { DOMAIN_CONFIGS } from '@/lib/mock/data';
import { prisma } from '@/lib/db/prisma';

export interface DomainAgent {
  handleQuery(query: string, context?: unknown): Promise<{
    answer: string;
    citations: Citation[];
    sources?: string[];
    suggestedActions?: string[];
    charts?: unknown[];
    mapData?: unknown;
  }>;
}

async function getLiveDomainContext(domain: DomainId): Promise<string> {
  const config = DOMAIN_CONFIGS.find((d) => d.id === domain);

  const [metrics, alerts, geoAlerts] = await Promise.all([
    prisma.metric.findMany({
      where: { domain },
      orderBy: { recordedAt: 'desc' },
      take: 20,
    }),
    prisma.alert.findMany({
      where: { domain, status: { not: 'resolved' } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.alert.findMany({
      where: { domain, latitude: { not: null }, longitude: { not: null } },
      take: 5,
    }),
  ]);

  const latestMetrics = new Map<string, (typeof metrics)[0]>();
  for (const m of metrics) {
    if (!latestMetrics.has(m.metricId)) latestMetrics.set(m.metricId, m);
  }

  return `DOMAIN SUMMARY:
Domain: ${config?.name || domain}
Description: ${config?.description || ''}

LIVE METRICS (from database):
${Array.from(latestMetrics.values()).length === 0
  ? '- No metrics recorded yet.'
  : Array.from(latestMetrics.values())
      .map((m) => `- ${m.metricId}: ${m.value}${m.unit ? ` ${m.unit}` : ''} (trend: ${m.trend})`)
      .join('\n')}

ACTIVE ALERTS (from database):
${alerts.length === 0
  ? '- No active alerts.'
  : alerts
      .map((a) => `- [${a.severity}] ${a.title} (${a.status})`)
      .join('\n')}

GEOLOCATED INCIDENTS:
${geoAlerts.length === 0
  ? '- None with coordinates.'
  : geoAlerts
      .map((a) => `- ${a.title} at [${a.latitude}, ${a.longitude}]`)
      .join('\n')}
`;
}

function createDomainAgent(domain: DomainId): DomainAgent {
  return {
    async handleQuery(query: string) {
      const config = DOMAIN_CONFIGS.find((d) => d.id === domain);
      const dataContext = await getLiveDomainContext(domain);
      const grounded = await generateGroundedResponse(query, domain, dataContext);

      const [dbAlerts, dbGeo] = await Promise.all([
        prisma.alert.findMany({
          where: { domain, status: { not: 'resolved' } },
          take: 3,
        }),
        prisma.alert.findMany({
          where: { domain, latitude: { not: null }, longitude: { not: null } },
          take: 10,
        }),
      ]);

      const sources = [
        ...grounded.citations.map((c) => `Policy: ${c.title} (${c.source})`),
        ...dbAlerts.map((a) => `Alert: [${a.severity}] ${a.title}`),
      ];

      const mapData =
        dbGeo.length > 0
          ? dbGeo.map((a) => ({
              id: a.id,
              lat: a.latitude!,
              lng: a.longitude!,
              type: 'alert',
              title: a.title,
              description: a.description,
              severity: a.severity,
              domain,
              status: a.status,
            }))
          : [];

      return {
        answer: grounded.answer,
        citations: grounded.citations,
        sources,
        suggestedActions: getSuggestedActionsForDomain(domain, query),
        charts: [],
        mapData,
      };
    },
  };
}

function getSuggestedActionsForDomain(domain: DomainId, query: string): string[] {
  const lowercase = query.toLowerCase();
  switch (domain) {
    case 'mobility':
      if (lowercase.includes('delay') || lowercase.includes('traffic') || lowercase.includes('bus')) {
        return ['Review traffic signal timing', 'Check transit route schedules'];
      }
      return ['Review mobility metrics', 'Audit route data'];
    case 'safety':
      return ['Review active safety alerts', 'Check response times'];
    case 'environment':
      return ['Review air quality readings', 'Check sensor status'];
    default:
      return ['Review domain metrics', 'Check active alerts'];
  }
}

export const domainAgents: Record<DomainId, DomainAgent> = {
  mobility: createDomainAgent('mobility'),
  safety: createDomainAgent('safety'),
  health: createDomainAgent('health'),
  education: createDomainAgent('education'),
  environment: createDomainAgent('environment'),
  waste: createDomainAgent('waste'),
  energy: createDomainAgent('energy'),
  engagement: createDomainAgent('engagement'),
  accessibility: createDomainAgent('accessibility'),
  disaster: createDomainAgent('disaster'),
  tourism: createDomainAgent('tourism'),
  community: createDomainAgent('community'),
};
