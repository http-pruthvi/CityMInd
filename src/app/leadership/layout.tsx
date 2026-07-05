'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import CitySelector from '@/components/ui/CitySelector';
import { Bell } from 'lucide-react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useEffect } from 'react';

export default function LeadershipLayout({ children }: { children: React.ReactNode }) {
  const fetchLiveData = useDashboardStore((s) => s.fetchLiveData);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0c101b] text-white">
      <Sidebar variant="leadership" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="app-header h-auto min-h-16 border-b border-white/[0.08] bg-[#0c101b]/95 backdrop-blur-md px-4 sm:px-6 py-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold tracking-wide hidden sm:block">Leadership Console</h1>
            <CitySelector />
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.04] transition text-gray-400 hover:text-white"
              aria-label="Notifications"
            >
              <Bell size={15} />
            </button>

            <div className="flex items-center gap-2 border-l border-white/[0.08] pl-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-pink-600 flex items-center justify-center text-xs font-semibold text-white">
                LD
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold">Leadership</div>
                <div className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider">Analytics</div>
              </div>
            </div>
          </div>
        </header>

        <main className="app-main flex-1 overflow-y-auto bg-[#080b12] p-4 sm:p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
