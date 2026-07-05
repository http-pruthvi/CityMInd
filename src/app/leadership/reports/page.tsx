'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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

  const handleGenerate = async () => {
    setLoading(true);
    setReportGenerated(false);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    setReportGenerated(true);
  };

  const getReportContent = () => {
    switch (selectedType) {
      case 'daily':
        return `
# CITYMIND DAILY OPERATIONS BRIEFING
**Date: July 5, 2026** | **Triage Engine Version: v2.4.0**

## 1. Executive Summary
Overall city performance index stands at **91.2/100** (Optimal). Active emergency incident count is **23**, with response SLA compliance currently holding at **94.8%** across all sectors.

## 2. Mobility & Public Transit
- **Route 14 Delays**: Average delays of 12 minutes detected near Sector 4 flyover. Commuter count increased by 8.4% today. Proposal active to adjust signal timings.
- **Smart Parking**: Central District smart parking slots reached peak occupancy of 92% at 11:30 AM. Dynamic rate adjusted from ₹20 to ₹40.

## 3. Environmental Telemetry
- **Industrial AQI**: Localized air quality index spike of **182** registered at Sensor #21 (PM2.5). Wind forecast predicts southeastern dispersal. No advisory triggered.

## 4. Workflows & Approvals Queue
- **Active workflows**: 18
- **Pending Human-in-the-loop actions**: 3 (Signal Calibration, Solar grid shedding, EV Bay dynamic allocation)
        `;
      case 'weekly':
        return `
# CITYMIND WEEKLY PERFORMANCE REPORT
**Period: June 28 - July 5, 2026** | **Scope: Full City Grid**

## 1. Sector Performance Analysis
All 12 departments are reporting stable telemetry. Citizen 311 ticket resolution SLA averages **4.2 minutes** for high-priority hazards.

## 2. Dynamic Energy Utilization
Smart grids register a peak loading of 1,240 MW on July 3, 2026. Solar microgeneration accounted for 24% of the supply capacity during daylight hours.

## 3. Waste Management Routings
Dynamic collection routing for IoT waste bins has reduced overall garbage truck fuel expenditure by **15.2%** over the past 7 days.
        `;
      default:
        return 'Select a report type and click generate.';
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-xl font-bold">Municipal Report Center</h1>
        <p className="text-xs text-gray-400">Generate, review, and export AI-compiled periodic reports for civic administration.</p>
      </div>

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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Toolbar */}
              <div className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/[0.06] rounded-xl">
                <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1.5"><Calendar size={12} /> Live PDF assembly ready</span>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition text-[10px] font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <Download size={12} /> PDF
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition text-[10px] font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <FileSpreadsheet size={12} /> Excel
                  </button>
                </div>
              </div>

              {/* Rendered Document */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-8 font-sans text-left space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin">
                <div className="prose prose-invert max-w-none text-xs leading-relaxed text-gray-300 whitespace-pre-wrap">
                  {getReportContent().trim()}
                </div>
              </div>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}
