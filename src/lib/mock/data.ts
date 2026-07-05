import type {
  DomainId, DomainConfig, MetricValue, TimeSeriesData,
  GeoMarker, Alert, Workflow, CityService, CityStatsData,
  WorkflowStep,
} from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE_LAT = 28.6139;
const BASE_LNG = 77.2090;
const now = () => new Date().toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();
const jitter = (base: number, pct = 0.05) => base + base * (Math.random() * pct * 2 - pct);
const geoJitter = (base: number, spread = 0.06) => base + (Math.random() * spread * 2 - spread);

let _seqId = 0;
const uid = (prefix: string) => `${prefix}_${(++_seqId).toString(36).padStart(4, '0')}`;

// ─── 1. DOMAIN_CONFIGS ────────────────────────────────────────────────────────

export const DOMAIN_CONFIGS: DomainConfig[] = [
  {
    id: 'mobility',
    name: 'Mobility & Transport',
    description: 'Traffic management, public transit, ride-sharing, and urban mobility analytics',
    icon: 'Bus',
    color: '#3B82F6',
    metrics: ['Avg Commute Time', 'Transit Ridership', 'Traffic Incidents', 'On-Time Rate'],
  },
  {
    id: 'safety',
    name: 'Public Safety',
    description: 'Law enforcement, emergency response, surveillance, and crime analytics',
    icon: 'ShieldCheck',
    color: '#EF4444',
    metrics: ['Active Incidents', 'Avg Response Time', 'Crime Rate Change', 'Resolved Cases'],
  },
  {
    id: 'health',
    name: 'Public Health',
    description: 'Healthcare facilities, disease surveillance, emergency medical services',
    icon: 'HeartPulse',
    color: '#EC4899',
    metrics: ['ER Wait Time', 'Clinic Utilization', 'Vaccinations Today', 'Ambulance Availability'],
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Schools, universities, digital learning, enrollment, and performance analytics',
    icon: 'GraduationCap',
    color: '#8B5CF6',
    metrics: ['Enrollment Rate', 'Attendance Rate', 'Digital Access', 'Dropout Rate'],
  },
  {
    id: 'environment',
    name: 'Environment',
    description: 'Air quality, water quality, green cover, noise levels, and pollution monitoring',
    icon: 'Leaf',
    color: '#22C55E',
    metrics: ['AQI', 'PM2.5 Level', 'Green Cover', 'Water Quality Index'],
  },
  {
    id: 'waste',
    name: 'Waste Management',
    description: 'Solid waste collection, recycling, landfill management, and waste-to-energy',
    icon: 'Trash2',
    color: '#F59E0B',
    metrics: ['Collection Rate', 'Recycling Rate', 'Landfill Capacity', 'Complaints Pending'],
  },
  {
    id: 'energy',
    name: 'Energy & Utilities',
    description: 'Power grid, renewable energy, water supply, and smart metering',
    icon: 'Zap',
    color: '#F97316',
    metrics: ['Grid Load', 'Solar Generation', 'Outage Count', 'Renewable Share'],
  },
  {
    id: 'engagement',
    name: 'Citizen Engagement',
    description: 'Grievance redressal, feedback, participatory budgeting, public consultations',
    icon: 'Users',
    color: '#06B6D4',
    metrics: ['Open Grievances', 'Avg Resolution Time', 'Satisfaction Score', 'Participation Rate'],
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    description: 'Universal access, disability infrastructure, inclusive design compliance',
    icon: 'Accessibility',
    color: '#6366F1',
    metrics: ['Compliant Facilities', 'Ramp Coverage', 'Accessible Transit', 'Pending Audits'],
  },
  {
    id: 'disaster',
    name: 'Disaster Management',
    description: 'Early warning systems, evacuation planning, flood and earthquake preparedness',
    icon: 'AlertTriangle',
    color: '#DC2626',
    metrics: ['Active Warnings', 'Shelter Capacity', 'Response Teams Ready', 'Drills Completed'],
  },
  {
    id: 'tourism',
    name: 'Tourism & Heritage',
    description: 'Tourist footfall, heritage conservation, hospitality analytics, event management',
    icon: 'Landmark',
    color: '#D946EF',
    metrics: ['Tourist Footfall', 'Hotel Occupancy', 'Heritage Sites Monitored', 'Revenue (Cr)'],
  },
  {
    id: 'community',
    name: 'Community Development',
    description: 'Social welfare, skill development, livelihood programs, community centers',
    icon: 'Building2',
    color: '#14B8A6',
    metrics: ['Active Programs', 'Beneficiaries', 'Skill Training Enrolled', 'Community Centers'],
  },
];

// ─── 2. MOCK_METRICS ──────────────────────────────────────────────────────────

export const MOCK_METRICS: Record<DomainId, MetricValue[]> = {
  mobility: [
    { id: uid('m'), label: 'Avg Commute Time', value: 28, unit: 'min', change: -3.2, changeDirection: 'down', status: 'good', sparkline: [32, 31, 30, 29, 28, 29, 28, 27, 28, 28] },
    { id: uid('m'), label: 'Transit Ridership', value: 142000, unit: 'passengers', change: 5.1, changeDirection: 'up', status: 'good', sparkline: [130000, 132000, 135000, 138000, 140000, 141000, 142000, 142500, 142000, 142000] },
    { id: uid('m'), label: 'Traffic Incidents', value: 12, unit: 'incidents', change: -15, changeDirection: 'down', status: 'warning', sparkline: [18, 15, 14, 16, 13, 12, 11, 14, 12, 12] },
    { id: uid('m'), label: 'On-Time Rate', value: 87, unit: '%', change: 2.4, changeDirection: 'up', status: 'good', sparkline: [82, 83, 84, 85, 86, 85, 87, 86, 87, 87] },
    { id: uid('m'), label: 'Active Bus Routes', value: 348, unit: 'routes', change: 1.2, changeDirection: 'up', status: 'good', sparkline: [340, 342, 344, 345, 346, 347, 348, 348, 348, 348] },
  ],
  safety: [
    { id: uid('m'), label: 'Active Incidents', value: 23, unit: 'incidents', change: -12, changeDirection: 'down', status: 'warning', sparkline: [30, 28, 27, 26, 25, 24, 23, 24, 23, 23] },
    { id: uid('m'), label: 'Avg Response Time', value: 4.2, unit: 'min', change: -8.7, changeDirection: 'down', status: 'good', sparkline: [5.1, 4.9, 4.8, 4.6, 4.5, 4.4, 4.3, 4.2, 4.2, 4.2] },
    { id: uid('m'), label: 'Crime Rate Change', value: -8, unit: '%', change: -8, changeDirection: 'down', status: 'good', sparkline: [-2, -3, -4, -5, -5, -6, -7, -7, -8, -8] },
    { id: uid('m'), label: 'Resolved Cases', value: 94, unit: '%', change: 3.3, changeDirection: 'up', status: 'good', sparkline: [88, 89, 90, 91, 92, 92, 93, 93, 94, 94] },
    { id: uid('m'), label: 'CCTV Cameras Online', value: 4820, unit: 'cameras', change: 0.8, changeDirection: 'up', status: 'good', sparkline: [4750, 4770, 4780, 4790, 4800, 4810, 4815, 4820, 4820, 4820] },
  ],
  health: [
    { id: uid('m'), label: 'ER Wait Time', value: 34, unit: 'min', change: -5.6, changeDirection: 'down', status: 'warning', sparkline: [40, 38, 37, 36, 35, 35, 34, 34, 34, 34] },
    { id: uid('m'), label: 'Clinic Utilization', value: 78, unit: '%', change: 2.1, changeDirection: 'up', status: 'good', sparkline: [72, 73, 74, 75, 76, 76, 77, 78, 78, 78] },
    { id: uid('m'), label: 'Vaccinations Today', value: 1240, unit: 'doses', change: 12.5, changeDirection: 'up', status: 'good', sparkline: [980, 1020, 1050, 1100, 1120, 1150, 1180, 1200, 1220, 1240] },
    { id: uid('m'), label: 'Ambulance Availability', value: 89, unit: '%', change: 1.8, changeDirection: 'up', status: 'good', sparkline: [84, 85, 86, 86, 87, 88, 88, 89, 89, 89] },
    { id: uid('m'), label: 'ICU Beds Available', value: 142, unit: 'beds', change: -4.1, changeDirection: 'down', status: 'warning', sparkline: [160, 158, 155, 152, 150, 148, 146, 144, 143, 142] },
  ],
  education: [
    { id: uid('m'), label: 'Enrollment Rate', value: 96.4, unit: '%', change: 1.2, changeDirection: 'up', status: 'good', sparkline: [94, 94.5, 95, 95.2, 95.5, 95.8, 96, 96.2, 96.3, 96.4] },
    { id: uid('m'), label: 'Attendance Rate', value: 88.7, unit: '%', change: 0.8, changeDirection: 'up', status: 'good', sparkline: [86, 86.5, 87, 87.2, 87.5, 87.8, 88, 88.3, 88.5, 88.7] },
    { id: uid('m'), label: 'Digital Access', value: 72, unit: '%', change: 4.3, changeDirection: 'up', status: 'warning', sparkline: [62, 64, 65, 67, 68, 69, 70, 71, 71, 72] },
    { id: uid('m'), label: 'Dropout Rate', value: 3.6, unit: '%', change: -12, changeDirection: 'down', status: 'good', sparkline: [5.2, 4.9, 4.6, 4.4, 4.2, 4.0, 3.9, 3.8, 3.7, 3.6] },
    { id: uid('m'), label: 'Schools Connected', value: 1842, unit: 'schools', change: 2.1, changeDirection: 'up', status: 'good', sparkline: [1750, 1770, 1790, 1800, 1810, 1820, 1830, 1835, 1840, 1842] },
  ],
  environment: [
    { id: uid('m'), label: 'AQI', value: 87, unit: 'index', change: -6.5, changeDirection: 'down', status: 'warning', sparkline: [110, 105, 100, 98, 95, 92, 90, 89, 88, 87] },
    { id: uid('m'), label: 'PM2.5 Level', value: 42.3, unit: 'µg/m³', change: -8.2, changeDirection: 'down', status: 'warning', sparkline: [55, 52, 50, 48, 46, 45, 44, 43, 42.5, 42.3] },
    { id: uid('m'), label: 'Green Cover', value: 21.4, unit: '%', change: 0.3, changeDirection: 'up', status: 'good', sparkline: [20.5, 20.6, 20.7, 20.8, 20.9, 21.0, 21.1, 21.2, 21.3, 21.4] },
    { id: uid('m'), label: 'Water Quality Index', value: 74, unit: 'index', change: 2.8, changeDirection: 'up', status: 'good', sparkline: [68, 69, 70, 71, 72, 72, 73, 73, 74, 74] },
    { id: uid('m'), label: 'Noise Violations', value: 18, unit: 'incidents', change: -10, changeDirection: 'down', status: 'good', sparkline: [24, 22, 21, 20, 19, 19, 18, 18, 18, 18] },
  ],
  waste: [
    { id: uid('m'), label: 'Collection Rate', value: 92, unit: '%', change: 1.5, changeDirection: 'up', status: 'good', sparkline: [87, 88, 89, 89, 90, 90, 91, 91, 92, 92] },
    { id: uid('m'), label: 'Recycling Rate', value: 34, unit: '%', change: 4.6, changeDirection: 'up', status: 'warning', sparkline: [28, 29, 30, 30, 31, 32, 32, 33, 33, 34] },
    { id: uid('m'), label: 'Landfill Capacity', value: 62, unit: '%', change: -2.1, changeDirection: 'down', status: 'warning', sparkline: [70, 69, 68, 67, 66, 65, 64, 63, 63, 62] },
    { id: uid('m'), label: 'Complaints Pending', value: 47, unit: 'tickets', change: -18, changeDirection: 'down', status: 'good', sparkline: [72, 68, 64, 60, 56, 54, 52, 50, 48, 47] },
  ],
  energy: [
    { id: uid('m'), label: 'Grid Load', value: 3420, unit: 'MW', change: 2.3, changeDirection: 'up', status: 'good', sparkline: [3200, 3250, 3280, 3310, 3340, 3360, 3380, 3400, 3410, 3420] },
    { id: uid('m'), label: 'Solar Generation', value: 480, unit: 'MW', change: 8.1, changeDirection: 'up', status: 'good', sparkline: [380, 400, 410, 420, 430, 440, 450, 460, 470, 480] },
    { id: uid('m'), label: 'Outage Count', value: 3, unit: 'outages', change: -40, changeDirection: 'down', status: 'good', sparkline: [8, 7, 6, 5, 5, 4, 4, 3, 3, 3] },
    { id: uid('m'), label: 'Renewable Share', value: 28, unit: '%', change: 3.7, changeDirection: 'up', status: 'good', sparkline: [22, 23, 24, 24, 25, 26, 26, 27, 27, 28] },
    { id: uid('m'), label: 'T&D Losses', value: 14.2, unit: '%', change: -5.3, changeDirection: 'down', status: 'warning', sparkline: [18, 17.5, 17, 16.5, 16, 15.5, 15, 14.8, 14.5, 14.2] },
  ],
  engagement: [
    { id: uid('m'), label: 'Open Grievances', value: 312, unit: 'tickets', change: -8.2, changeDirection: 'down', status: 'good', sparkline: [380, 365, 350, 340, 335, 330, 325, 320, 315, 312] },
    { id: uid('m'), label: 'Avg Resolution Time', value: 4.8, unit: 'days', change: -12.7, changeDirection: 'down', status: 'good', sparkline: [6.5, 6.2, 5.9, 5.7, 5.5, 5.3, 5.1, 5.0, 4.9, 4.8] },
    { id: uid('m'), label: 'Satisfaction Score', value: 4.1, unit: '/5', change: 3.8, changeDirection: 'up', status: 'good', sparkline: [3.6, 3.7, 3.8, 3.8, 3.9, 3.9, 4.0, 4.0, 4.1, 4.1] },
    { id: uid('m'), label: 'Participation Rate', value: 18.4, unit: '%', change: 15.6, changeDirection: 'up', status: 'warning', sparkline: [12, 13, 14, 14.5, 15, 15.5, 16, 17, 17.5, 18.4] },
  ],
  accessibility: [
    { id: uid('m'), label: 'Compliant Facilities', value: 68, unit: '%', change: 4.6, changeDirection: 'up', status: 'warning', sparkline: [58, 60, 61, 62, 63, 64, 65, 66, 67, 68] },
    { id: uid('m'), label: 'Ramp Coverage', value: 74, unit: '%', change: 3.1, changeDirection: 'up', status: 'warning', sparkline: [65, 66, 67, 68, 69, 70, 71, 72, 73, 74] },
    { id: uid('m'), label: 'Accessible Transit', value: 56, unit: '%', change: 5.7, changeDirection: 'up', status: 'warning', sparkline: [45, 47, 48, 49, 50, 51, 52, 53, 55, 56] },
    { id: uid('m'), label: 'Pending Audits', value: 28, unit: 'audits', change: -22, changeDirection: 'down', status: 'good', sparkline: [45, 42, 40, 38, 35, 33, 31, 30, 29, 28] },
  ],
  disaster: [
    { id: uid('m'), label: 'Active Warnings', value: 2, unit: 'warnings', change: 0, changeDirection: 'flat', status: 'warning', sparkline: [0, 0, 1, 1, 1, 2, 2, 2, 2, 2] },
    { id: uid('m'), label: 'Shelter Capacity', value: 85000, unit: 'persons', change: 2.4, changeDirection: 'up', status: 'good', sparkline: [80000, 81000, 82000, 82500, 83000, 83500, 84000, 84500, 85000, 85000] },
    { id: uid('m'), label: 'Response Teams Ready', value: 42, unit: 'teams', change: 5.0, changeDirection: 'up', status: 'good', sparkline: [36, 37, 38, 38, 39, 40, 40, 41, 41, 42] },
    { id: uid('m'), label: 'Drills Completed', value: 18, unit: 'drills', change: 28.6, changeDirection: 'up', status: 'good', sparkline: [10, 11, 12, 13, 14, 14, 15, 16, 17, 18] },
  ],
  tourism: [
    { id: uid('m'), label: 'Tourist Footfall', value: 48200, unit: 'visitors', change: 12.3, changeDirection: 'up', status: 'good', sparkline: [38000, 40000, 42000, 43000, 44000, 45000, 46000, 47000, 47500, 48200] },
    { id: uid('m'), label: 'Hotel Occupancy', value: 76, unit: '%', change: 8.6, changeDirection: 'up', status: 'good', sparkline: [65, 67, 68, 70, 71, 72, 73, 74, 75, 76] },
    { id: uid('m'), label: 'Heritage Sites Monitored', value: 142, unit: 'sites', change: 1.4, changeDirection: 'up', status: 'good', sparkline: [135, 136, 137, 138, 139, 140, 140, 141, 141, 142] },
    { id: uid('m'), label: 'Revenue (Cr)', value: 24.8, unit: '₹ Cr', change: 15.8, changeDirection: 'up', status: 'good', sparkline: [18, 19, 20, 21, 21.5, 22, 22.5, 23.5, 24, 24.8] },
  ],
  community: [
    { id: uid('m'), label: 'Active Programs', value: 156, unit: 'programs', change: 4.7, changeDirection: 'up', status: 'good', sparkline: [140, 142, 144, 146, 148, 150, 152, 153, 155, 156] },
    { id: uid('m'), label: 'Beneficiaries', value: 284000, unit: 'citizens', change: 6.3, changeDirection: 'up', status: 'good', sparkline: [250000, 255000, 260000, 265000, 270000, 274000, 278000, 280000, 282000, 284000] },
    { id: uid('m'), label: 'Skill Training Enrolled', value: 12400, unit: 'trainees', change: 9.7, changeDirection: 'up', status: 'good', sparkline: [9800, 10200, 10500, 10800, 11000, 11300, 11600, 11900, 12200, 12400] },
    { id: uid('m'), label: 'Community Centers', value: 86, unit: 'centers', change: 2.4, changeDirection: 'up', status: 'good', sparkline: [78, 79, 80, 81, 82, 83, 84, 85, 85, 86] },
  ],
};

