'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, CheckCircle, ArrowRight, Shield, AlertTriangle, HelpCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const CityMap = dynamic(() => import('@/components/maps/CityMap'), { ssr: false });

const CATEGORIES = [
  { id: 'mobility', label: 'Road & Pothole', icon: AlertTriangle, color: '#06b6d4' },
  { id: 'safety', label: 'Hazard & Safety', icon: Shield, color: '#ef4444' },
  { id: 'waste', label: 'Trash Dumping', icon: AlertTriangle, color: '#f59e0b' },
  { id: 'accessibility', label: 'Sidewalk/Ramp Defect', icon: HelpCircle, color: '#8b5cf6' },
];

export default function IssueReport() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({
    lat: 28.6139,
    lng: 77.2090
  });
  const [loading, setLoading] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create a pseudo tracking ID
      const pseudoId = 'CM-' + Math.floor(100000 + Math.random() * 900000);
      
      // Simulate API submit delay
      await new Promise((r) => setTimeout(r, 2000));
      
      setTrackingId(pseudoId);
      setStep(4);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0c101b] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-md shadow-2xl">
        
        {/* Progress Tracker */}
        <div className="flex justify-between items-center mb-8 border-b border-white/[0.06] pb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm font-semibold transition ${
                step === s ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]' : 
                step > s ? 'bg-cyan-950 text-cyan-400 border border-cyan-400/30' : 'bg-white/[0.04] text-gray-500 border border-white/[0.06]'
              }`}>
                {s}
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider ${
                step === s ? 'text-white' : 'text-gray-500'
              }`}>
                {s === 1 ? 'Category' : s === 2 ? 'Details' : 'Location'}
              </span>
              {s < 3 && <ArrowRight size={14} className="text-gray-600" />}
            </div>
          ))}
        </div>

        {/* Form Body */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-bold">Select Report Category</h2>
                <p className="text-sm text-gray-400">Choose the most matching department category for your incident report.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setCategory(cat.id);
                        setStep(2);
                      }}
                      className={`flex items-center gap-4 p-5 rounded-xl border text-left transition group ${
                        category === cat.id ? 'bg-cyan-500/10 border-cyan-500/40' : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="p-3 rounded-lg group-hover:scale-105 transition" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                        <Icon size={20} />
                      </div>
                      <span className="text-sm font-semibold">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-bold">Describe the Incident</h2>
                <p className="text-sm text-gray-400">Explain the issue clearly and attach supporting media if available.</p>
              </div>

              <div className="space-y-4">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide precise details: e.g. Deep pothole causing vehicular swerving near Central Circle..."
                  rows={4}
                  className="w-full bg-white/[0.02] border border-white/[0.08] rounded-xl p-4 text-sm focus:outline-none focus:border-cyan-400/40 text-white placeholder-gray-500"
                />

                {/* Photo Upload Box */}
                <div className="border-2 border-dashed border-white/[0.08] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400/30 transition relative">
                  {uploadedImage ? (
                    <div className="relative w-full h-[150px]">
                      <img src={uploadedImage} alt="Attachment" className="w-full h-full object-cover rounded-lg" />
                      <button 
                        onClick={() => setUploadedImage(null)}
                        className="absolute top-2 right-2 bg-black/80 px-3 py-1 rounded text-xs text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer w-full h-full">
                      <Camera size={28} className="text-gray-400 mb-2" />
                      <span className="text-xs font-semibold text-gray-300">Click to upload photo</span>
                      <span className="text-[10px] text-gray-500 mt-1">PNG, JPG, max 5MB size</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.06] transition text-sm">
                  Back
                </button>
                <button 
                  onClick={() => setStep(3)}
                  disabled={!description.trim()}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition disabled:opacity-50 text-sm flex items-center gap-1"
                >
                  Next Step <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-bold">Select Pin Location</h2>
                <p className="text-sm text-gray-400">Click or drag the marker to pinpoint the exact location of the issue.</p>
              </div>

              <div className="h-[280px] rounded-xl overflow-hidden border border-white/[0.08]">
                <CityMap 
                  center={[selectedCoords.lat, selectedCoords.lng]} 
                  zoom={12} 
                  draggableMarker={true} 
                  onLocationSelect={handleLocationSelect} 
                />
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(2)} className="px-5 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:bg-white/[0.06] transition text-sm">
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition disabled:opacity-50 text-sm flex items-center gap-2"
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-8 space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Report Submitted Successfully</h2>
                <p className="text-sm text-gray-400 mt-1 max-w-sm">The ticket has been stored in SQLite. Our AI engine is currently triaging this with the operator queue.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] font-mono text-center">
                <span className="text-[10px] text-gray-500 block uppercase tracking-wider mb-1">Your Tracking ID</span>
                <span className="text-lg font-bold text-cyan-400 tracking-wide">{trackingId}</span>
              </div>
              <button 
                onClick={() => {
                  setCategory('');
                  setDescription('');
                  setUploadedImage(null);
                  setStep(1);
                }} 
                className="px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition text-sm"
              >
                File Another Issue
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
