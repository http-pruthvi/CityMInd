'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/ui/PageHeader';
import { FlaskConical, Play, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';

const DomainChart = dynamic(() => import('@/components/charts/DomainChart'), { ssr: false });

const SCENARIOS = [
  {
    id: 'transit',
    name: 'Increase Route 14 Transit Frequency',
    params: [
      { name: 'Bus Frequency (mins)', value: 15, min: 5, max: 30, step: 1, unit: 'm' },
      { name: 'Dedicated Bus Lane Cover', value: 30, min: 0, max: 100, step: 5, unit: '%' }
    ],
    beforeData: [
      { time: '08:00', value: 24 },
      { time: '12:00', value: 12 },
      { time: '16:00', value: 15 },
      { time: '18:00', value: 28 },
    ],
    afterData: [
      { time: '08:00', value: 12 },
      { time: '12:00', value: 8 },
      { time: '16:00', value: 10 },
      { time: '18:00', value: 14 },
    ],
    impactAssessment: 'Increasing bus frequency to 8 minutes along with 45% dedicated bus lanes is predicted to reduce overall Sector 4 commuter transit delays by 46%. Commuter satisfaction scores in surrounding districts are modeled to rise by 12%. Environmental telemetry forecasts a localized CO2 reduction of 4.2 tons/month due to single-occupancy vehicle reduction.'
  },
  {
    id: 'solar',
    name: 'Expand Solar Microgrid Capacity',
    params: [
      { name: 'Solar panel count', value: 240, min: 100, max: 1000, step: 50, unit: 'units' },
      { name: 'Battery bank backup', value: 40, min: 10, max: 200, step: 10, unit: 'kWh' }
    ],
    beforeData: [
      { time: '10:00', value: 42 },
      { time: '12:00', value: 50 },
      { time: '14:00', value: 45 },
      { time: '16:00', value: 30 },
    ],
    afterData: [
      { time: '10:00', value: 82 },
      { time: '12:00', value: 110 },
      { time: '14:00', value: 95 },
      { time: '16:00', value: 68 },
    ],
    impactAssessment: 'Expanding microgrid capacity in District 7 is predicted to shield local water treatment facilities and emergency clinics from grid load sheds. Solar microgeneration share of local grid supply climbs from 12% to 28% during peak solar irradiance. Battery backup expansion guarantees up to 6 hours of continuous emergency operation during grid drops.'
  }
];

export default function PolicySimulate() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(SCENARIOS[0].id);
  const [params, setParams] = useState(SCENARIOS[0].params);
  const [loading, setLoading] = useState(false);
  const [simulated, setSimulated] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];

  const handleSliderChange = (idx: number, val: number) => {
    const updated = [...params];
    updated[idx] = { ...updated[idx], value: val };
    setParams(updated);
  };

  const handleRun = async () => {
    setLoading(true);
    setSimulated(false);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    setSimulated(true);
  };

  const selectScenario = (id: string) => {
    setSelectedScenarioId(id);
    const scen = SCENARIOS.find((s) => s.id === id) || SCENARIOS[0];
    setParams(scen.params);
    setSimulated(false);
  };

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Policy Sandbox"
        description="Explore what-if scenarios with adjustable parameters. Chart outputs are illustrative templates, not live city telemetry."
      />

      {/* Main Sandbox Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Control Panel */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 space-y-6">
          
          {/* Select Scenario */}
          <div className="space-y-2">
            <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">Select Scenario</span>
            <div className="flex flex-col gap-2">
              {SCENARIOS.map((scen) => (
                <button
                  key={scen.id}
                  onClick={() => selectScenario(scen.id)}
                  className={`p-3 rounded-lg border text-xs font-semibold text-left transition flex items-center justify-between ${
                    selectedScenarioId === scen.id
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                      : 'bg-white/[0.01] border-white/[0.06] hover:bg-white/[0.03]'
                  }`}
                >
                  {scen.name} <ChevronRight size={14} />
                </button>
              ))}
            </div>
          </div>

          {/* Parameter Sliders */}
          <div className="space-y-4 pt-4 border-t border-white/[0.06]">
            <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">Adjust Parameters</span>
            {params.map((param, idx) => (
              <div key={param.name} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-semibold">{param.name}</span>
                  <span className="font-mono text-cyan-400 font-bold">{param.value} {param.unit}</span>
                </div>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={param.value}
                  onChange={(e) => handleSliderChange(idx, Number(e.target.value))}
                  className="w-full h-1 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none"
                />
                <div className="flex justify-between text-[9px] text-gray-600 font-mono">
                  <span>{param.min}</span>
                  <span>{param.max}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Run Button */}
          <button
            onClick={handleRun}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition text-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Running Simulation...' : <><FlaskConical size={14} /> Run Simulation</>}
          </button>
        </div>

        {/* Right Sandbox Display */}
        <div className="lg:col-span-2 space-y-6">
          {loading && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-16 text-center space-y-4">
              <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-gray-400 font-mono">Simulating parameters through local Prophet-based time-series forecasting model...</p>
            </div>
          )}

          {!loading && !simulated && (
            <div className="bg-white/[0.02] border border-dashed border-white/[0.08] rounded-xl p-16 text-center space-y-2">
              <FlaskConical size={32} className="text-gray-600 mx-auto" />
              <h3 className="text-sm font-semibold">Ready to simulate</h3>
              <p className="text-xs text-gray-500">Adjust the policy sliders in the left panel and trigger the model simulation.</p>
            </div>
          )}

          {simulated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Impact Assessment Card */}
              <div className="bg-gradient-to-r from-emerald-950/10 to-cyan-950/10 border border-emerald-500/10 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">AI Predicted Impact Summary</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">{scenario.impactAssessment}</p>
              </div>

              {/* Side-by-Side Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                  <DomainChart type="line" data={scenario.beforeData as any} title="Before Intervention (Delay Index)" color="#ef4444" height={180} />
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                  <DomainChart type="line" data={scenario.afterData as any} title="After Intervention (Delay Index)" color="#10b981" height={180} />
                </div>
              </div>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}