// ─── 3. MOCK_TIMESERIES ───────────────────────────────────────────────────────

function generateHourlySeries(
  label: string,
  unit: string,
  color: string,
  basePattern: number[],
  noise = 0.05,
): TimeSeriesData {
  const data = basePattern.map((val, i) => ({
    timestamp: new Date(Date.now() - (basePattern.length - 1 - i) * 3600_000).toISOString(),
    value: Math.round(jitter(val, noise) * 100) / 100,
  }));
  return { id: uid('ts'), label, unit, color, data };
}

function generateDailySeries(
  label: string,
  unit: string,
  color: string,
  baseValues: number[],
  noise = 0.03,
): TimeSeriesData {
  const data = baseValues.map((val, i) => ({
    timestamp: new Date(Date.now() - (baseValues.length - 1 - i) * 86_400_000).toISOString(),
    value: Math.round(jitter(val, noise) * 100) / 100,
  }));
  return { id: uid('ts'), label, unit, color, data };
}

// Traffic volume: peaks at 8am & 5pm
const trafficPattern = [
  120, 80, 60, 45, 40, 55, 180, 420, 680, 580, 450, 400,
  380, 360, 350, 380, 520, 710, 620, 480, 350, 280, 220, 160,
];

// Transit ridership: similar pattern, different scale
const transitPattern = [
  2800, 1800, 1200, 900, 800, 1400, 5200, 12400, 18600, 14200, 10500, 9200,
  8800, 8200, 8000, 8800, 14000, 19200, 16800, 12200, 8600, 6400, 4800, 3600,
];

// AQI: higher in morning/evening, lower midday
const aqiPattern = [
  95, 92, 88, 85, 82, 80, 78, 82, 90, 96, 100, 98,
  92, 88, 84, 80, 78, 82, 88, 95, 102, 108, 105, 100,
];

// PM2.5: correlated with AQI
const pm25Pattern = aqiPattern.map(v => Math.round(v * 0.48));

// Solar generation: bell curve peaking midday
const solarPattern = [
  0, 0, 0, 0, 0, 5, 45, 120, 240, 340, 410, 460,
  480, 470, 440, 380, 290, 180, 80, 20, 0, 0, 0, 0,
];

// Grid load: commercial + residential pattern
const gridLoadPattern = [
  2100, 1980, 1900, 1850, 1820, 1900, 2200, 2800, 3200, 3400, 3500, 3520,
  3480, 3420, 3380, 3350, 3400, 3550, 3600, 3480, 3200, 2900, 2600, 2300,
];

// ER visits per hour
const erPattern = [
  12, 8, 6, 5, 4, 5, 8, 14, 22, 28, 32, 35,
  34, 30, 28, 26, 24, 22, 25, 28, 30, 26, 20, 16,
];

// Waste collection trucks active
const wastePattern = [
  2, 2, 2, 2, 4, 18, 42, 56, 62, 58, 52, 48,
  44, 52, 56, 48, 38, 28, 18, 10, 6, 4, 2, 2,
];

export const MOCK_TIMESERIES: Record<DomainId, TimeSeriesData[]> = {
  mobility: [
    generateHourlySeries('Traffic Volume', 'vehicles/hr', '#3B82F6', trafficPattern),
    generateHourlySeries('Transit Ridership', 'passengers/hr', '#60A5FA', transitPattern),
    generateDailySeries('Avg Speed (km/h)', 'km/h', '#93C5FD', [28, 27, 29, 30, 28, 26, 31, 29, 28, 27, 30, 29, 28, 28]),
  ],
  safety: [
    generateHourlySeries('Emergency Calls', 'calls/hr', '#EF4444', [8, 5, 4, 3, 3, 4, 6, 10, 14, 16, 18, 20, 22, 20, 18, 16, 14, 12, 14, 16, 18, 15, 12, 10]),
    generateDailySeries('Incidents Reported', 'incidents', '#F87171', [45, 42, 38, 41, 39, 36, 35, 33, 34, 32, 30, 28, 27, 23]),
    generateDailySeries('Patrol Coverage', '%', '#FCA5A5', [82, 84, 85, 83, 86, 87, 88, 85, 86, 88, 89, 90, 91, 92]),
  ],
  health: [
    generateHourlySeries('ER Visits', 'patients/hr', '#EC4899', erPattern),
    generateDailySeries('COVID Tests', 'tests', '#F472B6', [3200, 3400, 3100, 3500, 3600, 3800, 3750, 3900, 4000, 4100, 3950, 4200, 4100, 4050]),
    generateDailySeries('Bed Occupancy', '%', '#F9A8D4', [72, 74, 75, 76, 78, 79, 80, 78, 77, 76, 78, 79, 78, 78]),
  ],
  education: [
    generateDailySeries('Daily Attendance', '%', '#8B5CF6', [91, 89, 90, 88, 87, 45, 42, 92, 91, 90, 89, 88, 46, 44, 91, 90, 89, 91, 90, 47, 43]),
    generateDailySeries('E-Learning Sessions', 'sessions', '#A78BFA', [1800, 1900, 2000, 1950, 2100, 800, 750, 2200, 2150, 2300, 2250, 2400, 850, 780]),
    generateDailySeries('Library Checkouts', 'books', '#C4B5FD', [420, 440, 460, 450, 480, 320, 280, 490, 500, 510, 520, 530, 340, 300]),
  ],
  environment: [
    generateHourlySeries('AQI', 'index', '#22C55E', aqiPattern),
    generateHourlySeries('PM2.5', 'µg/m³', '#4ADE80', pm25Pattern),
    generateDailySeries('Temperature', '°C', '#86EFAC', [32, 33, 34, 35, 36, 37, 38, 37, 36, 35, 34, 33, 32, 31]),
  ],
  waste: [
    generateHourlySeries('Active Collection Trucks', 'trucks', '#F59E0B', wastePattern),
    generateDailySeries('Waste Collected', 'tonnes', '#FBBF24', [4200, 4300, 4100, 4400, 4500, 3800, 3200, 4600, 4500, 4700, 4400, 4800, 3900, 3300]),
    generateDailySeries('Recycling Volume', 'tonnes', '#FCD34D', [1400, 1450, 1380, 1500, 1520, 1280, 1100, 1550, 1530, 1600, 1480, 1620, 1310, 1120]),
  ],
  energy: [
    generateHourlySeries('Grid Load', 'MW', '#F97316', gridLoadPattern),
    generateHourlySeries('Solar Generation', 'MW', '#FB923C', solarPattern),
    generateDailySeries('Peak Demand', 'MW', '#FDBA74', [3500, 3520, 3480, 3550, 3600, 3420, 3380, 3580, 3600, 3620, 3580, 3650, 3450, 3400]),
  ],
  engagement: [
    generateDailySeries('Grievances Filed', 'tickets', '#06B6D4', [85, 92, 78, 95, 88, 42, 38, 90, 87, 94, 82, 96, 45, 40]),
    generateDailySeries('Grievances Resolved', 'tickets', '#22D3EE', [72, 80, 68, 82, 75, 35, 30, 78, 74, 81, 70, 83, 38, 32]),
    generateDailySeries('App Active Users', 'users', '#67E8F9', [14200, 14800, 15100, 15400, 15600, 8200, 7800, 15800, 16000, 16200, 16400, 16800, 8500, 8100]),
  ],
  accessibility: [
    generateDailySeries('Audits Completed', 'audits', '#6366F1', [3, 4, 5, 3, 4, 0, 0, 5, 4, 6, 3, 5, 0, 0]),
    generateDailySeries('Complaints Received', 'complaints', '#818CF8', [8, 6, 7, 9, 5, 3, 2, 7, 8, 6, 5, 9, 4, 2]),
    generateDailySeries('Facilities Upgraded', 'facilities', '#A5B4FC', [2, 3, 1, 4, 2, 0, 0, 3, 2, 4, 1, 3, 0, 0]),
  ],
  disaster: [
    generateHourlySeries('Sensor Alerts', 'alerts/hr', '#DC2626', [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]),
    generateDailySeries('Shelter Readiness', '%', '#F87171', [92, 93, 94, 93, 95, 95, 94, 96, 95, 97, 96, 98, 97, 98]),
    generateDailySeries('Volunteer Registrations', 'people', '#FCA5A5', [120, 135, 142, 148, 155, 160, 168, 175, 180, 188, 192, 200, 208, 215]),
  ],
  tourism: [
    generateDailySeries('Daily Footfall', 'visitors', '#D946EF', [42000, 44000, 45000, 43000, 46000, 52000, 54000, 41000, 43000, 44000, 45000, 47000, 53000, 55000]),
    generateDailySeries('Hotel Bookings', 'bookings', '#E879F9', [3200, 3400, 3300, 3500, 3600, 4200, 4500, 3100, 3300, 3400, 3500, 3700, 4300, 4600]),
    generateDailySeries('Revenue', '₹ Lakhs', '#F0ABFC', [180, 190, 185, 195, 200, 240, 260, 175, 185, 190, 195, 205, 245, 265]),
  ],
  community: [
    generateDailySeries('Program Attendance', 'participants', '#14B8A6', [2800, 2900, 3000, 2850, 3100, 1200, 1100, 3200, 3100, 3300, 3000, 3400, 1300, 1150]),
    generateDailySeries('New Registrations', 'registrations', '#2DD4BF', [85, 92, 88, 95, 90, 45, 40, 98, 94, 100, 92, 105, 48, 42]),
    generateDailySeries('Welfare Disbursements', '₹ Lakhs', '#5EEAD4', [42, 38, 45, 40, 48, 15, 12, 50, 44, 52, 46, 55, 18, 14]),
  ],
};

