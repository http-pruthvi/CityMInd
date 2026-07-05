/* ============================================================
   CityMind — Root Layout
   App-wide shell: fonts, metadata, dark theme, global styles
   ============================================================ */

import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// ── Fonts ────────────────────────────────────────────────────

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

// ── Metadata ─────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: 'CityMind — Smart City Intelligence Platform',
    template: '%s | CityMind',
  },
  description:
    'AI-Powered Decision Intelligence Platform for Smart Cities. Real-time urban monitoring, predictive analytics, and citizen engagement across 12 civic domains.',
  keywords: [
    'smart city',
    'urban intelligence',
    'city dashboard',
    'AI analytics',
    'civic technology',
    'urban planning',
    'decision intelligence',
    'IoT monitoring',
  ],
  authors: [{ name: 'CityMind Team' }],
  creator: 'CityMind',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'CityMind',
    title: 'CityMind — Smart City Intelligence Platform',
    description:
      'AI-Powered Decision Intelligence Platform for Smart Cities. Real-time monitoring, predictive analytics, and citizen engagement.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CityMind — Smart City Intelligence Platform',
    description:
      'AI-Powered Decision Intelligence Platform for Smart Cities.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: 'hsl(220, 20%, 6%)' },
    { media: '(prefers-color-scheme: light)', color: 'hsl(220, 20%, 6%)' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'dark',
};

// ── Layout ───────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Force dark color scheme at the browser level */}
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="min-h-screen bg-surface-0 noise-overlay">
        {children}
      </body>
    </html>
  );
}
