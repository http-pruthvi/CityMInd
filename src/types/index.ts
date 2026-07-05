/* ============================================================
   CityMind — Complete TypeScript Type Definitions
   AI-Powered Decision Intelligence Platform for Smart Cities
   ============================================================ */

// ──────────────────────────────────────────────────────────────
//  USER & AUTH
// ──────────────────────────────────────────────────────────────

export type UserRole = 'citizen' | 'operator' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ──────────────────────────────────────────────────────────────
//  DOMAINS
// ──────────────────────────────────────────────────────────────

export type DomainId =
  | 'mobility'
  | 'safety'
  | 'health'
  | 'education'
  | 'environment'
  | 'waste'
  | 'energy'
  | 'engagement'
  | 'accessibility'
  | 'disaster'
  | 'tourism'
  | 'community';

export interface DomainConfig {
  id: DomainId;
  name: string;
  description: string;
  icon: string;             // Lucide icon name
  color: string;            // CSS color value
  gradient?: string;         // CSS gradient for backgrounds
  metrics: string[] | MetricDef[];
  enabled?: boolean;
  stat?: string;
  statLabel?: string;
}

// ──────────────────────────────────────────────────────────────
//  METRICS & KPIs
// ──────────────────────────────────────────────────────────────

export type MetricFormat = 'number' | 'percent' | 'currency' | 'duration' | 'distance';

export interface MetricDef {
  id: string;
  name: string;
  unit: string;
  format?: MetricFormat;
  description?: string;
  thresholds?: MetricThresholds;
}

export interface MetricThresholds {
  critical?: number;
  warning?: number;
  target?: number;
}

export type TrendDirection = 'up' | 'down' | 'stable';

export interface MetricValue {
  id?: string;
  metricId?: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  trend?: TrendDirection;
  timestamp?: string;
  domain?: DomainId;
  label?: string;
  unit?: string;
  changeDirection?: string;
  status?: string;
  sparkline?: number[];
}

export interface KPICard {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  change?: number;
  changePercent?: number;
  trend?: TrendDirection;
  icon?: string;
  color?: string;
  domain: DomainId;
  sparkline?: number[];
}

// ──────────────────────────────────────────────────────────────
//  TIME SERIES
// ──────────────────────────────────────────────────────────────

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface TimeSeriesData {
  id: string;
  name?: string;
  points?: TimeSeriesPoint[];
  domain?: DomainId;
  unit?: string;
  color?: string;
  label?: string;
  data?: any[];
}

export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d' | '90d' | '1y' | 'custom';

export interface TimeRangeSelection {
  range: TimeRange;
  from?: string;
  to?: string;
}

// ──────────────────────────────────────────────────────────────
//  GEO / MAP
// ──────────────────────────────────────────────────────────────

export interface GeoPoint {
  lat: number;
  lng: number;
  name?: string;
}

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export type MapMarkerType = string;

export interface GeoMarker {
  id: string;
  position?: GeoPoint;
  lat: number;
  lng: number;
  type: MapMarkerType;
  title: string;
  description?: string;
  severity?: AlertSeverity;
  domain: DomainId;
  icon?: string;
  color?: string;
  status?: string;
  timestamp?: string;
  data?: Record<string, unknown>;
}

export interface GeoHeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

export interface GeoRegion {
  id: string;
  name: string;
  coordinates: GeoPoint[];   // polygon boundary
  properties?: Record<string, unknown>;
}

export type MapLayer = 'markers' | 'heatmap' | 'regions' | 'traffic' | 'sensors';

export interface MapViewState {
  center: GeoPoint;
  zoom: number;
  layers: MapLayer[];
  selectedMarker?: string;
}

// ──────────────────────────────────────────────────────────────
//  ALERTS
// ──────────────────────────────────────────────────────────────

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'warning' | 'urgent';

export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'escalated' | 'monitoring';

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  domain: DomainId;
  location?: GeoPoint;
  locationName?: string;
  timestamp?: string;
  createdAt?: string;
  updatedAt?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  assignee?: string;
  assigneeName?: string;
  source?: string;
  actions?: AlertAction[];
  relatedAlerts?: string[];
  tags?: string[];
}

export interface AlertAction {
  id: string;
  label: string;
  type: 'acknowledge' | 'escalate' | 'resolve' | 'assign' | 'dismiss' | 'custom';
  params?: Record<string, unknown>;
}

export interface AlertFilter {
  severity?: AlertSeverity[];
  status?: AlertStatus[];
  domain?: DomainId[];
  dateRange?: TimeRangeSelection;
  search?: string;
}

export interface AlertStats {
  total: number;
  bySeverity: Record<AlertSeverity, number>;
  byStatus: Record<AlertStatus, number>;
  byDomain: Record<DomainId, number>;
}

// ──────────────────────────────────────────────────────────────
//  CHAT / AI ASSISTANT
// ──────────────────────────────────────────────────────────────

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  citations?: Citation[];
  charts?: ChartSuggestion[];
  mapData?: MapSuggestion;
  domain?: DomainId;
  actions?: SuggestedAction[];
  isStreaming?: boolean;
  metadata?: Record<string, unknown>;
}

