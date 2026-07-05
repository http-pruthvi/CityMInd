import type { DomainId, Citation } from '@/types';
import { generateGroundedResponse } from '../../rag';
import { 
  DOMAIN_CONFIGS, 
  MOCK_METRICS, 
  MOCK_ALERTS, 
  MOCK_GEO_MARKERS, 
  MOCK_TIMESERIES 
} from '@/lib/mock/data';

export interface DomainAgent {
  handleQuery(query: string, context?: any): Promise<{
    answer: string;
    citations: Citation[];
    suggestedActions?: string[];
    charts?: any[];
    mapData?: any;
  }>;
}

// Factory to create domain agents dynamically with specialized data context and instructions
function createDomainAgent(domain: DomainId): DomainAgent {
  return {
    async handleQuery(query: string, context?: any) {
      // 1. Gather domain-specific live statistics to ground the agent
      const config = DOMAIN_CONFIGS.find(d => d.id === domain);
      const metrics = MOCK_METRICS[domain] || [];
      const alerts = (MOCK_ALERTS || []).filter(a => a.domain === domain && a.status !== 'resolved');
      const markers = MOCK_GEO_MARKERS[domain] || [];
      const timeSeries = MOCK_TIMESERIES[domain] || [];

      // 2. Format as grounding context
      let dataContext = `DOMAIN SUMMARY:
Domain: ${config?.name || domain}
Description: ${config?.description || ''}

LIVE METRICS:
${metrics.map(m => `- ${m.metricId}: Current Value: ${m.value}, Previous Value: ${m.previousValue}, Trend: ${m.trend}, Change: ${m.changePercent}%`).join('\n')}

ACTIVE TICKET/ALERT FEED:
${alerts.map(a => `- [Severity: ${a.severity}] ${a.title} (Status: ${a.status}, Location: ${a.location || 'N/A'})`).join('\n')}

ACTIVE SENSOR MARKERS:
${markers.slice(0, 5).map(m => `- ${m.title} at [${m.lat}, ${m.lng}] (${m.description})`).join('\n')}
`;

      // 3. Run RAG Pipeline
      const grounded = await generateGroundedResponse(query, domain, dataContext);

      // 4. Generate domain-specific suggested actions (workflows)
      const suggestedActions = getSuggestedActionsForDomain(domain, query);

      // 5. Generate domain-specific visual aids (charts or maps)
      const charts = timeSeries.slice(0, 1).map(ts => ({
        type: 'line' as const,
        title: ts.name || ts.label || '',
        data: (ts.points || ts.data || []).slice(-10), // Take recent points
        color: config?.color || '#06b6d4'
      }));

      const mapData = markers.slice(0, 10);

      return {
        answer: grounded.answer,
        citations: grounded.citations,
        suggestedActions,
        charts,
        mapData
      };
    }
  };
}

function getSuggestedActionsForDomain(domain: DomainId, query: string): string[] {
  const lowercase = query.toLowerCase();
  switch (domain) {
    case 'mobility':
      if (lowercase.includes('delay') || lowercase.includes('traffic') || lowercase.includes('bus')) {
        return ['Adjust Traffic Signal Timing', 'Reroute Sector 4 Buses'];
      }
      return ['Deploy Parking Sensor Recalibration', 'Audit Route Schedules'];
    case 'safety':
      return ['Dispatch Smart Patrol Unit', 'Trigger Public Safety Broadcast'];
    case 'health':
      return ['Activate Emergency Green Corridor', 'Deploy Mobile Health Unit'];
    case 'environment':
      return ['Trigger Localized AQI Warning', 'Initiate Sensor Calibration Scan'];
    case 'waste':
      return ['Dispatch Waste Truck Rerouting', 'Raise Illegal Dumping Fine Ticket'];
    case 'energy':
      return ['Initiate Commercial HVAC Load-Shedding', 'Dispatch Grid Maintenance Crew'];
    case 'engagement':
      return ['Auto-route Grievance Ticket', 'Draft Response Template'];
    case 'accessibility':
      return ['Generate Walkway Repair Ticket', 'Approve Accessibility Grant'];
    case 'disaster':
      return ['Activate Flood Siren Broadcast', 'Deploy Community Evacuation Shuttles'];
    case 'tourism':
      return ['Activate Pedestrian Diversions', 'Deploy Digital Signage Campaign'];
    case 'community':
      return ['Approve Social Program Fund Allocation', 'Mobilize Community Volunteers'];
    default:
      return ['Review System Metrics', 'Contact Sector Coordinator'];
  }
}

// Generate the Record containing all 12 domain agents
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
