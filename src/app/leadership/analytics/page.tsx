'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';

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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Server error';
      setAnswer(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Conversational Analytics"
        description="Ask questions in plain language. Answers are grounded in policy documents and live database records when available."
      />

      <div className="panel p-6">
        <div className="flex items-center gap-3 bg-[#080b12] border border-white/[0.08] rounded-xl px-4 py-3 focus-within:border-cyan-500/30 transition">
          <Search size={16} className="text-gray-500" />
          <input
            type="text"
            placeholder="e.g., How many active alerts are there in mobility?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            className="bg-transparent border-0 outline-none text-sm placeholder-gray-500 text-white w-full"
          />
          <button
            type="button"
            onClick={handleAsk}
            disabled={loading || !query.trim()}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition text-xs flex items-center gap-1 disabled:opacity-50"
          >
            {loading ? 'Analyzing…' : <><Sparkles size={12} /> Ask</>}
          </button>
        </div>
      </div>

      {loading && (
        <div className="panel p-8 text-center space-y-4">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-400">Querying AI with available context…</p>
        </div>
      )}

      {answer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Result</h3>
          </div>

          <div className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
            {answer}
          </div>

          {suggestedActions.length > 0 && (
            <div className="pt-4 border-t border-white/[0.04] space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Suggested actions</h4>
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
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">References</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {citations.map((c, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-[10px] text-gray-400 font-mono">
                    {c.title} — {c.source}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
