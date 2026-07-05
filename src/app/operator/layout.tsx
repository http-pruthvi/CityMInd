'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import { Search, Bell, Moon, User } from 'lucide-react';

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0c101b] text-white">
      {/* Sidebar */}
      <Sidebar variant="operator" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-white/[0.08] bg-[#0c101b]/90 backdrop-blur-md px-6 flex items-center justify-between z-10">
          
          {/* Global Search */}
          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2 w-72 focus-within:border-cyan-500/30 transition">
            <Search size={14} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search incidents, assets, logs..."
              className="bg-transparent border-0 outline-none text-xs placeholder-gray-500 text-white w-full"
            />
          </div>

          {/* Controls & User Profile */}
          <div className="flex items-center gap-4">
            {/* Quick Stats Ticker */}
            <div className="hidden lg:flex items-center gap-4 text-[10px] font-mono text-gray-500 uppercase border-r border-white/[0.08] pr-4">
              <span>Database: <strong className="text-emerald-400">Online</strong></span>
              <span>Sync latency: <strong className="text-cyan-400">12ms</strong></span>
            </div>

            <button className="relative p-2 rounded-lg bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition text-gray-400 hover:text-white">
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500"></span>
            </button>

            <button className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition text-gray-400 hover:text-white">
              <Moon size={15} />
            </button>

            <div className="flex items-center gap-2 border-l border-white/[0.08] pl-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-indigo-600 flex items-center justify-center text-xs font-semibold text-white">
                AK
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold">Arun Kumar</div>
                <div className="text-[9px] text-cyan-400 font-mono uppercase tracking-wider">Operator Level 2</div>
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
