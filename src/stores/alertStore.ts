import { create } from 'zustand';
import type { Alert } from '@/types';

interface AlertState {
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  setAlerts: (alerts) => set({ alerts }),
  acknowledgeAlert: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === id ? { ...a, status: 'acknowledged' as const } : a)),
    })),
  resolveAlert: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === id ? { ...a, status: 'resolved' as const } : a)),
    })),
}));
