import type { Metadata, Viewport } from 'next';
import { Rajdhani, Atkinson_Hyperlegible, Quicksand, Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { XPSurgeEffect } from '@/components/ui/XPSurgeEffect';
import { FloatingXP } from '@/components/ui/FloatingXP';
import { Providers } from './providers';

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
});

const atkinson = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-atkinson',
});

// Quicksand - Fuente amigable y rounded para UI principal
const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-quicksand',
  display: 'swap',
});

// Inter - Fuente altamente legible para texto largo y contenido educativo
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LinguaForge - Forja tu Dominio del Francés',
  description: 'Domina el francés con un sistema de progresión único',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LinguaForge',
  },
};

export const viewport: Viewport = {
  themeColor: '#6366F1', // LinguaForge primary - Indigo 500 (unificado y mejorado)
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Permitir zoom para accesibilidad
  userScalable: true, // IMPORTANTE para accesibilidad WCAG
  viewportFit: 'cover', // Para pantallas con notch
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${rajdhani.variable} ${atkinson.variable} ${quicksand.variable} ${inter.variable}`}>
      <head>
        {/* Preconnect para performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* PWA iOS */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LinguaForge" />
      </head>
      <body className="font-atkinson antialiased bg-lf-dark text-white">
        {/* Skip link para accesibilidad */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-lf-accent focus:text-lf-dark focus:rounded-lg"
        >
          Saltar al contenido principal
        </a>

        <Providers>
          <XPSurgeEffect />
          <FloatingXP />

          {/* Header semántico */}
          <Header />

          {/* Main content con landmark */}
          <main
            id="main-content"
            role="main"
            aria-label="Contenido principal"
            className="pt-header pb-nav min-h-[100dvh] flex flex-col"
          >
            <div className="flex-1 w-full px-4 py-4 lg:container lg:mx-auto">
              {children}
            </div>
          </main>

          {/* Navigation semántica */}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
