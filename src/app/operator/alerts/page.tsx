'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, BellRing, Clock } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import type { Alert, AlertSeverity, AlertStatus } from '@/types';

export default function AlertsManagement() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/data/alerts');
      const data = await res.json();
      if (data.success) setAlerts(data.data || []);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAction = (id: string, action: AlertStatus) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: action } : a))
    );
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesSeverity = selectedSeverity === 'All' || a.severity === selectedSeverity.toLowerCase();
    const matchesStatus = selectedStatus === 'All' || a.status === selectedStatus;
    return matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Alert Queue"
        description="Review and triage alerts stored in the database. Filter by severity or status."
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 panel p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-gray-500 font-mono uppercase mr-2">Severity</span>
          {['All', 'Critical', 'High', 'Medium', 'Low'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedSeverity(s)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition ${
                selectedSeverity === s
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-gray-500 font-mono uppercase mr-2">Status</span>
          {['All', 'active', 'acknowledged', 'resolved'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition ${
                selectedStatus === st
                  ? 'bg-cyan-500 text-black font-bold'
                  : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="info-banner">Loading alerts…</div>
      )}

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`panel p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                alert.status === 'resolved' ? 'opacity-60' :
                alert.severity === 'critical' ? 'border-red-500/20' : ''
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    alert.severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    alert.severity === 'high' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">
                    {alert.domain}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-gray-200">{alert.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">{alert.description}</p>

                {alert.createdAt && (
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono pt-1">
                    <Clock size={11} />
                    {new Date(alert.createdAt).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-start md:self-center">
                {alert.status === 'active' && (
                  <button
                    type="button"
                    onClick={() => handleAction(alert.id, 'acknowledged')}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition text-[10px] font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5"
                  >
                    <BellRing size={12} /> Acknowledge
                  </button>
                )}
                {alert.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => handleAction(alert.id, 'resolved')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <CheckCircle size={12} /> Resolve
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {!loading && filteredAlerts.length === 0 && (
            <EmptyState
              title="No alerts match your filters"
              description="Try changing severity or status filters, or add alerts via the database seed."
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
