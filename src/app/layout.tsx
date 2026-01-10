import type { Metadata, Viewport } from 'next';
import { Rajdhani, Atkinson_Hyperlegible, Quicksand, Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { XPSurgeEffect } from '@/components/ui/XPSurgeEffect';
import { GamificationFeedback } from '@/components/ui/GamificationFeedback';
import { Providers } from './providers';
import { AAAAnimatedBackground } from '@/components/ui/AAAAnimatedBackground';
import { AAAErrorBoundary } from '@/components/ui/ErrorBoundary';
import { TutorialProvider } from '@/components/tutorial';
import { HelpButton } from '@/components/help';

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

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-quicksand',
  display: 'swap',
});

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
  themeColor: '#0F172A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${rajdhani.variable} ${atkinson.variable} ${quicksand.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LinguaForge" />
      </head>
      <body className="font-atkinson antialiased text-white">
        {/* Skip link para accesibilidad */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-lf-accent focus:text-lf-dark focus:rounded-lg"
        >
          Saltar al contenido principal
        </a>

        <Providers>
          <TutorialProvider>
            <AAAErrorBoundary>
              <AAAAnimatedBackground variant="midnight" intensity="medium">
                <XPSurgeEffect />
                <GamificationFeedback />

                {/* Header semántico */}
                <Header />

                {/* Main content con landmark */}
                <main
                  id="main-content"
                  role="main"
                  aria-label="Contenido principal"
                  className="min-h-[calc(100vh-var(--header-height)-var(--nav-height))] flex flex-col"
                >
                  <div className="flex-1 w-full pt-[calc(var(--header-height)+1rem)] px-4 pb-[calc(var(--nav-height)+1rem)] lg:container lg:mx-auto">
                    {children}
                  </div>
                </main>

                {/* Navigation semántica */}
                <BottomNav />

                {/* Botón de ayuda flotante */}
                <HelpButton />
              </AAAAnimatedBackground>
            </AAAErrorBoundary>
          </TutorialProvider>
        </Providers>
      </body>
    </html>
  );
}
