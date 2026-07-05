import { create } from 'zustand';
import type { Alert, GeoMarker, DomainId } from '@/types';

export interface CityConfig {
  id: string;
  name: string;
  lat: number;
  lng: number;
  places: Record<string, string>;
}

export const CITIES: CityConfig[] = [
  {
    id: 'delhi',
    name: 'New Delhi',
    lat: 28.6139,
    lng: 77.2090,
    places: {
      anandVihar: 'Anand Vihar',
      redFort: 'Red Fort',
      jangpura: 'Jangpura',
      safdarjung: 'Safdarjung',
      okhla: 'Okhla',
      narela: 'Narela',
      ghazipur: 'Ghazipur',
    }
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    lat: 19.0760,
    lng: 72.8777,
    places: {
      anandVihar: 'Bandra West',
      redFort: 'Gateway of India',
      jangpura: 'Colaba Causeway',
      safdarjung: 'Andheri East',
      okhla: 'Dharavi Central',
      narela: 'Kurla Junction',
      ghazipur: 'Chembur East',
    }
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    lat: 12.9716,
    lng: 77.5946,
    places: {
      anandVihar: 'Whitefield',
      redFort: 'Cubbon Park',
      jangpura: 'Indiranagar',
      safdarjung: 'Koramangala',
      okhla: 'Electronic City',
      narela: 'Hebbal Flyover',
      ghazipur: 'Marathahalli',
    }
  },
  {
    id: 'chennai',
    name: 'Chennai',
    lat: 13.0827,
    lng: 80.2707,
    places: {
      anandVihar: 'Adyar',
      redFort: 'Marina Beach',
      jangpura: 'T. Nagar',
      safdarjung: 'Velachery',
      okhla: 'Guindy Industrial',
      narela: 'Tambaram',
      ghazipur: 'Ambattur',
    }
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    lat: 22.5726,
    lng: 88.3639,
    places: {
      anandVihar: 'Salt Lake',
      redFort: 'Victoria Memorial',
      jangpura: 'Park Street',
      safdarjung: 'Ballygunge',
      okhla: 'Howrah Station',
      narela: 'Rajarhat',
      ghazipur: 'Tollygunge',
    }
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    lat: 17.3850,
    lng: 78.4867,
    places: {
      anandVihar: 'Gachibowli',
      redFort: 'Charminar',
      jangpura: 'Banjara Hills',
      safdarjung: 'Jubilee Hills',
      okhla: 'Hitech City',
      narela: 'Secunderabad',
      ghazipur: 'Begumpet',
    }
  }
];

interface DashboardState {
  alerts: Alert[];
  markers: Record<DomainId, GeoMarker[]>;
  selectedDomain: DomainId | null;
  sidebarOpen: boolean;
  currentCity: string;
  dataLoaded: boolean;
  setSelectedDomain: (domain: DomainId | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  setCurrentCity: (cityId: string) => void;
  fetchLiveData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  alerts: [],
  markers: {} as Record<DomainId, GeoMarker[]>,
  selectedDomain: null,
  sidebarOpen: true,
  currentCity: 'delhi',
  dataLoaded: false,
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
  setCurrentCity: (cityId) => set({ currentCity: cityId }),
  fetchLiveData: async () => {
    try {
      const res = await fetch('/api/data/alerts');
      const json = await res.json();
      if (!json.success) return;

      const alerts: Alert[] = json.data || [];
      const markers: Record<string, GeoMarker[]> = {};

      for (const alert of alerts) {
        if (!alert.location) continue;
        const domain = alert.domain as DomainId;
        if (!markers[domain]) markers[domain] = [];
        markers[domain].push({
          id: alert.id,
          lat: alert.location.lat,
          lng: alert.location.lng,
          type: 'alert',
          title: alert.title,
          description: alert.description,
          severity: alert.severity,
          domain,
          status: alert.status,
          timestamp: alert.createdAt || alert.timestamp,
        });
      }

      set({ alerts, markers: markers as Record<DomainId, GeoMarker[]>, dataLoaded: true });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      set({ dataLoaded: true });
    }
  },
}));

export const getCityConfig = (cityId: string) => CITIES.find(c => c.id === cityId) || CITIES[0];

export const getTranslatedMarkers = (state: DashboardState) => {
  const city = getCityConfig(state.currentCity);
  const offsetLat = city.lat - 28.6139;
  const offsetLng = city.lng - 77.2090;

  const translated: Record<DomainId, GeoMarker[]> = {} as any;
  Object.keys(state.markers).forEach((domainKey) => {
    const domainId = domainKey as DomainId;
    translated[domainId] = state.markers[domainId].map((m) => {
      let title = m.title;
      let description = m.description || '';
      Object.entries(city.places).forEach(([key, val]) => {
        const originalName = CITIES[0].places[key];
        title = title.replace(new RegExp(originalName, 'g'), val);
        description = description.replace(new RegExp(originalName, 'g'), val);
      });
      return {
        ...m,
        lat: m.lat + offsetLat,
        lng: m.lng + offsetLng,
        title,
        description,
      };
    });
  });
  return translated;
};

export const getTranslatedAlerts = (state: DashboardState) => {
  const city = getCityConfig(state.currentCity);
  return state.alerts.map((a) => {
    let title = a.title;
    let description = a.description;
    Object.entries(city.places).forEach(([key, val]) => {
      const originalName = CITIES[0].places[key];
      title = title.replace(new RegExp(originalName, 'g'), val);
      description = description.replace(new RegExp(originalName, 'g'), val);
    });
    return {
      ...a,
      title,
      description,
    };
  });
};
