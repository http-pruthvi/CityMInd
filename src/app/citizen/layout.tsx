'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, MessageSquare, FileWarning, LayoutGrid, UserCircle } from 'lucide-react';

const NAV_LINKS = [
  { href: '/citizen/chat', label: 'Chat', icon: MessageSquare },
  { href: '/citizen/report', label: 'Report', icon: FileWarning },
  { href: '/citizen/services', label: 'Services', icon: LayoutGrid },
];

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav className="navbar" style={{ padding: '0 1.5rem' }}>
        {/* Left - Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px var(--primary-glow)',
          }}>
            <Brain size={16} color="#fff" />
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 700 }} className="glow-text">CityMind</span>
        </Link>

        {/* Center - Nav Links */}
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`navbar-link ${isActive ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right - Avatar */}
        <div style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--accent-blue))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <UserCircle size={20} color="#fff" />
        </div>
      </nav>

      {/* Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  );
}
