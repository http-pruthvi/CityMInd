'use client';

import { motion } from 'framer-motion';
import { ShieldAlert, Activity, Users, HeartPulse, CheckSquare, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import { 
  MOCK_ALERTS, 
  MOCK_GEO_MARKERS, 
  CITY_STATS 
} from '@/lib/mock/data';

const CityMap = dynamic(() => import('@/components/maps/CityMap'), { ssr: false });
const DomainChart = dynamic(() => import('@/components/charts/DomainChart'), { ssr: false });

const KPI_DATA = [
  { label: 'Active Alerts', value: '47', change: '+12%', trend: 'up', color: '#ef4444', icon: ShieldAlert },
  { label: 'Avg Response Time', value: '4.2m', change: '-8%', trend: 'down', color: '#06b6d4', icon: Activity },
  { label: 'Systems Telemetry', value: '99.8%', change: '+0.1%', trend: 'up', color: '#10b981', icon: CheckSquare },
  { label: 'Active Workflows', value: '18', change: '+3', trend: 'up', color: '#eab308', icon: Sparkles },
];

const INCIDENTS_BY_DOMAIN_DATA = [
  { name: 'Mobility', value: 18, color: '#06b6d4' },
  { name: 'Safety', value: 12, color: '#ef4444' },
  { name: 'Health', value: 5, color: '#22c55e' },
  { name: 'Environment', value: 14, color: '#10b981' },
  { name: 'Waste', value: 22, color: '#f59e0b' },
  { name: 'Energy', value: 6, color: '#eab308' },
];

const RESPONSE_TIME_DATA = [
  { time: '08:00', value: 5.2 },
  { time: '10:00', value: 4.8 },
  { time: '12:00', value: 4.5 },
  { time: '14:00', value: 4.2 },
  { time: '16:00', value: 4.0 },
  { time: '18:00', value: 4.4 },
  { time: '20:00', value: 4.2 },
];

export default function OperationsDashboard() {
  // Take first 10 alerts
  const activeAlerts = MOCK_ALERTS.slice(0, 8);
  
  // Combine some markers from mobility, safety, environment
  const mapMarkers = [
    ...(MOCK_GEO_MARKERS['mobility'] || []).slice(0, 5),
    ...(MOCK_GEO_MARKERS['safety'] || []).slice(0, 5),
    ...(MOCK_GEO_MARKERS['environment'] || []).slice(0, 5),
  ];

  return (
    <div className="space-y-6">
      
      {/* Welcome Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Smart City Operations Hub</h1>
          <p className="text-xs text-gray-400">Real-time status overview across all 12 municipal sectors.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-white/[0.02] border border-white/[0.08] px-3 py-1.5 rounded-lg text-gray-400">
          <span>Active Nodes: {CITY_STATS.activeSensors}</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {KPI_DATA.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{kpi.label}</span>
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${kpi.color}12`, color: kpi.color }}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-bold font-mono tracking-tight">{kpi.value}</span>
                <span className={`text-[10px] font-bold font-mono ${
                  kpi.trend === 'up' && kpi.color !== '#ef4444' ? 'text-emerald-400' : 'text-rose-500'
                }`}>
                  {kpi.change}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Map & Live Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Map */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden h-[400px] flex flex-col">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Live Incident Telemetry Map</h2>
            <span className="flex items-center gap-1.5 text-[9px] font-mono text-cyan-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span> Live GPS tracking
            </span>
          </div>
          <div className="flex-1 min-h-0 relative">
            <CityMap markers={mapMarkers} height="100%" />
          </div>
        </div>

        {/* Live Alert Log */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl flex flex-col h-[400px] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] bg-white/[0.01]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Active Alert Stream</h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] scrollbar-thin">
            {activeAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                className="p-4 hover:bg-white/[0.02] transition space-y-2 text-left"
                animate={alert.severity === 'critical' ? {
                  boxShadow: [
                    "0 0 0 rgba(239, 68, 68, 0)",
                    "0 0 10px rgba(239, 68, 68, 0.25)",
                    "0 0 0 rgba(239, 68, 68, 0)"
                  ],
                  borderColor: [
                    "rgba(259, 68, 68, 0.08)",
                    "rgba(239, 68, 68, 0.4)",
                    "rgba(259, 68, 68, 0.08)"
                  ],
                  backgroundColor: [
                    "rgba(239, 68, 68, 0)",
                    "rgba(239, 68, 68, 0.02)",
                    "rgba(239, 68, 68, 0)"
                  ]
                } : {}}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    alert.severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    alert.severity === 'high' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">1m ago</span>
                </div>
                <h3 className="text-xs font-bold">{alert.title}</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed">{alert.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono uppercase text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-500/5 border border-cyan-500/10">
                    {alert.domain}
                  </span>
                  {alert.location && (
                    <span className="text-[9px] text-gray-500 font-medium">
                      {alert.locationName || (alert.location as any).name || `${(alert.location as any).lat}, ${(alert.location as any).lng}`}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Incidents by Domain */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <DomainChart 
            type="bar" 
            data={INCIDENTS_BY_DOMAIN_DATA} 
            title="Incidents Breakdown By Domain" 
            color="#06b6d4" 
            height={240} 
          />
        </div>

        {/* Avg Response Time */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <DomainChart 
            type="area" 
            data={RESPONSE_TIME_DATA} 
            title="Hourly Dispatch Response Time (m)" 
            color="#10b981" 
            height={240} 
          />
        </div>
      </div>

    </div>
  );
}
