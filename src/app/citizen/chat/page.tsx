'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Image, Mic, ShieldAlert, Sparkles, RefreshCw, ChevronRight, 
  MapPin, AlertCircle, HelpCircle, BarChart2 
} from 'lucide-react';
import dynamic from 'next/dynamic';

const CityMap = dynamic(() => import('@/components/maps/CityMap'), { ssr: false });
const DomainChart = dynamic(() => import('@/components/charts/DomainChart'), { ssr: false });

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  domain?: string;
  citations?: { title: string; source: string }[];
  sources?: string[];
  charts?: any[];
  mapData?: any[];
}

const SUGGESTED_PROMPTS = [
  { text: 'Is there a delay on Route 14?', icon: HelpCircle },
  { text: 'How is the air quality (AQI) today?', icon: BarChart2 },
  { text: 'Report a broken pavement on Main St', icon: MapPin },
  { text: 'Check safety alerts in Sector 3', icon: ShieldAlert },
];

export default function CitizenChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am **CityMind AI**, your conversational guide to the city. I can help you monitor traffic, check environment readings, inspect active public safety tickets, or file issue reports directly. What would you like to know today?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() && !uploadedImage) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Create request body
      const body: any = { query: text };
      if (uploadedImage) {
        body.image = uploadedImage;
        setUploadedImage(null);
      }

      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        const aiMessage: Message = {
          id: Math.random().toString(),
          role: 'assistant',
          content: data.data.answer,
          timestamp: new Date(),
          domain: data.data.domain,
          citations: data.data.citations,
          sources: data.data.sources,
          charts: data.data.charts,
          mapData: data.data.mapData,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'assistant',
          content: `Sorry, I encountered an error: ${err.message || 'Unknown network error'}. Please try again later.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0c101b] text-[#f1f5f9] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0c101b]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide">CityMind AI Assistant</h1>
            <p className="text-[10px] text-cyan-400 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              Core Ingestion Connected
            </p>
          </div>
        </div>
        <button 
          onClick={() => setMessages([messages[0]])}
          className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] transition text-gray-400 hover:text-white"
          title="Reset Conversation"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin">
        {messages.map((m, idx) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-2xl p-5 border shadow-lg ${
              m.role === 'user' 
                ? 'bg-cyan-500/10 border-cyan-500/20 text-[#f1f5f9]' 
                : 'bg-white/[0.02] border-white/[0.06] backdrop-blur-sm'
            }`}>
              {/* Domain Tag */}
              {m.domain && (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 mb-3">
                  {m.domain}
                </span>
              )}

              {/* Text Content */}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {m.content}
              </p>

              {/* Rich Visualizations (Charts / Maps) */}
              {(m.charts && m.charts.length > 0) && (
                <div className="mt-4 p-4 rounded-xl bg-[#080b12] border border-white/[0.06] h-[220px]">
                  {m.charts.map((c: any, i: number) => (
                    <DomainChart key={i} type={c.type} data={c.data} title={c.title} color={c.color} height={160} />
                  ))}
                </div>
              )}

              {(m.mapData && m.mapData.length > 0) && (
                <div className="mt-4 rounded-xl border border-white/[0.06] overflow-hidden h-[220px]">
                  <CityMap markers={m.mapData} zoom={11} interactive={true} />
                </div>
              )}

              {/* Grounded Sources & Telemetry Context */}
              {((m.citations && m.citations.length > 0) || (m.sources && m.sources.length > 0)) && (
                <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-3">
                  {m.citations && m.citations.length > 0 && (
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Grounded Policy Documents</p>
                      <div className="flex flex-wrap gap-1.5">
                        {m.citations.map((c, i) => (
                          <span key={i} className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-[10px] text-gray-300 flex items-center gap-1 font-mono">
                            📜 {c.title} ({c.source})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {m.sources && m.sources.length > 0 && (
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Telemetry & Context Sources</p>
                      <div className="flex flex-wrap gap-1.5">
                        {m.sources.map((s, i) => (
                          <span key={i} className="px-2 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-[10px] text-gray-300 flex items-center gap-1 font-mono">
                            ⚡ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Loading / Typing Indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </motion.div>
        )}

        {/* Suggestions when empty */}
        {messages.length === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto pt-8">
            {SUGGESTED_PROMPTS.map((p, i) => {
              const Icon = p.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSend(p.text)}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-400 group-hover:scale-105 transition">
                      <Icon size={16} />
                    </div>
                    <span className="text-xs font-medium text-gray-300 group-hover:text-white transition">{p.text}</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-500 group-hover:text-white transition group-hover:translate-x-0.5" />
                </button>
              );
            })}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Tray */}
      <div className="p-4 border-t border-white/[0.08] bg-[#0c101b]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          {/* Uploaded Image Preview */}
          {uploadedImage && (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-cyan-400/30 group">
              <img src={uploadedImage} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => setUploadedImage(null)}
                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs font-semibold text-red-400"
              >
                Remove
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 focus-within:border-cyan-400/40 transition">
            <label className="cursor-pointer p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.04] transition">
              <Image size={18} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.04] transition">
              <Mic size={18} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about air quality, dynamic scheduling, incident tickets..."
              className="flex-1 bg-transparent border-0 outline-none text-sm placeholder-gray-500 text-white"
            />
            <button 
              onClick={() => handleSend()}
              className="p-2 rounded-lg bg-cyan-500 text-black hover:bg-cyan-400 transition"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
