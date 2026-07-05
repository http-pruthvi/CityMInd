'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Power, CheckCircle, AlertTriangle } from 'lucide-react';

interface DomainConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  color: string;
}

export default function AdminSettings() {
  const [domains, setDomains] = useState<DomainConfig[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchDomains = async () => {
    try {
      const res = await fetch('/api/data/domains');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDomains(data.data);
      }
    } catch (err) {
      console.error('Failed to load domains:', err);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const handleToggle = async (domainId: string, currentEnabled: boolean) => {
    setLoadingId(domainId);
    setMessage(null);
    try {
      const res = await fetch('/api/data/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId, enabled: !currentEnabled }),
      });
      const data = await res.json();
      if (data.success) {
        setDomains((prev) =>
          prev.map((d) => (d.id === domainId ? { ...d, enabled: !currentEnabled } : d))
        );
        setMessage({
          text: `Successfully ${!currentEnabled ? 'enabled' : 'disabled'} the ${domainId} module!`,
          type: 'success',
        });
      } else {
        throw new Error(data.error || 'Failed to update');
      }
    } catch (err: any) {
      setMessage({
        text: `Error updating module: ${err.message}`,
        type: 'error',
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Settings className="text-cyan-400 animate-spin-slow" size={24} />
          Pluggable Modules Administration
        </h1>
        <p className="text-xs text-gray-400">
          Enable or disable city domains in real-time. Disabled modules are immediately decoupled from dashboard telemetry, feeds, and maps.
        </p>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
        >
          {message.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
          {message.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {domains.map((domain) => (
          <div
            key={domain.id}
            className={`p-5 rounded-xl border transition-all duration-300 ${
              domain.enabled
                ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                : 'bg-black/40 border-white/[0.02] opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: domain.color }}
                  />
                  <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wide">
                    {domain.name}
                  </h3>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {domain.description}
                </p>
              </div>

              <button
                onClick={() => handleToggle(domain.id, domain.enabled)}
                disabled={loadingId === domain.id}
                className={`flex items-center justify-center p-2 rounded-lg transition ${
                  domain.enabled
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20'
                    : 'bg-white/[0.04] text-gray-500 border border-white/[0.08] hover:bg-white/[0.08]'
                }`}
                title={domain.enabled ? 'Disable Module' : 'Enable Module'}
              >
                <Power size={16} className={loadingId === domain.id ? 'animate-pulse' : ''} />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-gray-500 border-t border-white/[0.04] pt-2">
              <span>MODULE ID: {domain.id}</span>
              <span className={domain.enabled ? 'text-cyan-400 font-bold' : 'text-gray-600'}>
                {domain.enabled ? '● PLUGGED' : '○ UNPLUGGED'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
