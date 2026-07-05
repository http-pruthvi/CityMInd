'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { DOMAIN_CONFIGS } from '@/lib/mock/data';
import PageHeader from '@/components/ui/PageHeader';
import MapPanel from '@/components/ui/MapPanel';
import EmptyState from '@/components/ui/EmptyState';
import { useDashboardStore, getCityConfig } from '@/stores/dashboardStore';
import type { DomainId, MetricValue, TimeSeriesData, GeoMarker, Alert } from '@/types';

const DomainChart = dynamic(() => import('@/components/charts/DomainChart'), { ssr: false });

interface DomainPageProps {
  params: Promise<{ domain: string }>;
}

export default function DomainDetailPage({ params }: DomainPageProps) {
  const { domain } = React.use(params);
  const domainId = domain as DomainId;
  const currentCity = useDashboardStore((s) => s.currentCity);
  const cityConfig = getCityConfig(currentCity);

  const domainConfig = DOMAIN_CONFIGS.find((d) => d.id === domainId);
  if (!domainConfig) {
    notFound();
    return null;
  }

  const [metrics, setMetrics] = useState<MetricValue[]>([]);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
  const [mapMarkers, setMapMarkers] = useState<GeoMarker[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchData() {
      try {
        setLoading(true);
        const [resMetrics, resTimeSeries, resGeo, resAlerts] = await Promise.all([
          fetch(`/api/data/${domainId}/metrics`).then((r) => r.json()),
          fetch(`/api/data/${domainId}/timeseries`).then((r) => r.json()),
          fetch(`/api/data/${domainId}/geo`).then((r) => r.json()),
          fetch(`/api/data/${domainId}/alerts`).then((r) => r.json()),
        ]);

        if (active) {
          if (resMetrics.success) setMetrics(resMetrics.data || []);
          if (resTimeSeries.success) setTimeSeries(resTimeSeries.data || []);
          if (resGeo.success) setMapMarkers(resGeo.data || []);
          if (resAlerts.success) setAlerts((resAlerts.data || []).filter((a: Alert) => a.status !== 'resolved'));
        }
      } catch (err) {
        console.error('Failed to fetch domain data', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchData();
    return () => { active = false; };
  }, [domainId]);

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title={domainConfig.name}
        description={`${domainConfig.description} — viewing data for ${cityConfig.name}.`}
      />

      {loading ? (
        <div className="info-banner">Loading domain data…</div>
      ) : metrics.length === 0 && alerts.length === 0 && mapMarkers.length === 0 ? (
        <div className="info-banner">
          No data for this domain yet. Metrics and alerts appear after database seeding or live ingestion.
        </div>
      ) : null}

      {!loading && metrics.length > 0 && (
        <div className="stat-grid">
          {metrics.map((metric) => (
            <div key={metric.metricId || metric.id} className="stat-tile">
              <span className="stat-tile-label">{(metric.metricId || metric.id || '').replace(/([A-Z])/g, ' $1')}</span>
              <div className="stat-tile-value">
                {metric.value}
                {metric.unit && <span className="text-sm text-gray-400 ml-1">{metric.unit}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MapPanel
            title={`${domainConfig.name} Map`}
            markers={mapMarkers}
            center={[cityConfig.lat, cityConfig.lng]}
            height={360}
            emptyTitle="No map points for this domain"
            emptyDescription="Geolocated alerts and citizen reports will appear here."
          />
        </div>

        <div className="panel" style={{ height: 360 }}>
          <div className="panel-header">
            <h2>Active Tickets</h2>
          </div>
          <div className="panel-body divide-y divide-white/[0.04] scrollbar-thin">
            {alerts.length === 0 ? (
              <EmptyState
                title="No active tickets"
                description="Department alerts will show here when available."
              />
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="p-4 hover:bg-white/[0.02] transition space-y-1.5 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      alert.severity === 'critical' ? 'bg-red-500/10 text-red-400' :
                      alert.severity === 'high' ? 'bg-orange-500/10 text-orange-400' :
                      'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">{alert.status}</span>
                  </div>
                  <h3 className="text-xs font-bold">{alert.title}</h3>
                  <p className="text-[11px] text-gray-400 line-clamp-2">{alert.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {!loading && timeSeries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {timeSeries.map((ts, idx) => (
            <div key={idx} className="panel p-5">
              <DomainChart
                type={idx % 2 === 0 ? 'line' : 'area'}
                data={ts.points as any || ts.data || []}
                title={ts.name || ts.label || ''}
                color={domainConfig.color}
                height={220}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