// ─── 4. MOCK_GEO_MARKERS ─────────────────────────────────────────────────────

export const MOCK_GEO_MARKERS: Record<DomainId, GeoMarker[]> = {
  mobility: [
    { id: uid('geo'), lat: geoJitter(BASE_LAT), lng: geoJitter(BASE_LNG), title: 'ITO Junction Congestion', description: 'Heavy congestion due to metro construction work. Avg speed 8 km/h.', type: 'congestion', severity: 'high', status: 'active', domain: 'mobility', timestamp: hoursAgo(0.5) },
    { id: uid('geo'), lat: 28.6328, lng: 77.2197, title: 'ISBT Kashmere Gate Terminal', description: 'Major interstate bus terminal. 1,200 buses/day.', type: 'transit_hub', severity: 'low', status: 'active', domain: 'mobility', timestamp: hoursAgo(1) },
    { id: uid('geo'), lat: 28.5921, lng: 77.2290, title: 'Lodhi Road Accident', description: 'Two-vehicle collision near Lodhi Garden. One lane blocked.', type: 'incident', severity: 'medium', status: 'active', domain: 'mobility', timestamp: hoursAgo(0.3) },
    { id: uid('geo'), lat: 28.6431, lng: 77.1899, title: 'Chandni Chowk Pedestrian Zone', description: 'Pedestrian-only zone active. Traffic diverted.', type: 'zone', severity: 'low', status: 'active', domain: 'mobility', timestamp: hoursAgo(2) },
    { id: uid('geo'), lat: 28.5731, lng: 77.2106, title: 'AIIMS Metro Station', description: 'High footfall station. 42,000 daily commuters.', type: 'transit_stop', severity: 'low', status: 'active', domain: 'mobility', timestamp: hoursAgo(1) },
    { id: uid('geo'), lat: 28.6291, lng: 77.2182, title: 'Red Fort Signal Failure', description: 'Traffic signal malfunction at Red Fort intersection.', type: 'incident', severity: 'high', status: 'active', domain: 'mobility', timestamp: hoursAgo(0.2) },
    { id: uid('geo'), lat: 28.5494, lng: 77.2001, title: 'Hauz Khas Metro', description: 'Interchange station. Average wait 3 min.', type: 'transit_stop', severity: 'low', status: 'active', domain: 'mobility', timestamp: hoursAgo(1.5) },
    { id: uid('geo'), lat: 28.6127, lng: 77.2291, title: 'India Gate Ring Road', description: 'Moderate congestion. Avg speed 22 km/h.', type: 'congestion', severity: 'medium', status: 'monitoring', domain: 'mobility', timestamp: hoursAgo(0.8) },
    { id: uid('geo'), lat: 28.6561, lng: 77.1893, title: 'Civil Lines Parking', description: 'Smart parking zone — 78% occupied.', type: 'parking', severity: 'low', status: 'active', domain: 'mobility', timestamp: hoursAgo(0.5) },
    { id: uid('geo'), lat: 28.5355, lng: 77.2100, title: 'Saket Bus Depot', description: 'DTC depot with 180 buses. 92% operational.', type: 'depot', severity: 'low', status: 'active', domain: 'mobility', timestamp: hoursAgo(3) },
    { id: uid('geo'), lat: 28.6668, lng: 77.2272, title: 'GT Karnal Road Flyover', description: 'Slow traffic on flyover due to overloaded truck.', type: 'congestion', severity: 'medium', status: 'active', domain: 'mobility', timestamp: hoursAgo(1.2) },
    { id: uid('geo'), lat: 28.5850, lng: 77.2350, title: 'Jangpura Auto Stand', description: 'Auto-rickshaw stand. E-autos available.', type: 'transit_stop', severity: 'low', status: 'active', domain: 'mobility', timestamp: hoursAgo(2) },
    { id: uid('geo'), lat: 28.6180, lng: 77.1780, title: 'Patel Nagar Cycle Track', description: 'Dedicated cycle lane — 340 daily cyclists.', type: 'bike_lane', severity: 'low', status: 'active', domain: 'mobility', timestamp: hoursAgo(4) },
    { id: uid('geo'), lat: 28.6350, lng: 77.2420, title: 'Shastri Park Bus Stop', description: 'Major cluster bus stop. 85 routes.', type: 'transit_stop', severity: 'low', status: 'active', domain: 'mobility', timestamp: hoursAgo(1) },
    { id: uid('geo'), lat: 28.5620, lng: 77.2400, title: 'Nehru Place Signal', description: 'Smart traffic signal — adaptive timing active.', type: 'signal', severity: 'low', status: 'active', domain: 'mobility', timestamp: hoursAgo(0.5) },
  ],
  safety: [
    { id: uid('geo'), lat: 28.6329, lng: 77.2195, title: 'Kashmere Gate Patrol Unit', description: 'PCR van on patrol duty. Unit KG-07.', type: 'patrol', severity: 'low', status: 'active', domain: 'safety', timestamp: hoursAgo(0.1) },
    { id: uid('geo'), lat: 28.6139, lng: 77.2090, title: 'Connaught Place Surveillance Hub', description: '48 CCTV cameras with AI analytics. Face recognition enabled.', type: 'camera', severity: 'low', status: 'active', domain: 'safety', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5731, lng: 77.2106, title: 'AIIMS Theft Report', description: 'Mobile phone snatching reported near metro exit.', type: 'incident', severity: 'medium', status: 'active', domain: 'safety', timestamp: hoursAgo(0.8) },
    { id: uid('geo'), lat: 28.6561, lng: 77.2280, title: 'Model Town Break-in', description: 'Residential break-in attempt. Suspect fled. CCTV footage being reviewed.', type: 'incident', severity: 'high', status: 'active', domain: 'safety', timestamp: hoursAgo(1.5) },
    { id: uid('geo'), lat: 28.5494, lng: 77.2001, title: 'Hauz Khas SOS Point', description: 'Emergency call button — tested & operational.', type: 'sos_point', severity: 'low', status: 'active', domain: 'safety', timestamp: hoursAgo(12) },
    { id: uid('geo'), lat: 28.6431, lng: 77.1899, title: 'Chandni Chowk Beat Officer', description: 'Beat patrol officer on foot. Coverage: 2 km radius.', type: 'patrol', severity: 'low', status: 'active', domain: 'safety', timestamp: hoursAgo(0.3) },
    { id: uid('geo'), lat: 28.5921, lng: 77.2290, title: 'Lodhi Colony Traffic Violation', description: 'Automated challan issued for red-light violation.', type: 'violation', severity: 'low', status: 'resolved', domain: 'safety', timestamp: hoursAgo(2) },
    { id: uid('geo'), lat: 28.6180, lng: 77.1780, title: 'Patel Nagar Fire Station', description: 'Fire station with 3 engines. Response time avg 6 min.', type: 'fire_station', severity: 'low', status: 'active', domain: 'safety', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5355, lng: 77.2100, title: 'Saket Mall Bomb Threat', description: 'Hoax call received. Area secured. Mall evacuated temporarily.', type: 'incident', severity: 'critical', status: 'resolved', domain: 'safety', timestamp: hoursAgo(4) },
    { id: uid('geo'), lat: 28.6668, lng: 77.2272, title: 'GT Road Speed Camera', description: 'Automated speed detection camera. 200+ violations today.', type: 'camera', severity: 'low', status: 'active', domain: 'safety', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.6291, lng: 77.2182, title: 'Red Fort Security Post', description: 'Armed security checkpoint. VIP route monitoring.', type: 'checkpoint', severity: 'low', status: 'active', domain: 'safety', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5850, lng: 77.2350, title: 'Jangpura Road Accident', description: 'DUI accident. Injuries reported. Ambulance dispatched.', type: 'incident', severity: 'high', status: 'active', domain: 'safety', timestamp: hoursAgo(0.6) },
    { id: uid('geo'), lat: 28.6350, lng: 77.2420, title: 'Shahdara PS', description: 'Shahdara police station — 42 officers on duty.', type: 'police_station', severity: 'low', status: 'active', domain: 'safety', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5620, lng: 77.2400, title: 'Nehru Place Eve Teasing Report', description: 'Harassment complaint filed. CCTV being checked.', type: 'incident', severity: 'medium', status: 'active', domain: 'safety', timestamp: hoursAgo(3) },
    { id: uid('geo'), lat: 28.6127, lng: 77.2291, title: 'India Gate Drone Surveillance', description: 'Drone patrol active over India Gate and Rajpath.', type: 'surveillance', severity: 'low', status: 'active', domain: 'safety', timestamp: hoursAgo(0.1) },
  ],
  health: [
    { id: uid('geo'), lat: 28.5672, lng: 77.2100, title: 'AIIMS Hospital', description: 'Premier government hospital. ER wait time: 34 min. 2,478 beds.', type: 'hospital', severity: 'low', status: 'active', domain: 'health', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.6139, lng: 77.2090, title: 'RML Hospital', description: 'Ram Manohar Lohia Hospital. ICU beds: 18 available.', type: 'hospital', severity: 'low', status: 'active', domain: 'health', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.6350, lng: 77.1950, title: 'Hindu Rao Hospital', description: 'North Delhi hospital. 450 beds. Currently at 82% occupancy.', type: 'hospital', severity: 'medium', status: 'active', domain: 'health', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5850, lng: 77.2000, title: 'Safdarjung Hospital', description: 'Major trauma center. 1,531 beds. ER running at capacity.', type: 'hospital', severity: 'high', status: 'active', domain: 'health', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5494, lng: 77.2001, title: 'Hauz Khas Mohalla Clinic', description: 'Primary care clinic. 120 patients today. Wait time 15 min.', type: 'clinic', severity: 'low', status: 'active', domain: 'health', timestamp: hoursAgo(1) },
    { id: uid('geo'), lat: 28.6431, lng: 77.1899, title: 'Old Delhi Vaccination Center', description: 'COVID + routine vaccinations. 380 doses administered today.', type: 'vaccination_center', severity: 'low', status: 'active', domain: 'health', timestamp: hoursAgo(2) },
    { id: uid('geo'), lat: 28.6291, lng: 77.2182, title: 'Ambulance Unit AM-12', description: 'Advanced life support ambulance en route to RML. ETA 4 min.', type: 'ambulance', severity: 'medium', status: 'active', domain: 'health', timestamp: hoursAgo(0.1) },
    { id: uid('geo'), lat: 28.5355, lng: 77.2100, title: 'Saket Polyclinic', description: 'Multi-specialty polyclinic. Lab, pharmacy, and dental services.', type: 'clinic', severity: 'low', status: 'active', domain: 'health', timestamp: hoursAgo(3) },
    { id: uid('geo'), lat: 28.6668, lng: 77.2272, title: 'GTB Hospital', description: 'Guru Teg Bahadur Hospital. 1,500 beds. Dengue ward active.', type: 'hospital', severity: 'medium', status: 'active', domain: 'health', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5731, lng: 77.2106, title: 'Ambulance Unit AM-08', description: 'Basic life support ambulance. Stationed near AIIMS.', type: 'ambulance', severity: 'low', status: 'active', domain: 'health', timestamp: hoursAgo(0.5) },
    { id: uid('geo'), lat: 28.5921, lng: 77.2290, title: 'Lodhi Colony Blood Bank', description: 'Red Cross blood bank. O+ and B+ running low.', type: 'blood_bank', severity: 'warning' as 'medium', status: 'active', domain: 'health', timestamp: hoursAgo(1) },
    { id: uid('geo'), lat: 28.6180, lng: 77.1780, title: 'West Delhi TB Center', description: 'TB treatment and monitoring center. 230 active cases tracked.', type: 'clinic', severity: 'low', status: 'active', domain: 'health', timestamp: hoursAgo(4) },
    { id: uid('geo'), lat: 28.6561, lng: 77.2280, title: 'Model Town Dispensary', description: 'Government dispensary. Free medicines available.', type: 'dispensary', severity: 'low', status: 'active', domain: 'health', timestamp: hoursAgo(2) },
    { id: uid('geo'), lat: 28.5620, lng: 77.2400, title: 'Nehru Place Lab Center', description: 'Diagnostic lab. Rapid COVID testing available.', type: 'lab', severity: 'low', status: 'active', domain: 'health', timestamp: hoursAgo(1.5) },
    { id: uid('geo'), lat: 28.6350, lng: 77.2420, title: 'East Delhi Mobile Health Van', description: 'Mobile health unit providing screening in underserved areas.', type: 'mobile_unit', severity: 'low', status: 'active', domain: 'health', timestamp: hoursAgo(0.8) },
  ],
  education: [
    { id: uid('geo'), lat: 28.6139, lng: 77.2090, title: 'Modern School, Barakhamba', description: 'Top-rated CBSE school. 2,200 students. 98% pass rate.', type: 'school', severity: 'low', status: 'active', domain: 'education', timestamp: hoursAgo(2) },
    { id: uid('geo'), lat: 28.5430, lng: 77.1620, title: 'JNU Campus', description: 'Jawaharlal Nehru University. 8,500 students. Research excellence.', type: 'university', severity: 'low', status: 'active', domain: 'education', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.6129, lng: 77.1726, title: 'Delhi University North Campus', description: 'Major university hub. 132,000 students. 86 colleges.', type: 'university', severity: 'low', status: 'active', domain: 'education', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5494, lng: 77.2001, title: 'Kendriya Vidyalaya, Hauz Khas', description: 'Central government school. Attendance today: 94%.', type: 'school', severity: 'low', status: 'active', domain: 'education', timestamp: hoursAgo(1) },
    { id: uid('geo'), lat: 28.5850, lng: 77.1650, title: 'IIT Delhi', description: 'Premier engineering institution. 11,000 students.', type: 'university', severity: 'low', status: 'active', domain: 'education', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.6431, lng: 77.1899, title: 'MCD Primary School, Chandni Chowk', description: 'Municipal school. 380 students. Mid-day meal served.', type: 'school', severity: 'low', status: 'active', domain: 'education', timestamp: hoursAgo(3) },
    { id: uid('geo'), lat: 28.6668, lng: 77.2272, title: 'Govt Boys Sr Sec School', description: 'Senior secondary school. Smart classroom pilot ongoing.', type: 'school', severity: 'low', status: 'active', domain: 'education', timestamp: hoursAgo(2) },
    { id: uid('geo'), lat: 28.5355, lng: 77.2100, title: 'National Open School Center', description: 'NIOS exam center. 1,200 enrolled in current cycle.', type: 'exam_center', severity: 'low', status: 'active', domain: 'education', timestamp: hoursAgo(4) },
    { id: uid('geo'), lat: 28.6180, lng: 77.1780, title: 'Digital Learning Hub, Patel Nagar', description: 'Free coding bootcamp. 85 students currently enrolled.', type: 'digital_hub', severity: 'low', status: 'active', domain: 'education', timestamp: hoursAgo(1.5) },
    { id: uid('geo'), lat: 28.5620, lng: 77.2400, title: 'Community Library, Nehru Place', description: 'Public library with 24,000 books. Free internet.', type: 'library', severity: 'low', status: 'active', domain: 'education', timestamp: hoursAgo(5) },
    { id: uid('geo'), lat: 28.6291, lng: 77.2182, title: 'Delhi Public School, Mathura Road', description: 'Private CBSE school. Excellent infrastructure.', type: 'school', severity: 'low', status: 'active', domain: 'education', timestamp: hoursAgo(2) },
    { id: uid('geo'), lat: 28.5921, lng: 77.2290, title: 'Jamia Millia Islamia', description: 'Central university. 22,000 students. Strong humanities.', type: 'university', severity: 'low', status: 'active', domain: 'education', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.6561, lng: 77.2280, title: 'Skill Development Center, Model Town', description: 'Vocational training in electronics & plumbing.', type: 'training_center', severity: 'low', status: 'active', domain: 'education', timestamp: hoursAgo(3) },
    { id: uid('geo'), lat: 28.6350, lng: 77.2420, title: 'Anganwadi Center #247', description: 'Early childhood education. 45 children enrolled.', type: 'anganwadi', severity: 'low', status: 'active', domain: 'education', timestamp: hoursAgo(2) },
    { id: uid('geo'), lat: 28.5731, lng: 77.2106, title: 'IGNOU Study Center', description: 'Distance learning center. 4,800 active learners.', type: 'study_center', severity: 'low', status: 'active', domain: 'education', timestamp: hoursAgo(1) },
  ],
  environment: [
    { id: uid('geo'), lat: 28.6139, lng: 77.2090, title: 'CP Air Quality Station', description: 'AQI: 87 (Moderate). PM2.5: 42 µg/m³, PM10: 95 µg/m³.', type: 'sensor', severity: 'medium', status: 'active', domain: 'environment', timestamp: hoursAgo(0.1) },
    { id: uid('geo'), lat: 28.5921, lng: 77.2290, title: 'Lodhi Garden Monitoring', description: 'AQI: 62 (Satisfactory). Green cover: high. Noise: 45 dB.', type: 'sensor', severity: 'low', status: 'active', domain: 'environment', timestamp: hoursAgo(0.2) },
    { id: uid('geo'), lat: 28.6668, lng: 77.2272, title: 'Anand Vihar Pollution Hotspot', description: 'AQI: 156 (Unhealthy). PM2.5: 82 µg/m³. Alert issued.', type: 'hotspot', severity: 'critical', status: 'active', domain: 'environment', timestamp: hoursAgo(0.1) },
    { id: uid('geo'), lat: 28.6431, lng: 77.1899, title: 'Yamuna River Monitor (Wazirabad)', description: 'Water quality: Poor. DO: 2.1 mg/L. Ammonia: 4.2 mg/L.', type: 'water_sensor', severity: 'critical', status: 'active', domain: 'environment', timestamp: hoursAgo(0.3) },
    { id: uid('geo'), lat: 28.5494, lng: 77.2001, title: 'Deer Park Green Zone', description: 'Air quality: Good (AQI 48). Biodiversity monitoring active.', type: 'green_zone', severity: 'low', status: 'active', domain: 'environment', timestamp: hoursAgo(1) },
    { id: uid('geo'), lat: 28.5355, lng: 77.2100, title: 'Saket Noise Monitor', description: 'Avg noise: 72 dB (above limit). Construction zone nearby.', type: 'noise_sensor', severity: 'high', status: 'active', domain: 'environment', timestamp: hoursAgo(0.5) },
    { id: uid('geo'), lat: 28.5731, lng: 77.2106, title: 'AIIMS Area Weather Station', description: 'Temp: 36°C. Humidity: 45%. Wind: 12 km/h NW.', type: 'weather', severity: 'low', status: 'active', domain: 'environment', timestamp: hoursAgo(0.1) },
    { id: uid('geo'), lat: 28.6291, lng: 77.2182, title: 'India Gate Lawn Sensor', description: 'Soil moisture: 38%. Irrigation system auto-active.', type: 'soil_sensor', severity: 'low', status: 'active', domain: 'environment', timestamp: hoursAgo(2) },
    { id: uid('geo'), lat: 28.6180, lng: 77.1780, title: 'West Delhi Industrial Zone', description: 'AQI: 134 (Unhealthy for sensitive groups). SO2 elevated.', type: 'hotspot', severity: 'high', status: 'monitoring', domain: 'environment', timestamp: hoursAgo(0.4) },
    { id: uid('geo'), lat: 28.5850, lng: 77.2350, title: 'Jangpura Water Quality Point', description: 'Tap water TDS: 380 ppm. Chlorine: within limits.', type: 'water_sensor', severity: 'low', status: 'active', domain: 'environment', timestamp: hoursAgo(3) },
    { id: uid('geo'), lat: 28.6328, lng: 77.2197, title: 'Yamuna Biodiversity Park', description: 'Green cover: 89%. 312 bird species recorded.', type: 'green_zone', severity: 'low', status: 'active', domain: 'environment', timestamp: hoursAgo(6) },
    { id: uid('geo'), lat: 28.5620, lng: 77.2400, title: 'Nehru Place Construction Dust', description: 'PM10: 210 µg/m³ near construction site. Warning issued.', type: 'hotspot', severity: 'high', status: 'active', domain: 'environment', timestamp: hoursAgo(0.8) },
    { id: uid('geo'), lat: 28.6561, lng: 77.2280, title: 'Model Town Lake Quality', description: 'Algae bloom detected. DO: 3.8 mg/L. Cleanup planned.', type: 'water_sensor', severity: 'medium', status: 'monitoring', domain: 'environment', timestamp: hoursAgo(5) },
    { id: uid('geo'), lat: 28.6350, lng: 77.2420, title: 'East Delhi Waste Burning Alert', description: 'Illegal waste burning detected by satellite. SO2 spike.', type: 'hotspot', severity: 'critical', status: 'active', domain: 'environment', timestamp: hoursAgo(0.2) },
    { id: uid('geo'), lat: 28.6127, lng: 77.2291, title: 'Rajpath Tree Census', description: '4,200 trees cataloged. 18 heritage trees. All healthy.', type: 'green_zone', severity: 'low', status: 'active', domain: 'environment', timestamp: hoursAgo(24) },
  ],
  waste: [
    { id: uid('geo'), lat: 28.6139, lng: 77.2090, title: 'CP Underground Bin Station', description: 'Smart bin — 72% full. Collection due in 4 hours.', type: 'bin', severity: 'medium', status: 'active', domain: 'waste', timestamp: hoursAgo(0.5) },
    { id: uid('geo'), lat: 28.7060, lng: 77.1830, title: 'Bhalswa Landfill', description: 'Active landfill. 62% capacity remaining. Methane capture active.', type: 'landfill', severity: 'high', status: 'monitoring', domain: 'waste', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5494, lng: 77.2001, title: 'Hauz Khas Material Recovery Facility', description: 'Processing 120 tonnes/day. Segregation rate: 78%.', type: 'mrf', severity: 'low', status: 'active', domain: 'waste', timestamp: hoursAgo(1) },
    { id: uid('geo'), lat: 28.6431, lng: 77.1899, title: 'Old Delhi Garbage Complaint', description: 'Citizen complaint: overflowing bins near Jama Masjid.', type: 'complaint', severity: 'high', status: 'active', domain: 'waste', timestamp: hoursAgo(2) },
    { id: uid('geo'), lat: 28.5355, lng: 77.2100, title: 'Saket Composting Plant', description: 'Processing 40 tonnes/day of organic waste. Output: 8 tonnes compost.', type: 'composting', severity: 'low', status: 'active', domain: 'waste', timestamp: hoursAgo(3) },
    { id: uid('geo'), lat: 28.6291, lng: 77.2182, title: 'Waste Collection Truck WT-14', description: 'Route: Mathura Road belt. Collected: 6.2 tonnes. 3 stops remaining.', type: 'truck', severity: 'low', status: 'active', domain: 'waste', timestamp: hoursAgo(0.2) },
    { id: uid('geo'), lat: 28.6668, lng: 77.2272, title: 'Ghazipur Landfill', description: 'Legacy landfill. Bioremediation in progress. Fire risk: moderate.', type: 'landfill', severity: 'critical', status: 'monitoring', domain: 'waste', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5731, lng: 77.2106, title: 'E-Waste Collection Point', description: 'Electronic waste drop-off. 2.4 tonnes collected this week.', type: 'collection_point', severity: 'low', status: 'active', domain: 'waste', timestamp: hoursAgo(4) },
    { id: uid('geo'), lat: 28.5921, lng: 77.2290, title: 'Lodhi Colony Smart Bins', description: '8 smart bins. Avg fill level: 45%. All sensors working.', type: 'bin', severity: 'low', status: 'active', domain: 'waste', timestamp: hoursAgo(1) },
    { id: uid('geo'), lat: 28.6180, lng: 77.1780, title: 'Waste-to-Energy Plant (Narela)', description: 'Processing 2,000 TPD. Generating 24 MW electricity.', type: 'wte_plant', severity: 'low', status: 'active', domain: 'waste', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5850, lng: 77.2350, title: 'Jangpura Dry Waste Center', description: 'Dry waste sorting center. Employs 45 safai karamcharis.', type: 'sorting_center', severity: 'low', status: 'active', domain: 'waste', timestamp: hoursAgo(2) },
    { id: uid('geo'), lat: 28.6350, lng: 77.2420, title: 'Shahdara Bin Overflow', description: 'Community bins overflowing. Emergency pickup requested.', type: 'complaint', severity: 'high', status: 'active', domain: 'waste', timestamp: hoursAgo(0.5) },
    { id: uid('geo'), lat: 28.6561, lng: 77.2280, title: 'Model Town Recycler', description: 'Authorized recycler. Processes plastic, paper, metal.', type: 'recycler', severity: 'low', status: 'active', domain: 'waste', timestamp: hoursAgo(5) },
    { id: uid('geo'), lat: 28.5620, lng: 77.2400, title: 'Nehru Place Bio-Digester', description: 'Bio-digester unit converting food waste to biogas.', type: 'bio_digester', severity: 'low', status: 'active', domain: 'waste', timestamp: hoursAgo(6) },
    { id: uid('geo'), lat: 28.6127, lng: 77.2291, title: 'Construction Debris Dump', description: 'Illegal C&D debris dumping reported. Fine issued.', type: 'complaint', severity: 'medium', status: 'active', domain: 'waste', timestamp: hoursAgo(3) },
  ],
  energy: [
    { id: uid('geo'), lat: 28.6139, lng: 77.2090, title: 'CP Grid Substation', description: '220kV substation. Load: 85%. Transformer temp normal.', type: 'substation', severity: 'low', status: 'active', domain: 'energy', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5494, lng: 77.2001, title: 'Hauz Khas Solar Park', description: '5 MW rooftop solar installation. Generating 3.8 MW now.', type: 'solar', severity: 'low', status: 'active', domain: 'energy', timestamp: hoursAgo(0.1) },
    { id: uid('geo'), lat: 28.6668, lng: 77.2272, title: 'Anand Vihar Power Outage', description: 'Transformer failure. 2,400 households affected. ETA repair: 2 hrs.', type: 'outage', severity: 'critical', status: 'active', domain: 'energy', timestamp: hoursAgo(0.5) },
    { id: uid('geo'), lat: 28.6431, lng: 77.1899, title: 'Old Delhi Smart Meter Zone', description: '14,000 smart meters installed. Real-time consumption tracking.', type: 'smart_meter', severity: 'low', status: 'active', domain: 'energy', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5355, lng: 77.2100, title: 'Saket EV Charging Hub', description: '12 fast chargers, 24 slow chargers. 8 slots available.', type: 'ev_charger', severity: 'low', status: 'active', domain: 'energy', timestamp: hoursAgo(1) },
    { id: uid('geo'), lat: 28.5731, lng: 77.2106, title: 'AIIMS Backup Generator', description: '3 MW diesel generator. Fuel: 92%. Auto-start tested OK.', type: 'generator', severity: 'low', status: 'active', domain: 'energy', timestamp: hoursAgo(12) },
    { id: uid('geo'), lat: 28.6291, lng: 77.2182, title: 'Solar Panel Cluster, Pragati Maidan', description: '2.5 MW solar panels on rooftop. 1.8 MW current output.', type: 'solar', severity: 'low', status: 'active', domain: 'energy', timestamp: hoursAgo(0.2) },
    { id: uid('geo'), lat: 28.5921, lng: 77.2290, title: 'Lodhi Road Street Lighting', description: '180 LED smart street lights. Energy savings: 45%.', type: 'street_light', severity: 'low', status: 'active', domain: 'energy', timestamp: hoursAgo(6) },
    { id: uid('geo'), lat: 28.6180, lng: 77.1780, title: 'West Delhi 400kV Substation', description: 'Major grid node. Importing 800 MW from Rajasthan.', type: 'substation', severity: 'low', status: 'active', domain: 'energy', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5850, lng: 77.2350, title: 'Jangpura Feeder Overload', description: '11kV feeder at 108% capacity. Load shedding risk.', type: 'alert', severity: 'high', status: 'monitoring', domain: 'energy', timestamp: hoursAgo(0.3) },
    { id: uid('geo'), lat: 28.6561, lng: 77.2280, title: 'Model Town Biogas Plant', description: 'Community biogas unit. Serving 200 households.', type: 'biogas', severity: 'low', status: 'active', domain: 'energy', timestamp: hoursAgo(8) },
    { id: uid('geo'), lat: 28.5620, lng: 77.2400, title: 'Battery Storage, Nehru Place', description: '10 MWh battery storage facility. SOC: 78%.', type: 'storage', severity: 'low', status: 'active', domain: 'energy', timestamp: hoursAgo(0.1) },
    { id: uid('geo'), lat: 28.6350, lng: 77.2420, title: 'East Delhi Wind Monitor', description: 'Wind speed: 14 km/h. Below viable threshold for generation.', type: 'wind', severity: 'low', status: 'monitoring', domain: 'energy', timestamp: hoursAgo(0.5) },
    { id: uid('geo'), lat: 28.6328, lng: 77.2197, title: 'Power Theft Detection, Kashmere Gate', description: 'Smart meter flagged anomalous consumption pattern.', type: 'alert', severity: 'medium', status: 'active', domain: 'energy', timestamp: hoursAgo(2) },
    { id: uid('geo'), lat: 28.6127, lng: 77.2291, title: 'Solar Water Heater Zone', description: 'Mandatory solar water heating zone. 89% compliance.', type: 'solar', severity: 'low', status: 'active', domain: 'energy', timestamp: hoursAgo(24) },
  ],
  engagement: [
    { id: uid('geo'), lat: 28.6139, lng: 77.2090, title: 'CP Feedback Kiosk', description: 'Digital feedback kiosk. 142 responses today. Avg rating: 4.2/5.', type: 'kiosk', severity: 'low', status: 'active', domain: 'engagement', timestamp: hoursAgo(0.5) },
    { id: uid('geo'), lat: 28.6431, lng: 77.1899, title: 'Ward Office, Chandni Chowk', description: 'Citizen service center. 48 grievances pending. 12 walk-ins today.', type: 'service_center', severity: 'medium', status: 'active', domain: 'engagement', timestamp: hoursAgo(1) },
    { id: uid('geo'), lat: 28.5494, lng: 77.2001, title: 'Town Hall Meeting Point', description: 'Monthly town hall scheduled. 230 registrations received.', type: 'meeting', severity: 'low', status: 'pending', domain: 'engagement', timestamp: hoursAgo(4) },
    { id: uid('geo'), lat: 28.5355, lng: 77.2100, title: 'Saket RWA Office', description: 'Resident Welfare Association. Active complaints: 18.', type: 'rwa', severity: 'low', status: 'active', domain: 'engagement', timestamp: hoursAgo(2) },
    { id: uid('geo'), lat: 28.6668, lng: 77.2272, title: 'Public Consultation Zone', description: 'Metro expansion consultation ongoing. 560 votes cast online.', type: 'consultation', severity: 'low', status: 'active', domain: 'engagement', timestamp: hoursAgo(6) },
    { id: uid('geo'), lat: 28.6291, lng: 77.2182, title: 'CSC Digital Center', description: 'Common Service Centre. Aadhaar, PAN, and govt forms.', type: 'csc', severity: 'low', status: 'active', domain: 'engagement', timestamp: hoursAgo(1) },
    { id: uid('geo'), lat: 28.5731, lng: 77.2106, title: 'Participatory Budget Ward 12', description: 'Budget allocation vote. ₹2 Cr at stake. 1,800 votes.', type: 'budget', severity: 'low', status: 'active', domain: 'engagement', timestamp: hoursAgo(3) },
    { id: uid('geo'), lat: 28.5921, lng: 77.2290, title: 'Grievance Camp, Lodhi Colony', description: 'Weekly grievance redressal camp. 45 cases heard today.', type: 'camp', severity: 'low', status: 'active', domain: 'engagement', timestamp: hoursAgo(5) },
    { id: uid('geo'), lat: 28.6180, lng: 77.1780, title: 'Water Supply Complaint Cluster', description: '28 water supply complaints in this area. Investigation ongoing.', type: 'complaint_cluster', severity: 'high', status: 'active', domain: 'engagement', timestamp: hoursAgo(1) },
    { id: uid('geo'), lat: 28.5850, lng: 77.2350, title: 'Public Survey Station', description: 'Satisfaction survey for new bus route. 320 responses.', type: 'survey', severity: 'low', status: 'active', domain: 'engagement', timestamp: hoursAgo(2) },
    { id: uid('geo'), lat: 28.6561, lng: 77.2280, title: 'Model Town Grievance Box', description: 'Physical complaint box. Collected: 15. Digitized: 12.', type: 'complaint_box', severity: 'low', status: 'active', domain: 'engagement', timestamp: hoursAgo(4) },
    { id: uid('geo'), lat: 28.5620, lng: 77.2400, title: 'Jan Samvad Center', description: 'Public-official interface center. MLA visit scheduled.', type: 'jan_samvad', severity: 'low', status: 'pending', domain: 'engagement', timestamp: hoursAgo(8) },
    { id: uid('geo'), lat: 28.6350, lng: 77.2420, title: 'Online Poll: Park Renovation', description: 'Poll for Shahdara park redesign. 2,100 votes so far.', type: 'poll', severity: 'low', status: 'active', domain: 'engagement', timestamp: hoursAgo(12) },
    { id: uid('geo'), lat: 28.6127, lng: 77.2291, title: 'Smart City Dashboard Kiosk', description: 'Public dashboard showing live city metrics.', type: 'kiosk', severity: 'low', status: 'active', domain: 'engagement', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.6328, lng: 77.2197, title: 'RTI Help Desk', description: 'Right to Information assistance desk. 8 queries today.', type: 'help_desk', severity: 'low', status: 'active', domain: 'engagement', timestamp: hoursAgo(3) },
  ],
  accessibility: [
    { id: uid('geo'), lat: 28.6139, lng: 77.2090, title: 'CP Accessible Crossing', description: 'Tactile paving + audible signals installed. Fully compliant.', type: 'crossing', severity: 'low', status: 'active', domain: 'accessibility', timestamp: hoursAgo(24) },
    { id: uid('geo'), lat: 28.5731, lng: 77.2106, title: 'AIIMS Metro Elevator', description: 'Elevator operational. Braille signage present.', type: 'elevator', severity: 'low', status: 'active', domain: 'accessibility', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.6431, lng: 77.1899, title: 'Chandni Chowk Ramp Missing', description: 'Heritage market area — no wheelchair ramps. Audit flagged.', type: 'issue', severity: 'high', status: 'pending', domain: 'accessibility', timestamp: hoursAgo(48) },
    { id: uid('geo'), lat: 28.5494, lng: 77.2001, title: 'Hauz Khas Bus Stop Upgrade', description: 'Bus stop with ramp, shelter, and Braille schedule board.', type: 'bus_stop', severity: 'low', status: 'active', domain: 'accessibility', timestamp: hoursAgo(12) },
    { id: uid('geo'), lat: 28.5355, lng: 77.2100, title: 'Saket Mall Accessibility Audit', description: 'Partial compliance. Restrooms OK, parking needs upgrade.', type: 'audit', severity: 'medium', status: 'active', domain: 'accessibility', timestamp: hoursAgo(72) },
    { id: uid('geo'), lat: 28.6668, lng: 77.2272, title: 'Accessible Park, Shalimar Bagh', description: 'Wheelchair-accessible paths. Sensory garden. Model facility.', type: 'park', severity: 'low', status: 'active', domain: 'accessibility', timestamp: hoursAgo(24) },
    { id: uid('geo'), lat: 28.6291, lng: 77.2182, title: 'Govt Building Elevator Down', description: 'Elevator at Delhi Secretariat out of service. Repair underway.', type: 'issue', severity: 'critical', status: 'active', domain: 'accessibility', timestamp: hoursAgo(6) },
    { id: uid('geo'), lat: 28.5921, lng: 77.2290, title: 'Sign Language Help Desk', description: 'Available at Lodhi Road govt office. Hours: 10am-4pm.', type: 'service', severity: 'low', status: 'active', domain: 'accessibility', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.6180, lng: 77.1780, title: 'Accessible Public Toilet', description: 'Wheelchair-accessible toilet. Maintained by MCD.', type: 'facility', severity: 'low', status: 'active', domain: 'accessibility', timestamp: hoursAgo(12) },
    { id: uid('geo'), lat: 28.5850, lng: 77.2350, title: 'Braille Library Section', description: 'Public library with dedicated Braille section. 2,400 titles.', type: 'library', severity: 'low', status: 'active', domain: 'accessibility', timestamp: hoursAgo(24) },
    { id: uid('geo'), lat: 28.5620, lng: 77.2400, title: 'Assistive Tech Lab', description: 'Free assistive technology lab. Screen readers, magnifiers.', type: 'lab', severity: 'low', status: 'active', domain: 'accessibility', timestamp: hoursAgo(8) },
    { id: uid('geo'), lat: 28.6350, lng: 77.2420, title: 'Accessible Footpath Project', description: 'Smooth footpaths under construction. 2.3 km completed.', type: 'project', severity: 'low', status: 'active', domain: 'accessibility', timestamp: hoursAgo(48) },
    { id: uid('geo'), lat: 28.6561, lng: 77.2280, title: 'Hearing Loop, Town Hall', description: 'Hearing loop system installed in council chamber.', type: 'facility', severity: 'low', status: 'active', domain: 'accessibility', timestamp: hoursAgo(24) },
    { id: uid('geo'), lat: 28.6328, lng: 77.2197, title: 'Paratransit Stop', description: 'On-demand accessible van pickup point.', type: 'transport', severity: 'low', status: 'active', domain: 'accessibility', timestamp: hoursAgo(1) },
    { id: uid('geo'), lat: 28.6127, lng: 77.2291, title: 'Inclusive Playground', description: 'Playground with wheelchair swings and sensory equipment.', type: 'park', severity: 'low', status: 'active', domain: 'accessibility', timestamp: hoursAgo(12) },
  ],
  disaster: [
    { id: uid('geo'), lat: 28.6139, lng: 77.2090, title: 'Flood Sensor — Yamuna at ITO', description: 'Water level: 203.5m (Warning: 204.5m, Danger: 205.3m). Rising.', type: 'flood_sensor', severity: 'medium', status: 'monitoring', domain: 'disaster', timestamp: hoursAgo(0.1) },
    { id: uid('geo'), lat: 28.6431, lng: 77.1899, title: 'Emergency Shelter — Kashmere Gate', description: 'Capacity: 5,000. Current occupancy: 0. Ready for activation.', type: 'shelter', severity: 'low', status: 'active', domain: 'disaster', timestamp: hoursAgo(24) },
    { id: uid('geo'), lat: 28.5731, lng: 77.2106, title: 'Seismic Station — South Delhi', description: 'Seismograph active. No recent activity. Last calibrated: 3 days ago.', type: 'seismic', severity: 'low', status: 'active', domain: 'disaster', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.6668, lng: 77.2272, title: 'NDRF Team Alpha', description: '50-member NDRF team stationed. Equipment: boats, rescue gear.', type: 'response_team', severity: 'low', status: 'active', domain: 'disaster', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5494, lng: 77.2001, title: 'Emergency Supply Depot', description: '10,000 food packets, 20,000 water bottles, 500 blankets stocked.', type: 'supply_depot', severity: 'low', status: 'active', domain: 'disaster', timestamp: hoursAgo(48) },
    { id: uid('geo'), lat: 28.5355, lng: 77.2100, title: 'Fire Hydrant Cluster', description: '8 fire hydrants in this zone. All tested and functional.', type: 'hydrant', severity: 'low', status: 'active', domain: 'disaster', timestamp: hoursAgo(72) },
    { id: uid('geo'), lat: 28.6291, lng: 77.2182, title: 'Emergency Control Room', description: 'State Disaster Management Authority. 24/7 operational.', type: 'control_room', severity: 'low', status: 'active', domain: 'disaster', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5921, lng: 77.2290, title: 'Flood-Prone Zone Warning', description: 'Low-lying area prone to waterlogging. Pumps deployed.', type: 'warning_zone', severity: 'high', status: 'monitoring', domain: 'disaster', timestamp: hoursAgo(0.5) },
    { id: uid('geo'), lat: 28.6180, lng: 77.1780, title: 'Emergency Siren Tower', description: 'Early warning siren system. Coverage radius: 2 km. Tested weekly.', type: 'siren', severity: 'low', status: 'active', domain: 'disaster', timestamp: hoursAgo(120) },
    { id: uid('geo'), lat: 28.5850, lng: 77.2350, title: 'Chemical Hazard Monitor', description: 'Industrial area gas leak sensor. All readings normal.', type: 'hazmat', severity: 'low', status: 'active', domain: 'disaster', timestamp: hoursAgo(0.3) },
    { id: uid('geo'), lat: 28.6561, lng: 77.2280, title: 'Evacuation Route — Model Town', description: 'Primary evacuation route to GT Karnal Road. Route clear.', type: 'evacuation_route', severity: 'low', status: 'active', domain: 'disaster', timestamp: hoursAgo(24) },
    { id: uid('geo'), lat: 28.5620, lng: 77.2400, title: 'Building Structural Alert', description: 'Old building flagged for structural weakness. Evacuation advisory.', type: 'structural', severity: 'critical', status: 'active', domain: 'disaster', timestamp: hoursAgo(8) },
    { id: uid('geo'), lat: 28.6350, lng: 77.2420, title: 'Heat Wave Shelter', description: 'AC community hall designated as heat shelter. Capacity: 300.', type: 'shelter', severity: 'low', status: 'active', domain: 'disaster', timestamp: hoursAgo(6) },
    { id: uid('geo'), lat: 28.6328, lng: 77.2197, title: 'Yamuna Barrage Sensor', description: 'Monitoring water release from Hathnikund. Normal flow.', type: 'flood_sensor', severity: 'low', status: 'monitoring', domain: 'disaster', timestamp: hoursAgo(0.2) },
    { id: uid('geo'), lat: 28.6127, lng: 77.2291, title: 'Emergency Helipad', description: 'Helipad at India Gate lawns. Available for disaster evacuation.', type: 'helipad', severity: 'low', status: 'active', domain: 'disaster', timestamp: hoursAgo(0) },
  ],
  tourism: [
    { id: uid('geo'), lat: 28.6127, lng: 77.2291, title: 'India Gate', description: 'War memorial. Daily footfall: 15,000. Illuminated at night.', type: 'monument', severity: 'low', status: 'active', domain: 'tourism', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.6562, lng: 77.2410, title: 'Red Fort', description: 'UNESCO World Heritage. Visitor count today: 4,200. Sound & light show at 7pm.', type: 'heritage', severity: 'low', status: 'active', domain: 'tourism', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.6244, lng: 77.2195, title: 'Jama Masjid', description: 'Largest mosque in India. Heritage conservation score: 8.2/10.', type: 'heritage', severity: 'low', status: 'active', domain: 'tourism', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5933, lng: 77.2507, title: 'Humayun\'s Tomb', description: 'UNESCO site. Visitor count: 2,800. Restoration work: 95% complete.', type: 'heritage', severity: 'low', status: 'active', domain: 'tourism', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5244, lng: 77.1855, title: 'Qutub Minar', description: 'UNESCO World Heritage. 73m tall. Footfall: 3,500 today.', type: 'heritage', severity: 'low', status: 'active', domain: 'tourism', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.6103, lng: 77.2307, title: 'National Museum', description: '200,000+ artifacts. Visitor count: 1,100 today. New exhibition: Indus Valley.', type: 'museum', severity: 'low', status: 'active', domain: 'tourism', timestamp: hoursAgo(1) },
    { id: uid('geo'), lat: 28.6139, lng: 77.2090, title: 'Connaught Place Shopping Hub', description: 'Heritage shopping area. Tourist footfall: 8,000/day. Street art tour available.', type: 'shopping', severity: 'low', status: 'active', domain: 'tourism', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5921, lng: 77.2290, title: 'Lodhi Art District', description: 'Open-air street art gallery. 52 murals. Walking tour popular.', type: 'attraction', severity: 'low', status: 'active', domain: 'tourism', timestamp: hoursAgo(2) },
    { id: uid('geo'), lat: 28.5494, lng: 77.2001, title: 'Hauz Khas Village', description: 'Historic village + trendy cafes. Weekend footfall: 12,000.', type: 'attraction', severity: 'low', status: 'active', domain: 'tourism', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.6431, lng: 77.1899, title: 'Paranthe Wali Gali', description: 'Famous food street. 20+ parantha varieties. Tourist favorite.', type: 'food', severity: 'low', status: 'active', domain: 'tourism', timestamp: hoursAgo(1) },
    { id: uid('geo'), lat: 28.5850, lng: 77.2000, title: 'Safdarjung Tomb', description: 'Mughal-era tomb. Well-maintained garden. Footfall: 800 today.', type: 'heritage', severity: 'low', status: 'active', domain: 'tourism', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.6350, lng: 77.2420, title: 'Akshardham Temple', description: 'Modern Hindu temple complex. Visitor limit: 10,000/day. Wait: 45 min.', type: 'temple', severity: 'medium', status: 'active', domain: 'tourism', timestamp: hoursAgo(0.5) },
    { id: uid('geo'), lat: 28.5731, lng: 77.2106, title: 'Dilli Haat', description: 'Handicraft market. 62 stalls. Cultural performances daily.', type: 'market', severity: 'low', status: 'active', domain: 'tourism', timestamp: hoursAgo(1) },
    { id: uid('geo'), lat: 28.6180, lng: 77.1780, title: 'Karol Bagh Hotel District', description: '320 hotels in area. Avg occupancy: 76%. Budget-friendly.', type: 'hotel_zone', severity: 'low', status: 'active', domain: 'tourism', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.6328, lng: 77.2197, title: 'Tourist Info Center, ISBT', description: 'Tourism office. Maps, guides, and tour booking available.', type: 'info_center', severity: 'low', status: 'active', domain: 'tourism', timestamp: hoursAgo(2) },
  ],
  community: [
    { id: uid('geo'), lat: 28.6139, lng: 77.2090, title: 'Community Center, CP', description: 'Multi-purpose hall. Yoga classes, health camps, skill training.', type: 'community_center', severity: 'low', status: 'active', domain: 'community', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5494, lng: 77.2001, title: 'Women Self-Help Group Hub', description: '18 SHGs registered. Micro-finance disbursement: ₹12L this month.', type: 'shg', severity: 'low', status: 'active', domain: 'community', timestamp: hoursAgo(2) },
    { id: uid('geo'), lat: 28.6431, lng: 77.1899, title: 'Old Delhi Night Shelter', description: 'Night shelter for homeless. Capacity: 200. Occupancy: 78%.', type: 'shelter', severity: 'low', status: 'active', domain: 'community', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.5355, lng: 77.2100, title: 'Skill Training Center, Saket', description: 'Computer literacy + tailoring courses. 120 enrolled.', type: 'training', severity: 'low', status: 'active', domain: 'community', timestamp: hoursAgo(3) },
    { id: uid('geo'), lat: 28.6668, lng: 77.2272, title: 'PDS Fair Price Shop', description: 'Public Distribution System shop. Ration cards: 4,200.', type: 'pds', severity: 'low', status: 'active', domain: 'community', timestamp: hoursAgo(1) },
    { id: uid('geo'), lat: 28.5731, lng: 77.2106, title: 'Senior Citizen Day Care', description: 'Day care for elderly. 45 regular attendees. Health check-up today.', type: 'day_care', severity: 'low', status: 'active', domain: 'community', timestamp: hoursAgo(4) },
    { id: uid('geo'), lat: 28.6291, lng: 77.2182, title: 'Jan Aushadhi Kendra', description: 'Generic medicine store. 800+ medicines at discounted rates.', type: 'pharmacy', severity: 'low', status: 'active', domain: 'community', timestamp: hoursAgo(1) },
    { id: uid('geo'), lat: 28.5921, lng: 77.2290, title: 'Urban Farming Project', description: 'Rooftop farming initiative. 2 acres. Supplying local market.', type: 'farming', severity: 'low', status: 'active', domain: 'community', timestamp: hoursAgo(6) },
    { id: uid('geo'), lat: 28.6180, lng: 77.1780, title: 'Livelihood Support Office', description: 'Employment exchange + MNREGA registration center.', type: 'employment', severity: 'low', status: 'active', domain: 'community', timestamp: hoursAgo(2) },
    { id: uid('geo'), lat: 28.5850, lng: 77.2350, title: 'Children\'s Home', description: 'State-run children\'s home. 60 children. Education provided.', type: 'children_home', severity: 'low', status: 'active', domain: 'community', timestamp: hoursAgo(0) },
    { id: uid('geo'), lat: 28.6561, lng: 77.2280, title: 'Model Town Community Library', description: 'Public library with free WiFi. 350 daily visitors.', type: 'library', severity: 'low', status: 'active', domain: 'community', timestamp: hoursAgo(1) },
    { id: uid('geo'), lat: 28.5620, lng: 77.2400, title: 'Pension Disbursement Center', description: 'Old age + widow pension. 2,800 beneficiaries this month.', type: 'pension', severity: 'low', status: 'active', domain: 'community', timestamp: hoursAgo(5) },
    { id: uid('geo'), lat: 28.6350, lng: 77.2420, title: 'Anganwadi Cluster Office', description: 'Supervising 42 anganwadis. 1,800 children benefiting.', type: 'anganwadi', severity: 'low', status: 'active', domain: 'community', timestamp: hoursAgo(2) },
    { id: uid('geo'), lat: 28.6328, lng: 77.2197, title: 'NGO Coordination Hub', description: '14 NGOs coordinating here. Focus: education + health.', type: 'ngo', severity: 'low', status: 'active', domain: 'community', timestamp: hoursAgo(3) },
    { id: uid('geo'), lat: 28.6127, lng: 77.2291, title: 'Community Sports Complex', description: 'Cricket, basketball, swimming. 400 daily users.', type: 'sports', severity: 'low', status: 'active', domain: 'community', timestamp: hoursAgo(1) },
  ],
};

