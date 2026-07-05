import type { DomainId, Citation } from '@/types';
import { chat } from './gemini';

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  domain: DomainId;
  source: string;
}

// Simulated local knowledge base representing city manuals, policy guidelines, and documents
const KNOWLEDGE_BASE: KnowledgeItem[] = [
  // Mobility & Transportation
  {
    id: 'mob-1',
    title: 'Public Transit Scheduling & Route 14 Construction Policy',
    content: 'Route 14 bus schedules are currently under a temporary deviation plan due to the Sector 4 flyover repair work. Standard operating frequency of 10 minutes is reduced to 15 minutes between 5:00 PM and 7:30 PM. The construction is scheduled to finish on October 15, 2026. Alternative routing is through the Bypass Link.',
    domain: 'mobility',
    source: 'Municipal Transit Authority Circular #422',
  },
  {
    id: 'mob-2',
    title: 'Signal Optimization Guidelines (Adaptive Signal Controls)',
    content: 'Adaptive Traffic Signal Control (ATSC) systems deploy real-time vehicle volume sensors to dynamically alter green light cycles. In case of peak congestion (>85% saturation index), the system can extend green light phases by up to 25 seconds for primary arteries. Manual override requires Level 2 operator clearance.',
    domain: 'mobility',
    source: 'Smart Traffic Infrastructure Manual v4.1',
  },
  {
    id: 'mob-3',
    title: 'Smart Parking Rate & Availability Zones',
    content: 'District Central operates under dynamic parking rates. Standard hourly pricing of ₹20/hr increases to ₹40/hr when occupancy exceeds 90% as measured by ground sensors. EV charging bays are restricted to active charging vehicles only, with a ₹100 penalty for parking idle vehicles.',
    domain: 'mobility',
    source: 'City Parking Regulation 2025',
  },

  // Public Safety
  {
    id: 'saf-1',
    title: 'Emergency Medical & Police Dispatch SLAs',
    content: 'Priority 1 (Life-threatening) emergency calls must achieve dispatcher processing under 60 seconds and police unit dispatch under 120 seconds. The target on-scene arrival time for smart patrols in Sector 1 & 2 is 5 minutes. Real-time GPS routing guides police cars to avoid active traffic congestion bottlenecks.',
    domain: 'safety',
    source: 'Emergency Response Services Act (SLA-2024)',
  },
  {
    id: 'saf-2',
    title: 'Crowd Anomaly Detection CCTV Standard Operating Procedures',
    content: 'Automatic CCTV crowd analysis triggers an alert when human density exceeds 4 persons per square meter in public plazas. Operators must visually confirm the alert. In case of verified anomalies, nearby smart patrol units are notified via the mobile terminal, and video feeds are forwarded to dispatcher screens.',
    domain: 'safety',
    source: 'Integrated Safe City Surveillance Protocol',
  },

  // Health
  {
    id: 'hel-1',
    title: 'Ambulance Routing and Priority Dispatching',
    content: 'The Emergency Ambulance Fleet (EAF) utilizes real-time traffic integrations from the Mobility module. When a medical alert is triggered, emergency vehicles are routed through green-light corridors. Green corridors are activated dynamically by changing signal schedules in the route path to green.',
    domain: 'health',
    source: 'Unified Healthcare & First Responder Guidelines',
  },
  {
    id: 'hel-2',
    title: 'Public Health Alert: Air Quality Thresholds',
    content: 'When the localized PM2.5 level exceeds 150 µg/m³ (Unhealthy category) for more than 3 consecutive hours, the health department mandates issuing an alert to public clinics. Community centers must prepare mask distribution desks, and local schools are advised to cancel outdoor physical education activities.',
    domain: 'health',
    source: 'Environmental Health Management Protocol',
  },

  // Education
  {
    id: 'edu-1',
    title: 'Smart Classroom Grant & Attendance Incentive Program',
    content: 'Under the Smart Classroom Initiative, municipal schools with attendance below 85% are eligible for the digital engagement package. This includes tablet-based learning modules and student-progress tracking. High attendance cohorts receive seasonal educational vouchers.',
    domain: 'education',
    source: 'Department of Public Instruction Directive #9',
  },

  // Environment
  {
    id: 'env-1',
    title: 'Air Quality Index (AQI) Calculation Standards',
    content: 'CityMind computes localized AQI using the EPA-standard sub-index formulas for PM2.5, PM10, NO2, CO, and SO2. Measurements are gathered from 148 IoT grid sensors. Sensor drift is calibrated monthly. A reading above 200 triggers an automatic alert to the Pollution Control Board.',
    domain: 'environment',
    source: 'Pollution Control & Telemetry Guidelines',
  },

  // Waste
  {
    id: 'was-1',
    title: 'Dynamic Waste Collection Truck Route Optimization',
    content: 'Smart waste bins report fill-levels via narrow-band IoT. Collection routes are generated nightly. Bins with fill-levels exceeding 75% are prioritized. If a bin exceeds 90% fill-level, an emergency collection ticket is dispatched to the nearest collection vehicle in that sector.',
    domain: 'waste',
    source: 'Municipal Waste Logistics SOP',
  },

  // Energy
  {
    id: 'ene-1',
    title: 'Peak Load Management & Demand Response Policy',
    content: 'During peak summer periods (June-August), demand-response operations encourage commercial buildings to load-shed non-critical HVAC settings. Participating commercial accounts receive 15% billing credits. Residential load-shedding is restricted to high-capacity industrial sectors to protect household supply.',
    domain: 'energy',
    source: 'Smart Grid Load Balancing Act',
  },

  // Engagement
  {
    id: 'eng-1',
    title: '311 Service Ticket Routing & Auto-Triaging Rules',
    content: 'All incoming citizen reports via web, mobile, or voice (311) are parsed by the text classifier. Urgent structural hazards (e.g. open manholes, active water main breaks) must be routed to the respective field engineer within 15 minutes. Non-urgent issues are batched for daily dispatcher review.',
    domain: 'engagement',
    source: 'Citizen Feedback & Grievance Policy',
  },

  // Accessibility
  {
    id: 'acc-1',
    title: 'Sidewalk Maintenance & Accessibility Compliance Act',
    content: 'Municipal walkways must maintain a minimum clear width of 1.2 meters. Sidewalk defects, including vertical displacements exceeding 1.5 cm or cracked paving tiles, are classified as high priority accessibility hazards. Repairs must be initiated within 48 hours of ticket creation.',
    domain: 'accessibility',
    source: 'Accessible Infrastructure Standards (AIS-2025)',
  },

  // Disaster
  {
    id: 'dis-1',
    title: 'Flood Management Action Plan & Shelter Allocation',
    content: 'In response to water level rise in the river basin exceeding the 205.5-meter danger mark, the disaster response agent activates warning sirens in low-lying sectors (Sectors 5, 8). Automated evacuations route residents to designated flood shelters (Community School 3, Sports Complex).',
    domain: 'disaster',
    source: 'Unified Disaster Management Framework',
  },

  // Tourism
  {
    id: 'tou-1',
    title: 'Tourist Foot Traffic Management in Historic Quarters',
    content: 'To prevent severe crowding in the heritage core during holiday seasons, the tourism module monitors GSM density datasets. If tourist presence exceeds 8,000 visitors, pedestrian diversions are activated, and digital street displays reroute incoming sightseers to surrounding markets.',
    domain: 'tourism',
    source: 'Urban Heritage Tourism Strategy',
  },

  // Community
  {
    id: 'com-1',
    title: 'Food Bank Distribution & Welfare Support Mapping',
    content: 'The welfare distribution map overlays household income stats with food bank utilization rates. Areas showing food insecurity indices above 65% are scheduled for mobile pantry visits. Community engagement runs monthly surveys to track local program enrollment statistics.',
    domain: 'community',
    source: 'Social Welfare & Public Pantry Operations',
  },
];

