import type { Metadata, Viewport } from 'next';
import { Rajdhani, Atkinson_Hyperlegible } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

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
  themeColor: '#7E22CE', // LinguaForge primary purple
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${rajdhani.variable} ${atkinson.variable}`}>
      <body className="font-atkinson antialiased bg-lf-dark text-white">
        <Header />
        <main className="pt-14 pb-16 min-h-screen">
          <div className="max-w-lg mx-auto px-4 py-4">{children}</div>
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