// ─── 5. MOCK_ALERTS ───────────────────────────────────────────────────────────

export const MOCK_ALERTS: Alert[] = [
  { id: uid('alert'), title: 'Critical AQI at Anand Vihar', description: 'AQI has crossed 150 at Anand Vihar monitoring station. PM2.5 at 82 µg/m³. GRAP Stage II measures recommended.', domain: 'environment', severity: 'critical', status: 'active', createdAt: hoursAgo(0.5), updatedAt: hoursAgo(0.3), location: { lat: 28.6668, lng: 77.2272, name: 'Anand Vihar' } },
  { id: uid('alert'), title: 'Power Outage — Anand Vihar Sector', description: 'Transformer failure at 33kV substation. 2,400 households affected. Repair crew dispatched.', domain: 'energy', severity: 'critical', status: 'active', createdAt: hoursAgo(0.5), updatedAt: hoursAgo(0.2), location: { lat: 28.6668, lng: 77.2272, name: 'Anand Vihar' } },
  { id: uid('alert'), title: 'Traffic Signal Malfunction — Red Fort', description: 'Traffic signal at Red Fort junction non-operational. Traffic police deployed for manual control.', domain: 'mobility', severity: 'warning', status: 'active', createdAt: hoursAgo(0.2), updatedAt: hoursAgo(0.1), location: { lat: 28.6291, lng: 77.2182, name: 'Red Fort Junction' } },
  { id: uid('alert'), title: 'Yamuna Water Level Rising', description: 'Water level at ITO barrage: 203.5m (warning level: 204.5m). Rate of rise: 0.3m/hr. Monitoring intensified.', domain: 'disaster', severity: 'warning', status: 'active', createdAt: hoursAgo(1), updatedAt: hoursAgo(0.1), location: { lat: 28.6139, lng: 77.2090, name: 'ITO Barrage' } },
  { id: uid('alert'), title: 'DUI Accident — Jangpura Road', description: 'Two-vehicle collision involving suspected drunk driver. 3 injuries reported. Ambulance and police on site.', domain: 'safety', severity: 'critical', status: 'active', createdAt: hoursAgo(0.6), updatedAt: hoursAgo(0.4), location: { lat: 28.5850, lng: 77.2350, name: 'Jangpura' } },
  { id: uid('alert'), title: 'Illegal Waste Burning Detected', description: 'Satellite imagery confirmed waste burning in East Delhi. SO2 levels spiking. Environmental squad dispatched.', domain: 'environment', severity: 'critical', status: 'active', createdAt: hoursAgo(0.2), updatedAt: hoursAgo(0.1), location: { lat: 28.6350, lng: 77.2420, name: 'East Delhi' } },
  { id: uid('alert'), title: 'ER Capacity at Safdarjung', description: 'Emergency room at Safdarjung Hospital running at 98% capacity. Diverting non-critical cases to RML.', domain: 'health', severity: 'warning', status: 'active', createdAt: hoursAgo(1.5), updatedAt: hoursAgo(0.5), location: { lat: 28.5850, lng: 77.2000, name: 'Safdarjung Hospital' } },
  { id: uid('alert'), title: 'Feeder Overload Warning', description: '11kV feeder at Jangpura at 108% capacity. Load shedding may be required if demand doesn\'t reduce in 1 hour.', domain: 'energy', severity: 'warning', status: 'monitoring', createdAt: hoursAgo(0.3), updatedAt: hoursAgo(0.1), location: { lat: 28.5850, lng: 77.2350, name: 'Jangpura' } },
  { id: uid('alert'), title: 'Ghazipur Landfill Fire Risk', description: 'Temperature sensors at Ghazipur landfill showing elevated readings. Fire brigade on standby.', domain: 'waste', severity: 'warning', status: 'monitoring', createdAt: hoursAgo(2), updatedAt: hoursAgo(1), location: { lat: 28.6668, lng: 77.2272, name: 'Ghazipur' } },
  { id: uid('alert'), title: 'Blood Supply Shortage — O+ and B+', description: 'Red Cross blood bank at Lodhi Colony reports critically low O+ and B+ blood stock. Donation drive needed.', domain: 'health', severity: 'warning', status: 'active', createdAt: hoursAgo(3), updatedAt: hoursAgo(1.5), location: { lat: 28.5921, lng: 77.2290, name: 'Lodhi Colony' } },
  { id: uid('alert'), title: 'Metro Delay — Blue Line', description: 'Signal failure between Rajiv Chowk and Mandi House. Trains running at reduced frequency. Delay: 15 min.', domain: 'mobility', severity: 'warning', status: 'active', createdAt: hoursAgo(0.8), updatedAt: hoursAgo(0.3) },
  { id: uid('alert'), title: 'Congestion Alert — ITO Junction', description: 'Heavy traffic due to metro construction. Average speed: 8 km/h. Expect 25 min delay.', domain: 'mobility', severity: 'info', status: 'active', createdAt: hoursAgo(0.5), updatedAt: hoursAgo(0.2) },
  { id: uid('alert'), title: 'Heatwave Advisory', description: 'IMD issues orange alert for Delhi. Max temp expected: 44°C. Citizens advised to stay indoors 12pm-4pm.', domain: 'disaster', severity: 'warning', status: 'active', createdAt: hoursAgo(4), updatedAt: hoursAgo(2) },
  { id: uid('alert'), title: 'Building Structural Alert — Nehru Place', description: 'Old commercial building flagged for structural weakness. Evacuation advisory issued for 3rd and 4th floors.', domain: 'disaster', severity: 'critical', status: 'active', createdAt: hoursAgo(8), updatedAt: hoursAgo(4), location: { lat: 28.5620, lng: 77.2400, name: 'Nehru Place' } },
  { id: uid('alert'), title: 'Water Supply Complaints Surge', description: '28 complaints about low water pressure in Patel Nagar area. Investigation team dispatched.', domain: 'engagement', severity: 'warning', status: 'active', createdAt: hoursAgo(1), updatedAt: hoursAgo(0.5), location: { lat: 28.6180, lng: 77.1780, name: 'Patel Nagar' } },
  { id: uid('alert'), title: 'Dengue Cases Spike — GTB Hospital', description: '42 dengue cases admitted in last 48 hours. Fogging operation scheduled for surrounding areas.', domain: 'health', severity: 'warning', status: 'active', createdAt: hoursAgo(6), updatedAt: hoursAgo(2), location: { lat: 28.6668, lng: 77.2272, name: 'GTB Hospital' } },
  { id: uid('alert'), title: 'Elevator Outage — Delhi Secretariat', description: 'Main elevator at Delhi Secretariat out of service. Impacts persons with disabilities. Repair ETA: 6 hours.', domain: 'accessibility', severity: 'critical', status: 'active', createdAt: hoursAgo(6), updatedAt: hoursAgo(3), location: { lat: 28.6291, lng: 77.2182, name: 'Delhi Secretariat' } },
  { id: uid('alert'), title: 'Overcrowding at Akshardham', description: 'Visitor count approaching daily limit of 10,000. Current wait time: 45 minutes.', domain: 'tourism', severity: 'info', status: 'active', createdAt: hoursAgo(0.5), updatedAt: hoursAgo(0.2), location: { lat: 28.6350, lng: 77.2420, name: 'Akshardham' } },
  { id: uid('alert'), title: 'Night Shelter Nearing Capacity', description: 'Chandni Chowk night shelter at 78% occupancy. Expected to reach capacity by 10pm.', domain: 'community', severity: 'info', status: 'active', createdAt: hoursAgo(2), updatedAt: hoursAgo(1) },
  { id: uid('alert'), title: 'School Bus Breakdown', description: 'School bus KA-01-1234 broke down near Hauz Khas. 32 students waiting. Replacement dispatched.', domain: 'education', severity: 'warning', status: 'active', createdAt: hoursAgo(1.2), updatedAt: hoursAgo(0.8), location: { lat: 28.5494, lng: 77.2001, name: 'Hauz Khas' } },
  { id: uid('alert'), title: 'Smart Meter Tampering Detected', description: 'Anomalous consumption pattern flagged at Kashmere Gate commercial zone. Possible theft.', domain: 'energy', severity: 'info', status: 'active', createdAt: hoursAgo(2), updatedAt: hoursAgo(1.5) },
  { id: uid('alert'), title: 'Garbage Overflow — Jama Masjid Area', description: 'Multiple bins overflowing near Jama Masjid. Emergency collection crew dispatched.', domain: 'waste', severity: 'warning', status: 'active', createdAt: hoursAgo(2), updatedAt: hoursAgo(1) },
  { id: uid('alert'), title: 'Noise Violation — Saket Construction', description: 'Construction noise exceeding 75 dB limit during restricted hours. Fine notice issued.', domain: 'environment', severity: 'info', status: 'active', createdAt: hoursAgo(3), updatedAt: hoursAgo(2) },
  { id: uid('alert'), title: 'Mobile Snatching Incident — AIIMS', description: 'Two phone snatching incidents reported near AIIMS metro exit within 2 hours. Extra patrol deployed.', domain: 'safety', severity: 'warning', status: 'active', createdAt: hoursAgo(0.8), updatedAt: hoursAgo(0.5), location: { lat: 28.5731, lng: 77.2106, name: 'AIIMS Metro' } },
  { id: uid('alert'), title: 'E-Learning Platform Slowdown', description: 'State e-learning platform experiencing 3x normal latency. DevOps team investigating.', domain: 'education', severity: 'info', status: 'active', createdAt: hoursAgo(1.5), updatedAt: hoursAgo(0.8) },
  { id: uid('alert'), title: 'Vaccination Drive Exceeding Target', description: 'COVID vaccination drive at Old Delhi center has administered 380 doses — 120% of target. Extra supplies requested.', domain: 'health', severity: 'info', status: 'active', createdAt: hoursAgo(3), updatedAt: hoursAgo(1) },
  { id: uid('alert'), title: 'PT Budget Voting Deadline', description: 'Participatory budgeting vote for Ward 12 closes in 6 hours. Only 1,800 of 8,000 eligible voters have participated.', domain: 'engagement', severity: 'info', status: 'active', createdAt: hoursAgo(6), updatedAt: hoursAgo(0.5) },
  { id: uid('alert'), title: 'Heritage Site Conservation Alert', description: 'Moisture damage detected at Humayun\'s Tomb western wall. Conservation team notified.', domain: 'tourism', severity: 'warning', status: 'active', createdAt: hoursAgo(12), updatedAt: hoursAgo(6), location: { lat: 28.5933, lng: 77.2507, name: "Humayun's Tomb" } },
  { id: uid('alert'), title: 'Community Health Camp Reminder', description: 'Free health screening camp at Model Town community center tomorrow 9am-2pm.', domain: 'community', severity: 'info', status: 'active', createdAt: hoursAgo(8), updatedAt: hoursAgo(4) },
  { id: uid('alert'), title: 'Bomb Hoax — Saket Mall (Resolved)', description: 'Hoax bomb call at Saket mall. Area secured and cleared. Normal operations resumed.', domain: 'safety', severity: 'critical', status: 'resolved', createdAt: hoursAgo(4), updatedAt: hoursAgo(2.5), location: { lat: 28.5355, lng: 77.2100, name: 'Saket Mall' } },
  { id: uid('alert'), title: 'Road Accident — Lodhi Road', description: 'Two-vehicle collision near Lodhi Garden. One lane blocked. Minor injuries.', domain: 'mobility', severity: 'warning', status: 'active', createdAt: hoursAgo(0.3), updatedAt: hoursAgo(0.1), location: { lat: 28.5921, lng: 77.2290, name: 'Lodhi Road' } },
  { id: uid('alert'), title: 'Recycling Rate Milestone', description: 'City recycling rate has crossed 34% — highest ever. Keep up the momentum!', domain: 'waste', severity: 'info', status: 'active', createdAt: hoursAgo(10), updatedAt: hoursAgo(10) },
  { id: uid('alert'), title: 'Senior Citizen Health Concern', description: 'Two elderly residents at Jangpura day care showing signs of heat exhaustion. Medical attention provided.', domain: 'community', severity: 'warning', status: 'resolved', createdAt: hoursAgo(5), updatedAt: hoursAgo(3) },
  { id: uid('alert'), title: 'Wheelchair Ramp Damage — CP', description: 'Wheelchair ramp at Connaught Place outer circle damaged by vehicle. Temporary ramp installed.', domain: 'accessibility', severity: 'warning', status: 'active', createdAt: hoursAgo(7), updatedAt: hoursAgo(4) },
  { id: uid('alert'), title: 'Construction Debris Dumping', description: 'Illegal construction debris dumped near India Gate lawns. Fine issued. Cleanup ordered.', domain: 'waste', severity: 'warning', status: 'active', createdAt: hoursAgo(3), updatedAt: hoursAgo(1.5) },
  { id: uid('alert'), title: 'Low Enrollment Alert — Anganwadi #247', description: 'Enrollment at Anganwadi #247 dropped 15% this quarter. Community outreach recommended.', domain: 'education', severity: 'info', status: 'active', createdAt: hoursAgo(24), updatedAt: hoursAgo(12) },
  { id: uid('alert'), title: 'Tourist Scam Reports — CP Area', description: '3 tourist scam reports in Connaught Place today. Tourist police visibility increased.', domain: 'tourism', severity: 'warning', status: 'active', createdAt: hoursAgo(2), updatedAt: hoursAgo(1) },
  { id: uid('alert'), title: 'Chemical Spill Response', description: 'Minor chemical spill at Okhla industrial area. HazMat team on site. No evacuation needed.', domain: 'disaster', severity: 'warning', status: 'resolved', createdAt: hoursAgo(8), updatedAt: hoursAgo(5) },
  { id: uid('alert'), title: 'Model Town Algae Bloom', description: 'Algae bloom detected in Model Town lake. Water quality affected. Cleanup planned for tomorrow.', domain: 'environment', severity: 'info', status: 'monitoring', createdAt: hoursAgo(5), updatedAt: hoursAgo(3) },
  { id: uid('alert'), title: 'Skill Training Batch Full', description: 'Electronics repair training at Saket center is fully enrolled. Waitlist: 42.', domain: 'community', severity: 'info', status: 'active', createdAt: hoursAgo(12), updatedAt: hoursAgo(8) },
  { id: uid('alert'), title: 'Paratransit Van Breakdown', description: 'Accessible transport van #AT-03 broken down at Karol Bagh. 4 passengers waiting. Replacement dispatched.', domain: 'accessibility', severity: 'warning', status: 'active', createdAt: hoursAgo(1.5), updatedAt: hoursAgo(0.8) },
];

