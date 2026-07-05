import { create } from 'zustand';
import type { Alert, AlertSeverity, DomainId, AlertStatus } from '@/types';
import { MOCK_ALERTS } from '@/lib/mock/data';

interface AlertState {
  alerts: Alert[];
  severityFilter: AlertSeverity | 'all';
  domainFilter: DomainId | 'all';
  statusFilter: AlertStatus | 'all';
  setSeverityFilter: (filter: AlertSeverity | 'all') => void;
  setDomainFilter: (filter: DomainId | 'all') => void;
  setStatusFilter: (filter: AlertStatus | 'all') => void;
  filteredAlerts: () => Alert[];
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  escalateAlert: (id: string) => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: MOCK_ALERTS,
  severityFilter: 'all',
  domainFilter: 'all',
  statusFilter: 'all',
  setSeverityFilter: (filter) => set({ severityFilter: filter }),
  setDomainFilter: (filter) => set({ domainFilter: filter }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  filteredAlerts: () => {
    const { alerts, severityFilter, domainFilter, statusFilter } = get();
    return alerts.filter((a) => {
      if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
      if (domainFilter !== 'all' && a.domain !== domainFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      return true;
    });
  },
  acknowledgeAlert: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === id ? { ...a, status: 'acknowledged' as const } : a)),
    })),
  resolveAlert: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === id ? { ...a, status: 'resolved' as const } : a)),
    })),
  escalateAlert: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === id ? { ...a, status: 'escalated' as const } : a)),
    })),
}));