export interface Citation {
  title: string;
  source: string;
  url?: string;
  confidence: number;   // 0.0 – 1.0
  snippet?: string;
}

export interface ChartSuggestion {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'radar';
  title: string;
  data: Record<string, unknown>[];
  config?: Record<string, unknown>;
}

export interface MapSuggestion {
  markers?: GeoMarker[];
  heatmap?: GeoHeatmapPoint[];
  center?: GeoPoint;
  zoom?: number;
}

export interface SuggestedAction {
  id: string;
  label: string;
  description?: string;
  type: 'query' | 'navigate' | 'workflow' | 'report';
  payload: Record<string, unknown>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  domain?: DomainId;
  createdAt: string;
  updatedAt: string;
}

// ──────────────────────────────────────────────────────────────
//  WORKFLOWS
// ──────────────────────────────────────────────────────────────

export type WorkflowStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'pending_approval'
  | 'in_progress';

export interface Workflow {
  id: string;
  title: string;
  description: string;
  domain: DomainId;
  status: WorkflowStatus;
  triggeredBy?: string;        // user id
  triggeredByName?: string;
  createdBy?: string;          // support createdBy alias
  approver?: string;
  approverName?: string;
  actions?: WorkflowAction[];
  steps?: { label: string; status: string }[]; // supports steps list in mock flows
  priority: AlertSeverity;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  notes?: string;
}

export interface WorkflowAction {
  id: string;
  type: string;
  label: string;
  params: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  order: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  domain: DomainId;
  actions: Omit<WorkflowAction, 'id' | 'status' | 'result' | 'error' | 'startedAt' | 'completedAt'>[];
  requiredApproval: boolean;
}

// ──────────────────────────────────────────────────────────────
//  REPORTS
// ──────────────────────────────────────────────────────────────

export type ReportFormat = 'pdf' | 'html' | 'csv' | 'json';

export type ReportType =
  | 'daily_summary'
  | 'weekly_digest'
  | 'incident_report'
  | 'performance_analysis'
  | 'custom';

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  domain?: DomainId;
  generatedAt: string;
  generatedBy?: string;
  content: string;
  summary?: string;
  format: ReportFormat;
  fileUrl?: string;
  size?: number;
}

// ──────────────────────────────────────────────────────────────
//  CITIZEN REPORTS
// ──────────────────────────────────────────────────────────────

export type CitizenReportCategory =
  | 'pothole'
  | 'streetlight'
  | 'water_leak'
  | 'garbage'
  | 'noise'
  | 'pollution'
  | 'safety'
  | 'accessibility'
  | 'other';

export type CitizenReportStatus =
  | 'submitted'
  | 'under_review'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export interface CitizenReport {
  id: string;
  title: string;
  description: string;
  category: CitizenReportCategory;
  location: GeoPoint;
  locationName?: string;
  photos?: string[];
  status: CitizenReportStatus;
  priority?: AlertSeverity;
  reportedBy?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  trackingId: string;
  upvotes: number;
  comments?: CitizenReportComment[];
}

export interface CitizenReportComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  isOfficial: boolean;
}

// ──────────────────────────────────────────────────────────────
//  CITY SERVICES
// ──────────────────────────────────────────────────────────────

export interface CityService {
  id: string;
  name: string;
  description: string;
  category: string;
  department?: string;
  url?: string;
  contactInfo?: ContactInfo;
  isActive?: boolean;
  icon?: string;
  domain?: string;
  status?: string;
  uptime?: string | number;
  lastIncident?: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
}

// ──────────────────────────────────────────────────────────────
//  SIMULATIONS
// ──────────────────────────────────────────────────────────────

export type SimulationStatus = 'draft' | 'running' | 'completed' | 'failed';

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  domain: DomainId;
  status: SimulationStatus;
  params: SimParam[];
  results?: SimResult[];
  createdAt: string;
  completedAt?: string;
  createdBy: string;
}

export interface SimParam {
  id: string;
  name: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  description?: string;
}

export interface SimResult {
  metric: string;
  metricLabel: string;
  before: number;
  after: number;
  change: number;
  changePercent: number;
  unit: string;
  confidence?: number;
}

// ──────────────────────────────────────────────────────────────
//  NOTIFICATIONS
// ──────────────────────────────────────────────────────────────

export type NotificationType = 'alert' | 'workflow' | 'report' | 'system' | 'chat';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  icon?: string;
  severity?: AlertSeverity;
  createdAt: string;
  expiresAt?: string;
}

// ──────────────────────────────────────────────────────────────
//  API RESPONSES
// ──────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
  processingTimeMs: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}

export interface CityStatsData {
  population: number;
  area: number;
  districts: number;
  activeSensors: number;
  connectedSystems: number;
  dataPointsToday: number;
  aiQueriesHandled: number;
  activeAlerts: number;
  servicesOnline: number;
  citizenSatisfaction: number;
}

export interface WorkflowStep {
  label: string;
  status: string;
}