// ─── 6. MOCK_WORKFLOWS ───────────────────────────────────────────────────────

function makeSteps(labels: string[], completed: number): WorkflowStep[] {
  return labels.map((label, i) => ({
    id: uid('step'),
    label,
    status: i < completed ? 'completed' : i === completed ? 'in_progress' : 'pending',
    assignee: ['Dept Head', 'Commissioner', 'Engineer', 'Officer', 'Analyst'][i % 5],
    completedAt: i < completed ? hoursAgo(24 - i * 4) : undefined,
  }));
}

export const MOCK_WORKFLOWS: Workflow[] = [
  { id: uid('wf'), title: 'Deploy Adaptive Traffic Signals — Ring Road', description: 'Install AI-powered adaptive traffic signals at 12 junctions on Ring Road to reduce congestion by 20%.', domain: 'mobility', status: 'pending_approval', priority: 'high', createdAt: daysAgo(3), updatedAt: hoursAgo(4), createdBy: 'Transport Dept', steps: makeSteps(['Site Survey', 'Procurement', 'Installation', 'Testing', 'Go-Live'], 2), approver: 'Commissioner (Transport)' },
  { id: uid('wf'), title: 'Expand CCTV Coverage — South Delhi', description: 'Add 200 AI-enabled CCTV cameras across South Delhi neighborhoods for enhanced surveillance.', domain: 'safety', status: 'approved', priority: 'high', createdAt: daysAgo(7), updatedAt: daysAgo(1), createdBy: 'Delhi Police', steps: makeSteps(['Budget Approval', 'Vendor Selection', 'Installation', 'Network Integration', 'Go-Live'], 3), approver: 'Lt. Governor Office' },
  { id: uid('wf'), title: 'Mobile Health Van Expansion', description: 'Deploy 10 additional mobile health vans to underserved areas in East and North Delhi.', domain: 'health', status: 'in_progress', priority: 'high', createdAt: daysAgo(14), updatedAt: daysAgo(2), createdBy: 'Health Dept', steps: makeSteps(['Needs Assessment', 'Vehicle Procurement', 'Staff Hiring', 'Equipment Setup', 'Route Planning', 'Launch'], 3) },
  { id: uid('wf'), title: 'Smart Classroom Pilot — 50 Schools', description: 'Install digital smartboards, projectors, and high-speed internet in 50 MCD schools.', domain: 'education', status: 'in_progress', priority: 'medium', createdAt: daysAgo(21), updatedAt: daysAgo(3), createdBy: 'Education Dept', steps: makeSteps(['School Selection', 'Infrastructure Audit', 'Procurement', 'Installation', 'Teacher Training', 'Launch'], 4) },
  { id: uid('wf'), title: 'Real-Time AQI Dashboard', description: 'Deploy 50 additional air quality sensors and integrate into real-time public dashboard.', domain: 'environment', status: 'pending_approval', priority: 'high', createdAt: daysAgo(5), updatedAt: hoursAgo(8), createdBy: 'DPCC', steps: makeSteps(['Sensor Procurement', 'Site Identification', 'Installation', 'Calibration', 'Dashboard Integration'], 1), approver: 'Environment Secretary' },
  { id: uid('wf'), title: 'Waste Segregation Campaign', description: 'City-wide door-to-door campaign to promote wet/dry waste segregation. Target: 50,000 households.', domain: 'waste', status: 'in_progress', priority: 'medium', createdAt: daysAgo(10), updatedAt: daysAgo(1), createdBy: 'MCD', steps: makeSteps(['IEC Material Design', 'Volunteer Training', 'Ward-wise Rollout', 'Monitoring', 'Impact Assessment'], 2) },
  { id: uid('wf'), title: 'Solar Panel Installation — Govt Buildings', description: 'Install rooftop solar panels on 100 government buildings. Target capacity: 10 MW.', domain: 'energy', status: 'approved', priority: 'high', createdAt: daysAgo(30), updatedAt: daysAgo(5), createdBy: 'Energy Dept', steps: makeSteps(['Building Audit', 'Tender', 'Vendor Award', 'Installation', 'Grid Connection', 'Commissioning'], 3), approver: 'Chief Secretary' },
  { id: uid('wf'), title: 'Citizen Feedback App v2.0', description: 'Upgrade citizen engagement app with AI chatbot, multilingual support, and real-time tracking.', domain: 'engagement', status: 'in_progress', priority: 'medium', createdAt: daysAgo(45), updatedAt: daysAgo(3), createdBy: 'IT Dept', steps: makeSteps(['Requirements', 'UI/UX Design', 'Backend Development', 'AI Integration', 'UAT', 'Launch'], 4) },
  { id: uid('wf'), title: 'Accessibility Audit — Metro Stations', description: 'Comprehensive accessibility audit of all 250+ Delhi Metro stations.', domain: 'accessibility', status: 'pending_approval', priority: 'medium', createdAt: daysAgo(8), updatedAt: hoursAgo(12), createdBy: 'DMRC', steps: makeSteps(['Auditor Selection', 'Phase 1 (Blue Line)', 'Phase 2 (Yellow/Red)', 'Phase 3 (Others)', 'Report & Action Plan'], 0), approver: 'DMRC MD' },
  { id: uid('wf'), title: 'Flood Early Warning System Upgrade', description: 'Upgrade Yamuna flood sensors with IoT connectivity and AI-based prediction (6-hour lead time).', domain: 'disaster', status: 'approved', priority: 'urgent', createdAt: daysAgo(15), updatedAt: daysAgo(2), createdBy: 'SDMA', steps: makeSteps(['Sensor Procurement', 'AI Model Training', 'Installation', 'System Integration', 'Mock Drill'], 2), approver: 'Chief Secretary' },
  { id: uid('wf'), title: 'Heritage Walk Circuit', description: 'Create 5 curated heritage walk routes with QR-coded information boards and audio guides.', domain: 'tourism', status: 'in_progress', priority: 'low', createdAt: daysAgo(60), updatedAt: daysAgo(7), createdBy: 'Tourism Dept', steps: makeSteps(['Route Design', 'Content Creation', 'Board Installation', 'App Integration', 'Soft Launch'], 3) },
  { id: uid('wf'), title: 'Skill India Center — Shahdara', description: 'Establish new Skill India center in Shahdara with courses in IT, electrical, and healthcare.', domain: 'community', status: 'pending_approval', priority: 'medium', createdAt: daysAgo(12), updatedAt: hoursAgo(18), createdBy: 'Social Welfare Dept', steps: makeSteps(['Space Identification', 'Renovation', 'Equipment Procurement', 'Trainer Recruitment', 'Student Enrollment', 'Inauguration'], 1), approver: 'District Magistrate' },
  { id: uid('wf'), title: 'EV Bus Fleet Expansion', description: 'Procure 300 electric buses for DTC fleet. Phase 1: 100 buses on high-traffic routes.', domain: 'mobility', status: 'approved', priority: 'high', createdAt: daysAgo(90), updatedAt: daysAgo(10), createdBy: 'Transport Dept', steps: makeSteps(['Tender', 'Vendor Selection', 'Manufacturing', 'Delivery', 'Depot Charging Setup', 'Route Integration'], 3), approver: 'Cabinet' },
  { id: uid('wf'), title: 'Yamuna Cleanup Phase III', description: 'Interceptor sewer installation to prevent 120 MLD of sewage from entering Yamuna.', domain: 'environment', status: 'in_progress', priority: 'urgent', createdAt: daysAgo(180), updatedAt: daysAgo(5), createdBy: 'DJB', steps: makeSteps(['Design Finalization', 'Land Acquisition', 'Tunnel Boring', 'STP Construction', 'Commissioning'], 2) },
  { id: uid('wf'), title: 'Body-Worn Camera Rollout', description: 'Deploy body-worn cameras to 5,000 frontline police officers across Delhi.', domain: 'safety', status: 'pending_approval', priority: 'high', createdAt: daysAgo(6), updatedAt: hoursAgo(6), createdBy: 'Delhi Police', steps: makeSteps(['Policy Framework', 'Procurement', 'Training', 'Phased Deployment', 'Data Management Setup'], 0), approver: 'Home Ministry' },
  { id: uid('wf'), title: 'Telemedicine Platform Launch', description: 'Launch telemedicine platform connecting 200 mohalla clinics with specialist doctors.', domain: 'health', status: 'completed', priority: 'high', createdAt: daysAgo(120), updatedAt: daysAgo(15), createdBy: 'Health Dept', steps: makeSteps(['Platform Development', 'Doctor Onboarding', 'Clinic Integration', 'Pilot Run', 'Statewide Launch'], 5) },
  { id: uid('wf'), title: 'Night Shelter Expansion', description: 'Add 10 new permanent night shelters in identified gap areas across Delhi.', domain: 'community', status: 'in_progress', priority: 'medium', createdAt: daysAgo(45), updatedAt: daysAgo(7), createdBy: 'DUSIB', steps: makeSteps(['Site Selection', 'Design', 'Construction', 'Furnishing', 'Staffing', 'Opening'], 2) },
  { id: uid('wf'), title: 'Waste-to-Energy Plant Audit', description: 'Annual environmental compliance audit of all 3 waste-to-energy plants in Delhi.', domain: 'waste', status: 'completed', priority: 'medium', createdAt: daysAgo(30), updatedAt: daysAgo(5), createdBy: 'DPCC', steps: makeSteps(['Okhla Plant Audit', 'Narela Plant Audit', 'Ghazipur Plant Audit', 'Compliance Report', 'Public Disclosure'], 5) },
];

