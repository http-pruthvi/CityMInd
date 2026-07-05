'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Activity, GitBranch, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import PageHeader from '@/components/ui/PageHeader';
import MapPanel from '@/components/ui/MapPanel';
import EmptyState from '@/components/ui/EmptyState';
import {
  useDashboardStore,
  getTranslatedMarkers,
  getTranslatedAlerts,
  getCityConfig,
} from '@/stores/dashboardStore';

const DomainChart = dynamic(() => import('@/components/charts/DomainChart'), { ssr: false });

export default function OperationsDashboard() {
  const store = useDashboardStore();
  const { fetchLiveData, dataLoaded } = store;
  const cityConfig = getCityConfig(store.currentCity);
  const translatedAlerts = getTranslatedAlerts(store);
  const translatedMarkers = getTranslatedMarkers(store);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  const activeAlerts = translatedAlerts.filter((a) => a.status === 'active');
  const mapMarkers = Object.values(translatedMarkers).flat();

  const incidentsByDomain = activeAlerts.reduce<Record<string, number>>((acc, alert) => {
    acc[alert.domain] = (acc[alert.domain] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(incidentsByDomain).map(([name, value]) => ({
    name,
    value,
    color: '#06b6d4',
  }));

  const stats = [
    {
      label: 'Active Alerts',
      value: String(activeAlerts.length),
      icon: ShieldAlert,
      color: '#ef4444',
    },
    {
      label: 'Map Markers',
      value: String(mapMarkers.length),
      icon: MapPin,
      color: '#06b6d4',
    },
    {
      label: 'Total Records',
      value: String(translatedAlerts.length),
      icon: Activity,
      color: '#10b981',
    },
    {
      label: 'Domains Affected',
      value: String(Object.keys(incidentsByDomain).length),
      icon: GitBranch,
      color: '#eab308',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Operations — ${cityConfig.name}`}
        description="Live view of alerts and geolocated incidents from your database. Select a city above to change the map center."
      />

      {!dataLoaded && (
        <div className="info-banner">Loading live data from database…</div>
      )}

      {dataLoaded && translatedAlerts.length === 0 && (
        <div className="info-banner">
          No alerts in the database yet. Citizen reports and seeded data will appear here after you run <code>npm run db:seed</code> or submit a report.
        </div>
      )}

      <div className="stat-grid">
        {stats.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="stat-tile"
            >
              <div className="flex items-center justify-between">
                <span className="stat-tile-label">{kpi.label}</span>
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${kpi.color}12`, color: kpi.color }}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="stat-tile-value">{kpi.value}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MapPanel
            title="Incident Map"
            subtitle={`Centered on ${cityConfig.name}`}
            markers={mapMarkers}
            center={[cityConfig.lat, cityConfig.lng]}
            height={400}
            emptyTitle="No geolocated incidents"
            emptyDescription="Alerts and reports with latitude/longitude will show on this map."
          />
        </div>

        <div className="panel" style={{ height: 400 }}>
          <div className="panel-header">
            <h2>Active Alerts</h2>
          </div>
          <div className="panel-body divide-y divide-white/[0.04] scrollbar-thin">
            {activeAlerts.length === 0 ? (
              <EmptyState
                title="No active alerts"
                description="When alerts are created in the system, they will appear in this feed."
              />
            ) : (
              activeAlerts.slice(0, 8).map((alert) => (
                <div key={alert.id} className="p-4 hover:bg-white/[0.02] transition space-y-2 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      alert.severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      alert.severity === 'high' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">{alert.domain}</span>
                  </div>
                  <h3 className="text-xs font-bold">{alert.title}</h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">{alert.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="panel p-5">
          <DomainChart
            type="bar"
            data={chartData}
            title="Active Alerts by Domain"
            color="#06b6d4"
            height={240}
          />
        </div>
      )}
    </div>
  );
}
