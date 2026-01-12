import type { Metadata, Viewport } from 'next';
import { Atkinson_Hyperlegible, Inter, Quicksand, Rajdhani } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Providers } from './providers';
import { AAAErrorBoundary } from '@/components/ui/ErrorBoundary';
import { TutorialProvider } from '@/components/tutorial';
import { HelpButton } from '@/components/help';

// Quicksand for headings - softer than Rajdhani
const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-quicksand',
  display: 'swap',
});

// Keep Rajdhani available for legacy components
const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
});

// Inter for body
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

// Atkinson for accessibility
const atkinson = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-atkinson',
});

export const metadata: Metadata = {
  title: 'LinguaForge - Aprende Francés a Tu Ritmo',
  description: 'Aprende francés en un espacio tranquilo, donde equivocarse está bien',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LinguaForge',
  },
};

// Dark mode calm theme color
export const viewport: Viewport = {
  themeColor: '#1C2127',
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
    <html
      lang="es"
      className={`${rajdhani.variable} ${quicksand.variable} ${inter.variable} ${atkinson.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/icons/icon-192x192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LinguaForge" />
      </head>
      <body className="font-atkinson antialiased text-white">
        {/* Skip link */}
        <a
          href="#main-content"
          className="sr-only rounded-lg bg-lf-accent px-4 py-2 text-lf-dark focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
        >
          Saltar al contenido principal
        </a>

        <Providers>
          <TutorialProvider>
            <AAAErrorBoundary>
              {/* Calm dark background */}
              <div className="min-h-screen">
                <Header />

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

                <BottomNav />
                <HelpButton />
              </div>
            </AAAErrorBoundary>
          </TutorialProvider>
        </Providers>
      </body>
    </html>
  );
}
