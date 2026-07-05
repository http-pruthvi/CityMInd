'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight, HelpCircle, PhoneCall, Globe } from 'lucide-react';
import { MOCK_SERVICES } from '@/lib/mock/data';

const CATEGORIES = ['All', 'Infrastructure', 'Health', 'Education', 'Safety', 'Utilities'];

export default function ServicesDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredServices = MOCK_SERVICES.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || service.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0c101b] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Title */}
        <div>
          <h1 className="text-xl font-bold">City Services Directory</h1>
          <p className="text-sm text-gray-400">Quickly find and access departments, emergency portals, or administrative forms.</p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2 flex-1 max-w-md">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search services, departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-0 outline-none text-sm placeholder-gray-500 text-white w-full"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                  activeCategory === cat 
                    ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]' 
                    : 'bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] hover:bg-white/[0.04] transition flex flex-col justify-between group h-full"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[9px] uppercase tracking-wider text-cyan-400 font-bold font-mono">
                    {service.category}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">{service.department}</span>
                </div>
                <h3 className="text-sm font-bold group-hover:text-cyan-400 transition">{service.name}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{service.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-gray-500">
                <div className="flex items-center gap-3">
                  {service.url && (
                    <a href={service.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-cyan-400 transition">
                      <Globe size={12} /> Portal
                    </a>
                  )}
                  {service.contactInfo && (
                    <span className="flex items-center gap-1">
                      <PhoneCall size={12} /> {service.contactInfo.phone || service.contactInfo.email}
                    </span>
                  )}
                </div>
                <ChevronRight size={14} className="text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
              </div>
            </motion.div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-16 border border-dashed border-white/[0.06] rounded-xl space-y-2">
            <HelpCircle size={32} className="text-gray-600 mx-auto" />
            <h3 className="text-sm font-semibold">No services found</h3>
            <p className="text-xs text-gray-500">Try adjusting your filters or search spelling.</p>
          </div>
        )}

      </div>
    </div>
  );
}