// ─── 7. MOCK_SERVICES ─────────────────────────────────────────────────────────

export const MOCK_SERVICES: CityService[] = [
  { id: uid('svc'), name: 'Integrated Traffic Management System', description: 'Real-time traffic monitoring, signal control, and incident management across 1,200 junctions.', category: 'transport', domain: 'mobility', status: 'operational', uptime: 99.2 },
  { id: uid('svc'), name: 'Delhi Metro Rail Network', description: 'Automated train control, passenger information, and smart ticketing system.', category: 'transport', domain: 'mobility', status: 'operational', uptime: 99.8 },
  { id: uid('svc'), name: 'Crime Analytics Platform', description: 'AI-powered crime prediction, hotspot analysis, and resource deployment optimization.', category: 'public_safety', domain: 'safety', status: 'operational', uptime: 99.5 },
  { id: uid('svc'), name: 'Emergency Response System (112)', description: 'Unified emergency number integrating police, fire, and ambulance dispatch.', category: 'public_safety', domain: 'safety', status: 'operational', uptime: 99.9 },
  { id: uid('svc'), name: 'CCTV Surveillance Network', description: '4,820 cameras with AI analytics for face recognition and anomaly detection.', category: 'public_safety', domain: 'safety', status: 'operational', uptime: 97.8 },
  { id: uid('svc'), name: 'Hospital Management System', description: 'Centralized system for bed availability, patient flow, and resource management.', category: 'healthcare', domain: 'health', status: 'operational', uptime: 98.5 },
  { id: uid('svc'), name: 'Ambulance Tracking System', description: 'GPS-enabled real-time tracking of 340 ambulances with auto-dispatch.', category: 'healthcare', domain: 'health', status: 'operational', uptime: 99.1 },
  { id: uid('svc'), name: 'Disease Surveillance System', description: 'Real-time disease outbreak monitoring and early warning system.', category: 'healthcare', domain: 'health', status: 'operational', uptime: 98.8 },
  { id: uid('svc'), name: 'Student Information System', description: 'Centralized enrollment, attendance, and performance tracking for 1,842 schools.', category: 'education', domain: 'education', status: 'operational', uptime: 97.2 },
  { id: uid('svc'), name: 'E-Learning Portal', description: 'Online learning platform with video lectures, assessments, and progress tracking.', category: 'education', domain: 'education', status: 'degraded', uptime: 94.5, lastIncident: hoursAgo(1.5) },
  { id: uid('svc'), name: 'Air Quality Monitoring Network', description: '42 continuous ambient air quality monitoring stations with real-time data.', category: 'environment', domain: 'environment', status: 'operational', uptime: 96.8 },
  { id: uid('svc'), name: 'Water Quality Monitoring', description: 'IoT sensors monitoring water quality at 180 points across Delhi.', category: 'environment', domain: 'environment', status: 'operational', uptime: 95.4 },
  { id: uid('svc'), name: 'Smart Waste Collection', description: 'GPS-tracked collection vehicles with smart bin fill-level monitoring.', category: 'environment', domain: 'waste', status: 'operational', uptime: 96.1 },
  { id: uid('svc'), name: 'Recycling Management Platform', description: 'Material recovery facility management and recycler coordination.', category: 'environment', domain: 'waste', status: 'operational', uptime: 97.3 },
  { id: uid('svc'), name: 'Power Grid SCADA', description: 'Supervisory control of Delhi\'s power distribution grid — substations, feeders, transformers.', category: 'utilities', domain: 'energy', status: 'operational', uptime: 99.6 },
  { id: uid('svc'), name: 'Smart Metering Infrastructure', description: '14,000+ smart meters with real-time consumption data and tamper detection.', category: 'utilities', domain: 'energy', status: 'operational', uptime: 98.2 },
  { id: uid('svc'), name: 'Solar Monitoring Dashboard', description: 'Real-time generation monitoring of 480 MW rooftop and ground-mounted solar.', category: 'utilities', domain: 'energy', status: 'operational', uptime: 98.9 },
  { id: uid('svc'), name: 'Citizen Grievance Portal', description: 'Online portal for filing and tracking municipal complaints and grievances.', category: 'digital', domain: 'engagement', status: 'operational', uptime: 98.4 },
  { id: uid('svc'), name: 'Delhi 311 Helpline', description: 'Municipal helpline for non-emergency queries. AI-assisted call routing.', category: 'digital', domain: 'engagement', status: 'operational', uptime: 99.0 },
  { id: uid('svc'), name: 'Accessibility Compliance Tracker', description: 'System tracking accessibility compliance across public facilities.', category: 'infrastructure', domain: 'accessibility', status: 'operational', uptime: 96.5 },
  { id: uid('svc'), name: 'Paratransit Booking System', description: 'On-demand accessible van booking for persons with disabilities.', category: 'transport', domain: 'accessibility', status: 'degraded', uptime: 93.2, lastIncident: hoursAgo(1.5) },
  { id: uid('svc'), name: 'Flood Warning System', description: 'Yamuna river level monitoring with IoT sensors and AI prediction.', category: 'public_safety', domain: 'disaster', status: 'operational', uptime: 99.4 },
  { id: uid('svc'), name: 'Emergency Broadcast System', description: 'Multi-channel alert system: SMS, sirens, app notifications, PA system.', category: 'public_safety', domain: 'disaster', status: 'operational', uptime: 99.7 },
  { id: uid('svc'), name: 'Tourism Information System', description: 'Tourist information kiosks, mobile app, and heritage walk guides.', category: 'digital', domain: 'tourism', status: 'operational', uptime: 97.8 },
  { id: uid('svc'), name: 'Visitor Analytics Platform', description: 'Footfall counting, crowd density, and visitor flow analysis at heritage sites.', category: 'digital', domain: 'tourism', status: 'operational', uptime: 96.2 },
  { id: uid('svc'), name: 'Social Welfare Benefit System', description: 'Digital platform for pension, scholarship, and subsidy disbursement.', category: 'digital', domain: 'community', status: 'operational', uptime: 97.9 },
  { id: uid('svc'), name: 'Skill Training Registration Portal', description: 'Online registration for government skill training programs.', category: 'digital', domain: 'community', status: 'operational', uptime: 98.1 },
  { id: uid('svc'), name: 'Community Center Booking System', description: 'Online booking for community halls and event spaces.', category: 'digital', domain: 'community', status: 'maintenance', uptime: 95.0, lastIncident: hoursAgo(6) },
];

// ─── 8. CITY_STATS ────────────────────────────────────────────────────────────

export const CITY_STATS: CityStatsData = {
  population: 32_941_000,
  area: 1_484,
  districts: 11,
  activeSensors: 8_426,
  connectedSystems: 142,
  dataPointsToday: 24_800_000,
  aiQueriesHandled: 4_218,
  activeAlerts: MOCK_ALERTS.filter(a => a.status === 'active').length,
  servicesOnline: MOCK_SERVICES.filter(s => s.status === 'operational').length,
  citizenSatisfaction: 78,
};
