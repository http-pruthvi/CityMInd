'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
  LayoutDashboard,
  Bell,
  GitBranch,
  BarChart3,
  FileText,
  FlaskConical,
  Menu,
  X,
  Brain,
  ChevronDown,
  ChevronRight,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { DomainId } from '@/types';

const DOMAIN_ICONS: Record<DomainId, LucideIcon> = {
  mobility: Bus,
  safety: Shield,
  health: Heart,
  education: GraduationCap,
  environment: Leaf,
  waste: Trash2,
  energy: Zap,
  engagement: MessageSquare,
  accessibility: Accessibility,
  disaster: AlertTriangle,
  tourism: Map,
  community: Users,
};

const DOMAIN_COLORS: Record<DomainId, string> = {
  mobility: '#06b6d4',
  safety: '#ef4444',
  health: '#22c55e',
  education: '#a855f7',
  environment: '#10b981',
  waste: '#f59e0b',
  energy: '#eab308',
  engagement: '#3b82f6',
  accessibility: '#8b5cf6',
  disaster: '#f97316',
  tourism: '#ec4899',
  community: '#14b8a6',
};

const DOMAIN_NAMES: Record<DomainId, string> = {
  mobility: 'Mobility',
  safety: 'Public Safety',
  health: 'Health',
  education: 'Education',
  environment: 'Environment',
  waste: 'Waste',
  energy: 'Energy',
  engagement: 'Engagement',
  accessibility: 'Accessibility',
  disaster: 'Disaster',
  tourism: 'Tourism',
  community: 'Community',
};

interface SidebarProps {
  variant?: 'operator' | 'leadership';
}

export default function Sidebar({ variant = 'operator' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [domainsOpen, setDomainsOpen] = useState(true);
  const pathname = usePathname();

  const basePath = variant === 'leadership' ? '/leadership' : '/operator';

  const isActive = (path: string) => pathname === path;

  const [enabledDomains, setEnabledDomains] = useState<DomainId[]>([]);

  useEffect(() => {
    const fetchEnabled = async () => {
      try {
        const res = await fetch('/api/data/domains');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const active = data.data
            .filter((d: any) => d.enabled)
            .map((d: any) => d.id as DomainId);
          setEnabledDomains(active);
        }
      } catch (err) {
        console.error('Failed to fetch enabled domains:', err);
      }
    };

    fetchEnabled();
    const interval = setInterval(fetchEnabled, 3000);
    return () => clearInterval(interval);
  }, []);

  const domains = enabledDomains.length > 0 ? enabledDomains : (Object.keys(DOMAIN_ICONS) as DomainId[]);

  return (
    <motion.aside
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '1.25rem 0.75rem' : '1.25rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid var(--border-1)',
        minHeight: 64,
      }}>
        {!collapsed && (
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px var(--primary-glow)',
            }}>
              <Brain size={18} color="#fff" />
            </div>
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }} className="glow-text">
              CityMind
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn btn-ghost btn-icon"
          style={{ flexShrink: 0 }}
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
        {/* Overview */}
        <Link
          href={basePath}
          className={`sidebar-link ${isActive(basePath) ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          {!collapsed && <span>Overview</span>}
        </Link>

        {/* Domains Section */}
        {variant === 'operator' && (
          <>
            <button
              onClick={() => setDomainsOpen(!domainsOpen)}
              className="sidebar-link"
              style={{
                marginTop: '0.75rem',
                background: 'none',
                border: 'none',
                width: '100%',
                fontFamily: 'inherit',
              }}
            >
              <BarChart3 size={18} />
              {!collapsed && (
                <>
                  <span style={{ flex: 1, textAlign: 'left' }}>Domains</span>
                  {domainsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </>
              )}
            </button>

            <AnimatePresence>
              {domainsOpen && !collapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden', paddingLeft: '0.25rem' }}
                >
                  {domains.map((domain) => {
                    const Icon = DOMAIN_ICONS[domain];
                    return (
                      <Link
                        key={domain}
                        href={`/operator/${domain}`}
                        className={`sidebar-link ${isActive(`/operator/${domain}`) ? 'active' : ''}`}
                        style={{ fontSize: '0.8rem' }}
                      >
                        <Icon size={16} style={{ color: DOMAIN_COLORS[domain] }} />
                        <span>{DOMAIN_NAMES[domain]}</span>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Divider */}
        <div style={{
          height: 1,
          background: 'var(--border-1)',
          margin: '0.75rem 0',
        }} />

        {/* Tools / Leadership sections */}
        {!collapsed && (
          <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 1rem', marginBottom: '0.25rem' }}>
            {variant === 'leadership' ? 'Intelligence' : 'Tools'}
          </div>
        )}

        {variant === 'operator' ? (
          <>
            <Link href="/operator/alerts" className={`sidebar-link ${isActive('/operator/alerts') ? 'active' : ''}`}>
              <Bell size={18} />
              {!collapsed && <span>Alerts</span>}
              {!collapsed && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'hsla(0, 84%, 60%, 0.15)',
                  color: 'var(--accent-red)',
                  borderRadius: '99px',
                  padding: '1px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}>
                  47
                </span>
              )}
            </Link>
            <Link href="/operator/workflows" className={`sidebar-link ${isActive('/operator/workflows') ? 'active' : ''}`}>
              <GitBranch size={18} />
              {!collapsed && <span>Workflows</span>}
            </Link>
            <Link href="/operator/settings" className={`sidebar-link ${isActive('/operator/settings') ? 'active' : ''}`}>
              <Settings size={18} />
              {!collapsed && <span>Module Admin</span>}
            </Link>
          </>
        ) : (
          <>
            <Link href="/leadership/analytics" className={`sidebar-link ${isActive('/leadership/analytics') ? 'active' : ''}`}>
              <BarChart3 size={18} />
              {!collapsed && <span>Analytics</span>}
            </Link>
            <Link href="/leadership/simulate" className={`sidebar-link ${isActive('/leadership/simulate') ? 'active' : ''}`}>
              <FlaskConical size={18} />
              {!collapsed && <span>Simulate</span>}
            </Link>
            <Link href="/leadership/reports" className={`sidebar-link ${isActive('/leadership/reports') ? 'active' : ''}`}>
              <FileText size={18} />
              {!collapsed && <span>Reports</span>}
            </Link>
          </>
        )}
      </nav>

      {/* User section */}
      {!collapsed && (
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--border-1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#fff',
          }}>
            AK
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Arun Kumar</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {variant === 'leadership' ? 'City Commissioner' : 'Operations Manager'}
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
