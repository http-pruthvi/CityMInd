'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import {
  Search,
  Mic,
  Send,
  Bus,
  Shield,
  Heart,
  GraduationCap,
  Leaf,
  Trash2,
  Zap,
  MessageSquare,
  Accessibility,
  AlertTriangle,
  Map,
  Users,
  Brain,
  Activity,
  Radio,
  MapPin,
  Clock,
  UserCircle,
  Settings,
  TrendingUp,
  ArrowRight,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { DOMAIN_CONFIGS } from '@/lib/mock/data';
import type { DomainId } from '@/types';

const DOMAIN_ICONS: Record<DomainId, LucideIcon> = {
  mobility: Bus, safety: Shield, health: Heart, education: GraduationCap,
  environment: Leaf, waste: Trash2, energy: Zap, engagement: MessageSquare,
  accessibility: Accessibility, disaster: AlertTriangle, tourism: Map, community: Users,
};

// Animated counter hook
function useCounter(target: number, duration: number = 2000, decimals: number = 0) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const startTime = performance.now();
    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = eased * target;
      setCount(Number(start.toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration, decimals]);

  return { count, ref };
}

const STATS = [
  { label: 'Population', value: 32.9, suffix: 'M', decimals: 1, icon: Users },
  { label: 'Active Sensors', value: 12847, suffix: '', decimals: 0, icon: Radio },
  { label: 'Districts', value: 11, suffix: '', decimals: 0, icon: MapPin },
  { label: 'Avg Response', value: 4.2, suffix: 'min', decimals: 1, icon: Clock },
];

const ROLES = [
  {
    title: 'Citizen',
    description: 'Chat with AI, report issues, access city services',
    href: '/citizen/chat',
    icon: UserCircle,
    gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
  },
  {
    title: 'Operator',
    description: 'Monitor city systems, manage alerts, automate workflows',
    href: '/operator',
    icon: Settings,
    gradient: 'linear-gradient(135deg, #f97316, #ef4444)',
  },
  {
    title: 'Leadership',
    description: 'Strategic analytics, scenario simulation, AI-powered reports',
    href: '/leadership/analytics',
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any } },
};

export default function LandingPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/citizen/chat?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/citizen/chat');
    }
  };
  const domainRef = useRef<HTMLDivElement>(null);
  const domainsInView = useInView(domainRef, { once: true, margin: '-100px' });

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Grid Background */}
      <div className="grid-bg" />

      {/* ═══ Navigation ═══ */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: '0 2rem',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'hsla(220, 20%, 6%, 0.8)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px var(--primary-glow)',
          }}>
            <Brain size={18} color="#fff" />
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em' }} className="glow-text">
            CityMind
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/citizen/chat" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>Citizen Portal</Link>
          <Link href="/operator" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>Operator</Link>
          <Link href="/leadership/analytics" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>Leadership</Link>
        </div>
      </motion.nav>

      {/* ═══ Hero Section ═══ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6rem 2rem 4rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', maxWidth: 800 }}
        >
          {/* Tag */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: '99px',
              background: 'var(--primary-bg)',
              border: '1px solid hsla(185, 96%, 42%, 0.2)',
              fontSize: '0.8rem',
              color: 'var(--primary)',
              marginBottom: '2rem',
              fontWeight: 500,
            }}
          >
            <Sparkles size={14} />
            AI-Powered Decision Intelligence
            <Activity size={14} />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="glow-text"
            style={{
              fontSize: 'clamp(3rem, 8vw, 5.5rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '-0.04em',
              marginBottom: '1.5rem',
            }}
          >
            CityMind
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.35rem)',
              color: 'var(--text-secondary)',
              maxWidth: 600,
              margin: '0 auto 3rem',
              lineHeight: 1.6,
            }}
          >
            AI-Powered Decision Intelligence for Smart Cities.
            Monitor, analyze, and optimize city operations across 12 domains in real-time.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              maxWidth: 600,
              margin: '0 auto',
              position: 'relative',
            }}
          >
            <form onSubmit={handleSearchSubmit} className="card-glass" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 0.75rem 0.5rem 1.25rem',
              borderRadius: 'var(--radius-xl)',
              borderColor: 'var(--border-glow)',
              boxShadow: 'var(--shadow-glow)',
            }}>
              <Search size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Ask your city anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '1.05rem',
                  fontFamily: 'inherit',
                }}
              />
              <button type="button" className="btn btn-ghost btn-icon" style={{ flexShrink: 0 }}>
                <Mic size={18} />
              </button>
              <button type="submit" className="btn btn-primary" style={{
                borderRadius: 'var(--radius-md)',
                padding: '0.6rem 1rem',
              }}>
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        </motion.div>

        {/* ═══ Live Stats ═══ */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
            marginTop: '4rem',
            maxWidth: 700,
            width: '100%',
          }}
        >
          {STATS.map((stat) => {
            const counter = useCounter(stat.value, 2000, stat.decimals);
            const Icon = stat.icon;
            return (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <Icon size={20} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                <div ref={counter.ref} className="mono" style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}>
                  {counter.count.toLocaleString()}{stat.suffix && <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginLeft: 2 }}>{stat.suffix}</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{stat.label}</div>
              </div>
            );
          })}
        </motion.div>
      </section>

      {/* ═══ Domain Showcase ═══ */}
      <section ref={domainRef} style={{ padding: '4rem 2rem 6rem', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={domainsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }} className="glow-text-subtle">
            12 Integrated Domains
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
            Comprehensive city intelligence covering every aspect of urban governance
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={domainsInView ? 'visible' : 'hidden'}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          {DOMAIN_CONFIGS.map((domain) => {
            const Icon = DOMAIN_ICONS[domain.id];
            return (
              <motion.div key={domain.id} variants={itemVariants}>
                <Link href={`/operator/${domain.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card-glass" style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                    {/* Top accent line */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: `linear-gradient(90deg, transparent, ${domain.color}, transparent)`,
                    }} />
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: `${domain.color}18`,
                        border: `1px solid ${domain.color}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={20} style={{ color: domain.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                          {domain.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                          {domain.description}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: domain.color }}>
                            {domain.stat}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{domain.statLabel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ═══ Role Cards ═══ */}
      <section style={{ padding: '2rem 2rem 6rem', maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }} className="glow-text-subtle">
            Choose Your Role
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Tailored experiences for every stakeholder</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {ROLES.map((role, i) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link href={role.href} style={{ textDecoration: 'none' }}>
                  <div className="card-glass" style={{ textAlign: 'center', padding: '2rem 1.5rem', cursor: 'pointer' }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: role.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem',
                      boxShadow: `0 0 30px ${role.gradient.includes('#06b6d4') ? 'hsla(185,96%,42%,0.2)' : role.gradient.includes('#f97316') ? 'hsla(25,95%,53%,0.2)' : 'hsla(271,91%,65%,0.2)'}`,
                    }}>
                      <Icon size={24} color="#fff" />
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>{role.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                      {role.description}
                    </p>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.8rem',
                      color: 'var(--primary)',
                      fontWeight: 600,
                    }}>
                      Enter <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer style={{
        borderTop: '1px solid var(--border-1)',
        padding: '2rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Brain size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }} className="glow-text">CityMind</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          AI-Powered Decision Intelligence Platform • Built for Smart India Hackathon 2026
        </p>
      </footer>
    </div>
  );
}