export async function searchKnowledge(query: string, domain?: DomainId): Promise<KnowledgeItem[]> {
  const lowercaseQuery = query.toLowerCase();

  // Basic word matching for local simulation of vector search
  const filtered = domain
    ? KNOWLEDGE_BASE.filter((k) => k.domain === domain)
    : KNOWLEDGE_BASE;

  const scored = filtered.map((item) => {
    let score = 0;
    const words = lowercaseQuery.split(/\s+/);
    for (const word of words) {
      if (word.length < 3) continue;
      if (item.title.toLowerCase().includes(word)) score += 5;
      if (item.content.toLowerCase().includes(word)) score += 2;
    }
    return { item, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.item)
    .slice(0, 3);
}

export async function generateGroundedResponse(
  query: string,
  domain: DomainId,
  contextData?: string
): Promise<{ answer: string; citations: Citation[] }> {
  // 1. Search knowledge base
  const knowledge = await searchKnowledge(query, domain);

  // 2. Format grounding context
  let groundingContext = 'GROUNDING INFORMATION FROM CITY MANUALS:\n';
  if (knowledge.length > 0) {
    knowledge.forEach((k, i) => {
      groundingContext += `[Doc ${i + 1}]: Title: ${k.title}\nSource: ${k.source}\nContent: ${k.content}\n\n`;
    });
  } else {
    groundingContext += 'No specific city policy documents found for this query.\n';
  }

  if (contextData) {
    groundingContext += `LIVE DATABASE METRICS & DATA:\n${contextData}\n\n`;
  }

  const systemPrompt = `
    You are the Domain AI Agent for the ${domain.toUpperCase()} department in CityMind.
    You assist operators and city leaders by answering questions strictly based on the grounding documents provided.
    Always prioritize facts from the grounding documents.
    If you use information from [Doc 1], [Doc 2], etc., cite it inline using [Doc 1] or similar.
    Provide a professional, concise summary. Maintain a confident, decision-intelligence tone.
    Suggest 1 or 2 actionable next steps or workflows.
  `;

  const messages = [
    {
      role: 'user' as const,
      parts: [
        {
          text: `${groundingContext}USER QUESTION: ${query}\n\nAnswer the user's question, integrating facts and data from above and citing them.`,
        },
      ],
    },
  ];

  try {
    const answer = await chat(messages, systemPrompt);

    // Build citations
    const citations: Citation[] = knowledge.map((k) => ({
      title: k.title,
      source: k.source,
      confidence: 0.95,
    }));

    return { answer, citations };
  } catch (error) {
    console.error('Failed to generate grounded response:', error);
    return {
      answer: `Unable to process grounded query. Fallback information: Based on standard operating guidelines, please check the ${domain} configuration files directly.`,
      citations: [],
    };
  }
}
