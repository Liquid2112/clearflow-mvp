import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="border-b border-brand-100 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 group">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none" className="text-brand-700">
              <path
                d="M50 8C28 30 18 55 27 73C36 87 50 83 50 83C50 83 64 87 73 73C82 55 72 30 50 8Z"
                fill="#0c4a6e"
              />
              <path
                d="M50 30C38 38 33 48 36 56C39 63 46 60 50 60C54 60 61 63 64 56C67 48 62 38 50 30Z"
                fill="#0891b2"
              />
            </svg>
            <span className="text-lg font-bold text-brand-900 group-hover:text-brand-600 transition-colors">
              ClearFlow
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/how-it-works"
              className="text-sm text-brand-700/70 hover:text-brand-900 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors"
            >
              How it works
            </Link>
            <Link
              href="/check-water"
              className="text-sm font-semibold text-white bg-brand-900 hover:bg-brand-800 px-4 py-2 rounded-lg transition-colors"
            >
              Check My Water
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
