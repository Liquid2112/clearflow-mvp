'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/data-sources', label: 'Data sources' },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group" aria-label="ClearFlow home">
      <span className="relative inline-flex items-center justify-center">
        <svg width="30" height="30" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="nav-drop" x1="20" y1="8" x2="80" y2="92" gradientUnits="userSpaceOnUse">
              <stop stopColor="#17b0bd" />
              <stop offset="1" stopColor="#0b3f47" />
            </linearGradient>
          </defs>
          <path
            d="M50 8C28 30 18 55 27 73C36 87 50 83 50 83C50 83 64 87 73 73C82 55 72 30 50 8Z"
            fill="url(#nav-drop)"
          />
          <path
            d="M50 34C40 41 35 50 38 57C41 63 47 60 50 60C53 60 59 63 62 57C65 50 60 41 50 34Z"
            fill="#f0fbfc"
            fillOpacity="0.85"
          />
        </svg>
      </span>
      <span className="text-lg font-display font-semibold tracking-tight text-ink-900 group-hover:text-brand-700 transition-colors">
        Clear<span className="text-brand-600">Flow</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname?.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100/80 bg-ink-50/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:inline-flex ${
                isActive(link.href)
                  ? 'bg-brand-50 text-brand-800'
                  : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/check-water"
            aria-current={isActive('/check-water') ? 'page' : undefined}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ink-800 hover:shadow-card active:translate-y-px"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            Check my water
          </Link>
        </nav>
      </div>
    </header>
  );
}
