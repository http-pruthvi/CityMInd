'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, AlertCircle, FileText, ChevronRight, HelpCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const DomainChart = dynamic(() => import('@/components/charts/DomainChart'), { ssr: false });

const PERFORMANCE_DATA = [
  { time: 'Jan', value: 82 },
  { time: 'Feb', value: 84 },
  { time: 'Mar', value: 85 },
  { time: 'Apr', value: 88 },
  { time: 'May', value: 87 },
  { time: 'Jun', value: 91 },
];

const CORRELATION_DATA = [
  { name: 'AQI Peak', value: 140, color: '#ef4444' },
  { name: 'Ambulance Call Out', value: 45, color: '#3b82f6' },
  { name: 'Traffic Congestion', value: 82, color: '#06b6d4' },
  { name: 'Smart Grid Load', value: 94, color: '#eab308' },
];

const PRE_BUILT_CARDS = [
  {
    title: 'Citywide Performance Index',
    metric: '91.2',
    change: '+4.2%',
    description: 'Aggregated metric computed across transit dispatch, grid loads, response delays, and air sensors.',
    chartData: PERFORMANCE_DATA,
    chartType: 'area' as const,
    color: '#06b6d4'
  },
  {
    title: 'Cross-Domain Correlations',
    metric: '0.86 Pearson',
    change: 'Strong',
    description: 'High correlation identified between traffic delays on Route 14 and localized industrial AQI spikes.',
    chartData: CORRELATION_DATA,
    chartType: 'bar' as const,
    color: '#a855f7'
  }
];

export default function LeadershipAnalytics() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [citations, setCitations] = useState<{ title: string; source: string }[]>([]);
  const [suggestedActions, setSuggestedActions] = useState<string[]>([]);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAnswer(null);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      if (data.success) {
        setAnswer(data.data.answer);
        setCitations(data.data.citations || []);
        setSuggestedActions(data.data.suggestedActions || []);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      setAnswer(`Error querying conversational analytics: ${e.message || 'Server error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl font-bold">Conversational Analytics</h1>
        <p className="text-xs text-gray-400">Run cross-domain queries over BigQuery and AlloyDB using natural language.</p>
      </div>

      {/* Query Bar */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 relative overflow-hidden">
        <div className="flex items-center gap-3 bg-[#080b12] border border-white/[0.08] rounded-xl px-4 py-3 focus-within:border-cyan-500/30 transition">
          <Search size={16} className="text-gray-500" />
          <input
            type="text"
            placeholder="e.g., Analyze the correlation between PM2.5 spikes and transit delays..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            className="bg-transparent border-0 outline-none text-sm placeholder-gray-500 text-white w-full"
          />
          <button 
            onClick={handleAsk}
            disabled={loading || !query.trim()}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition text-xs flex items-center gap-1 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : <><Sparkles size={12} /> Ask</>}
          </button>
        </div>
      </div>

      {/* Query Result */}
      {loading && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-8 text-center space-y-4">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-gray-400 font-mono">Querying BigQuery analytical schema & running model reasoning...</p>
        </div>
      )}

      {answer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Analysis Result</h3>
          </div>

          <div className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap font-sans">
            {answer}
          </div>

          {/* Actions & Citations */}
          {suggestedActions.length > 0 && (
            <div className="pt-4 border-t border-white/[0.04] space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Suggested policy actions</h4>
              <div className="flex flex-wrap gap-2">
                {suggestedActions.map((action, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400 font-semibold">
                    {action}
                  </span>
                ))}
              </div>
            </div>
          )}

          {citations.length > 0 && (
            <div className="pt-4 border-t border-white/[0.04]">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Document References</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {citations.map((c, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-[10px] text-gray-400 font-mono">
                    {c.title} - {c.source}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Pre-built analytics cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {PRE_BUILT_CARDS.map((card, idx) => (
          <div key={idx} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-200">{card.title}</h3>
                <div className="text-right">
                  <span className="text-lg font-bold font-mono tracking-tight text-white">{card.metric}</span>
                  <span className="text-[10px] text-emerald-400 font-bold ml-1">{card.change}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{card.description}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/[0.04] h-[160px]">
              <DomainChart type={card.chartType} data={card.chartData} color={card.color} height={130} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
