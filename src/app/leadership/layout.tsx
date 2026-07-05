'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import { Search, Bell, Moon } from 'lucide-react';

export default function LeadershipLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0c101b] text-white">
      {/* Sidebar */}
      <Sidebar variant="leadership" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/[0.08] bg-[#0c101b]/90 backdrop-blur-md px-6 flex items-center justify-between z-10">
          
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold tracking-wide">CityMind Leadership Console</h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] uppercase tracking-wider text-amber-400 font-bold font-mono">
              Policy Sandbox Active
            </span>
          </div>

          {/* Controls & User Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4 text-[10px] font-mono text-gray-500 uppercase border-r border-white/[0.08] pr-4">
              <span>Model: <strong className="text-cyan-400">Gemini 2.5 Pro</strong></span>
              <span>Explainability: <strong className="text-emerald-400">SHAP Attributions</strong></span>
            </div>

            <button className="relative p-2 rounded-lg bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition text-gray-400 hover:text-white">
              <Bell size={15} />
            </button>

            <button className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition text-gray-400 hover:text-white">
              <Moon size={15} />
            </button>

            <div className="flex items-center gap-2 border-l border-white/[0.08] pl-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-pink-600 flex items-center justify-center text-xs font-semibold text-white">
                VP
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold">Vijay Prasad</div>
                <div className="text-[9px] text-indigo-400 font-mono uppercase tracking-wider">Commissioner</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto bg-[#080b12] p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
