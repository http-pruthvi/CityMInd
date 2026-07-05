import { create } from 'zustand';
import type { Alert, MetricValue, GeoMarker, DomainId } from '@/types';
import { MOCK_ALERTS, MOCK_METRICS, MOCK_GEO_MARKERS } from '@/lib/mock/data';

interface DashboardState {
  alerts: Alert[];
  metrics: Record<DomainId, MetricValue[]>;
  markers: Record<DomainId, GeoMarker[]>;
  selectedDomain: DomainId | null;
  sidebarOpen: boolean;
  setSelectedDomain: (domain: DomainId | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  alerts: MOCK_ALERTS,
  metrics: MOCK_METRICS,
  markers: MOCK_GEO_MARKERS,
  selectedDomain: null,
  sidebarOpen: true,
  setSelectedDomain: (domain) => set({ selectedDomain: domain }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  acknowledgeAlert: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === id ? { ...a, status: 'acknowledged' as const } : a)),
    })),
  resolveAlert: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === id ? { ...a, status: 'resolved' as const } : a)),
    })),
}));
