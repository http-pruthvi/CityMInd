'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, CheckCircle, BellRing, Clock, UserCheck } from 'lucide-react';
import { MOCK_ALERTS } from '@/lib/mock/data';
import type { AlertSeverity, AlertStatus } from '@/types';

export default function AlertsManagement() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');

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
      <div>
        <h1 className="text-xl font-bold">Alert Operations Queue</h1>
        <p className="text-xs text-gray-400">Triaged alarms and anomaly logs detected by IoT grid and camera models.</p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.01] border border-white/[0.06] p-4 rounded-xl">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-gray-500 font-mono uppercase mr-2">Severity</span>
          {['All', 'Critical', 'High', 'Medium', 'Low'].map((s) => (
            <button
              key={s}
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

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 font-mono uppercase mr-2">Status</span>
          {['All', 'active', 'acknowledged', 'resolved'].map((st) => (
            <button
              key={st}
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

      {/* Alert Cards Container */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.map((alert, idx) => (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`bg-white/[0.02] border rounded-xl p-5 hover:bg-white/[0.04] transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                alert.status === 'resolved' ? 'opacity-60 border-white/[0.04]' : 
                alert.severity === 'critical' ? 'border-red-500/20 bg-red-950/5' : 'border-white/[0.08]'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
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
                  {alert.location && (
                    <span className="text-[10px] text-gray-500 font-medium">
                      {alert.locationName || alert.location.name || `${alert.location.lat}, ${alert.location.lng}`}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-gray-200">{alert.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">{alert.description}</p>

                <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono pt-2">
                  <span className="flex items-center gap-1"><Clock size={11} /> 10:24 AM</span>
                  {alert.assignee && (
                    <span className="flex items-center gap-1"><UserCheck size={11} /> {alert.assignee}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start md:self-center">
                {alert.status === 'active' && (
                  <button
                    onClick={() => handleAction(alert.id, 'acknowledged')}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] transition text-[10px] font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5"
                  >
                    <BellRing size={12} /> Acknowledge
                  </button>
                )}
                {alert.status !== 'resolved' && (
                  <button
                    onClick={() => handleAction(alert.id, 'resolved')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <CheckCircle size={12} /> Resolve
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {filteredAlerts.length === 0 && (
            <div className="text-center py-16 border border-dashed border-white/[0.06] rounded-xl text-xs text-gray-500">
              No alerts found for this filter criteria.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
