import Link from 'next/link';

const FOOTER_LINKS = [
  { href: '/how-it-works', label: 'How it works' },
  { href: '/data-sources', label: 'Data sources' },
  { href: '/privacy', label: 'Privacy' },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-100 bg-ink-50/60">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <svg width="26" height="26" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                <path
                  d="M50 8C28 30 18 55 27 73C36 87 50 83 50 83C50 83 64 87 73 73C82 55 72 30 50 8Z"
                  fill="#0b3f47"
                />
                <path
                  d="M50 34C40 41 35 50 38 57C41 63 47 60 50 60C53 60 59 63 62 57C65 50 60 41 50 34Z"
                  fill="#17b0bd"
                />
              </svg>
              <span className="text-base font-display font-semibold text-ink-900">ClearFlow</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-500">
              Public water-system data, translated into a grade and a plan you can act on. Informational
              only — a home test is recommended before treatment decisions.
            </p>
          </div>

          <nav className="flex flex-col gap-2 text-sm" aria-label="Footer">
            <span className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-ink-400">
              Learn more
            </span>
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-ink-500 no-underline transition-colors hover:text-brand-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-ink-100 pt-6 text-xs text-ink-400">
          <p>© {new Date().getFullYear()} ClearFlow. Built on public EPA and local utility data.</p>
        </div>
      </div>
    </footer>
  );
}
