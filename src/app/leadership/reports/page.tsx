'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import { FileText, Download, FileSpreadsheet, RefreshCw, Calendar, Sparkles } from 'lucide-react';

const REPORT_TYPES = [
  { id: 'daily', label: 'Daily Briefing Summary', desc: 'Cross-domain incident highlights and immediate anomalies.' },
  { id: 'weekly', label: 'Weekly Performance Review', desc: 'Detailed transit delay index, grid utilization, and SLA tracking.' },
  { id: 'env', label: 'Environmental Telemetry Audit', desc: 'AQI index analysis, localized PM2.5 spikes, and industrial output logs.' },
];

export default function ReportsGenerator() {
  const [selectedType, setSelectedType] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportContent, setReportContent] = useState('');

  const getReportContent = async () => {
    try {
      const [alertsRes, workflowsRes] = await Promise.all([
        fetch('/api/data/alerts').then((r) => r.json()),
        fetch('/api/workflows').then((r) => r.json()),
      ]);
      const alerts = alertsRes.success ? alertsRes.data : [];
      const workflows = workflowsRes.success ? workflowsRes.data : [];
      const active = alerts.filter((a: { status: string }) => a.status === 'active');

      return `# CityMind Report — ${selectedType.toUpperCase()}
**Generated:** ${new Date().toLocaleString()}

## Summary
- **Total alerts in database:** ${alerts.length}
- **Active alerts:** ${active.length}
- **Workflows in system:** ${workflows.length}

## Active alerts
${active.length === 0 ? 'No active alerts recorded.' : active.map((a: { severity: string; title: string; domain: string }) => `- [${a.severity}] ${a.title} (${a.domain})`).join('\n')}

## Note
This report is generated from live database records only — no simulated telemetry is included.
`;
    } catch {
      return 'Failed to load data for report generation.';
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setReportGenerated(false);
    const content = await getReportContent();
    setReportContent(content);
    setLoading(false);
    setReportGenerated(true);
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Municipal Reports"
        description="Generate summary reports from database records. Without seeded data, reports will reflect an empty system."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Selection Column */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 space-y-6">
          <div className="space-y-2">
            <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">Report Template</span>
            <div className="flex flex-col gap-2">
              {REPORT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedType(type.id);
                    setReportGenerated(false);
                  }}
                  className={`p-4 rounded-lg border text-xs font-semibold text-left transition ${
                    selectedType === type.id
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                      : 'bg-white/[0.01] border-white/[0.06] hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="font-bold">{type.label}</div>
                  <div className="text-[10px] text-gray-500 font-medium mt-1 leading-normal">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition text-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Compiling Report...' : <><Sparkles size={14} /> Compile Report</>}
          </button>
        </div>

        {/* Display Column */}
        <div className="lg:col-span-2 space-y-4">
          {loading && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-16 text-center space-y-4 h-[400px] flex flex-col justify-center items-center">
              <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-gray-400 font-mono">Running RAG queries across historical datasets and drafting executive summary...</p>
            </div>
          )}

          {!loading && !reportGenerated && (
            <div className="bg-white/[0.02] border border-dashed border-white/[0.08] rounded-xl p-16 text-center space-y-2 h-[400px] flex flex-col justify-center items-center">
              <FileText size={32} className="text-gray-600" />
              <h3 className="text-sm font-semibold">Report Compiler Idle</h3>
              <p className="text-xs text-gray-500">Select a briefing template on the left panel to execute report assembly.</p>
            </div>
          )}

          {reportGenerated && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/[0.06] rounded-xl">
                <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1.5"><Calendar size={12} /> Generated from database</span>
                <div className="flex items-center gap-2">
                  <button type="button" className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition text-[10px] font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <Download size={12} /> PDF
                  </button>
                  <button type="button" className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition text-[10px] font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <FileSpreadsheet size={12} /> Excel
                  </button>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-8 font-sans text-left space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin">
                <div className="text-xs leading-relaxed text-gray-300 whitespace-pre-wrap">
                  {reportContent.trim()}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
