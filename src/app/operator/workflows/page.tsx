'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, CheckSquare, XSquare, Play, RefreshCw, AlertTriangle, 
  Hourglass, CheckCircle2 
} from 'lucide-react';

interface Workflow {
  id: string;
  title: string;
  description: string;
  domain: string;
  status: 'pending' | 'approved' | 'executing' | 'completed' | 'failed' | 'rejected';
  triggeredBy: string;
  actions?: { label: string; status: string }[];
  steps?: { label: string; status: string }[];
}

export default function WorkflowsManagement() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchWorkflows = async () => {
    try {
      const res = await fetch('/api/workflows');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        // Map database response to match local UI structure
        const mapped = data.data.map((w: any) => ({
          ...w,
          triggeredBy: w.triggeredBy?.name || 'System Operator',
        }));
        setWorkflows(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    }
  };

  useEffect(() => {
    fetchWorkflows();
    // Poll every 3 seconds to catch status transitions from the background pipeline
    const interval = setInterval(fetchWorkflows, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/workflows/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', userId: 'operator-1' }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchWorkflows();
      }
    } catch (err) {
      console.error('Workflow approval failed:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/workflows/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', userId: 'operator-1', reason: 'Manually rejected by operator' }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchWorkflows();
      }
    } catch (err) {
      console.error('Workflow rejection failed:', err);
    }
  };

  const displayWorkflows = workflows;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Hourglass size={14} className="text-yellow-400" />;
      case 'executing':
      case 'running':
        return <Play size={14} className="text-cyan-400 animate-pulse" />;
      case 'completed':
        return <CheckCircle2 size={14} className="text-emerald-400" />;
      case 'failed':
        return <AlertTriangle size={14} className="text-rose-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl font-bold">Automation Workflows</h1>
        <p className="text-xs text-gray-400">Manage human-in-the-loop approvals and check execution states of active pipeline scripts.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {displayWorkflows.map((flow) => (
            <motion.div
              key={flow.id}
              layout
              className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-6"
            >
              {/* Info Column */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    flow.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    flow.status === 'executing' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse' :
                    flow.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    'bg-white/[0.04] text-gray-400 border border-white/[0.08]'
                  }`}>
                    {flow.status}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">
                    {flow.domain}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">Trigger: {flow.triggeredBy}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-200">{flow.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">{flow.description}</p>
              </div>

              {/* Execution Pipeline Steps */}
              <div className="flex flex-col gap-2 min-w-[200px] border-l border-white/[0.06] pl-6 lg:border-l lg:pl-6 border-t pt-4 lg:pt-0 lg:border-t-0">
                <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider mb-1">Execution steps</span>
                {(flow.actions || flow.steps || []).map((act: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                    {getStatusIcon(act.status || 'pending')}
                    <span className={act.status === 'completed' ? 'text-gray-500 line-through' : ''}>
                      {act.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions Column */}
              {flow.status === 'pending' && (
                <div className="flex flex-row lg:flex-col gap-2 self-start lg:self-center">
                  <button
                    onClick={() => handleApprove(flow.id)}
                    disabled={loadingId === flow.id}
                    className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition text-[10px] uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {loadingId === flow.id ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(flow.id)}
                    className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] transition text-[10px] font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5"
                  >
                    <XSquare size={12} /> Reject
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
