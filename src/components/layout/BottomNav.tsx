'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/tree', icon: '⬡', label: 'Lattice' },
  { href: '/input', icon: '◎', label: 'Echo' },
  { href: '/dashboard', icon: '◈', label: 'Forge' },
  { href: '/profile', icon: '⬢', label: 'Glyph' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-lf-soft border-t border-lf-primary/20 z-50 pb-safe">
      <div className="h-full max-w-lg mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-200 ${
                isActive
                  ? 'text-lf-accent'
                  : 'text-lf-muted hover:text-lf-secondary'
              }`}
            >
              <span className={`text-xl mb-0.5 ${isActive ? 'animate-resonance-pulse' : ''}`}>
                {item.icon}
              </span>
              <span className="font-rajdhani text-xs font-medium tracking-wide uppercase">
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-8 h-0.5 bg-lf-accent rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
