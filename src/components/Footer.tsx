import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-brand-100 py-6 mt-8">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-600/60">
        <p>ClearFlow — public water-system information, explained.</p>
        <div className="flex gap-4">
          <Link href="/how-it-works" className="hover:text-brand-700 transition-colors">How it works</Link>
          <Link href="/data-sources" className="hover:text-brand-700 transition-colors">Data sources</Link>
          <Link href="/privacy" className="hover:text-brand-700 transition-colors">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
