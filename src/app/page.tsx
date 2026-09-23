import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      {/* Header nav */}
      <header className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
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
            <span className="text-lg font-bold text-brand-900">ClearFlow</span>
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
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 text-center">
        {/* Water droplet SVG visual */}
        <div className="flex justify-center mb-10">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40">
            <svg
              className="w-full h-full drop-shadow-lg"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse
                cx="60"
                cy="65"
                rx="52"
                ry="52"
                fill="#e0f2fe"
                className="animate-pulse"
                opacity="0.5"
              />
              <path
                d="M60 15C35 42 22 68 32 88C42 105 60 100 60 100C60 100 78 105 88 88C98 68 85 42 60 15Z"
                fill="#0c4a6e"
              />
              <path
                d="M60 30C45 42 38 55 42 66C46 75 55 72 60 72C65 72 74 75 78 66C82 55 75 42 60 30Z"
                fill="#0891b2"
              />
              <ellipse
                cx="48"
                cy="52"
                rx="6"
                ry="10"
                fill="white"
                opacity="0.3"
                transform="rotate(-20 48 52)"
              />
            </svg>
            <svg
              className="absolute -top-1 -right-2 w-6 h-6 animate-bounce"
              viewBox="0 0 24 24"
              fill="none"
              style={{ animationDuration: '3s' }}
            >
              <path
                d="M12 2C9 6 8 10 9 13C10 15.5 12 15 12 15C12 15 14 15.5 15 13C16 10 15 6 12 2Z"
                fill="#0891b2"
                opacity="0.6"
              />
            </svg>
            <svg
              className="absolute -bottom-1 -left-3 w-5 h-5 animate-bounce"
              viewBox="0 0 24 24"
              fill="none"
              style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
            >
              <path
                d="M12 2C9 6 8 10 9 13C10 15.5 12 15 12 15C12 15 14 15.5 15 13C16 10 15 6 12 2Z"
                fill="#0c4a6e"
                opacity="0.4"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-900 leading-tight mb-4">
          Understand your water.
          <br />
          <span className="text-brand-600">Choose the right next step.</span>
        </h1>

        <p className="text-lg sm:text-xl text-brand-800/70 max-w-2xl mx-auto leading-relaxed mb-8">
          ClearFlow connects your location to public water-system information, explains it in plain English,
          and recommends a tailored water-treatment path.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/check-water"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-900 hover:bg-brand-800 text-white font-semibold text-base rounded-xl transition-colors shadow-md hover:shadow-lg"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            Check My Water
          </Link>
          <Link
            href="/how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white hover:bg-brand-50 text-brand-900 border border-brand-200 font-semibold text-base rounded-xl transition-colors shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            How it works
          </Link>
        </div>

        {/* Trust copy */}
        <div className="mt-10 max-w-lg mx-auto p-4 bg-brand-50 rounded-xl border border-brand-100 text-left">
          <div className="flex gap-3 items-start">
            <svg
              className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <p className="text-sm text-brand-800/80 leading-relaxed">
              <strong>Uses public EPA and local utility data.</strong> A home test is recommended before making household-specific treatment decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0c4a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                ),
                title: 'Your location, matched to a water system',
                desc: 'We use your address to find the public water system most likely serving your area.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0c4a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                  </svg>
                ),
                title: 'Plain-English public data snapshot',
                desc: 'We translate EPA and utility compliance data into what it actually means for you.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0c4a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M16.5 12.5c-1.3 1.3-3 2.2-5 2.5" />
                    <path d="M7.5 12.5c1.3 1.3 3 2.2 5 2.5" />
                  </svg>
                ),
                title: 'A recommendation, not a sales pitch',
                desc: 'Your answers drive a rules-based recommendation — no hidden agenda, no upsell.',
              },
            ].map((item, i) => (
              <div key={i} className="text-center sm:text-left">
                <div className="w-12 h-12 mx-auto sm:mx-0 bg-brand-100 rounded-xl flex items-center justify-center mb-3">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-brand-900 mb-1.5">{item.title}</h3>
                <p className="text-sm text-brand-700/70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 text-center">
        <div className="bg-brand-900 rounded-2xl p-8 sm:p-12 shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to understand your water?
          </h2>
          <p className="text-brand-200 text-base mb-6 max-w-md mx-auto leading-relaxed">
            Start with your address. We will find your water system, show you what the public data says, and help you decide what to do next.
          </p>
          <Link
            href="/check-water"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-brand-100 text-brand-900 font-semibold text-base rounded-xl transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Check My Water
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-center">
        <div className="border-t border-brand-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-brand-600/60">
          <p>ClearFlow — Understand your water. Choose the right next step.</p>
          <div className="flex items-center gap-4">
            <Link href="/how-it-works" className="hover:text-brand-900 transition-colors underline underline-offset-2">
              How it works
            </Link>
            <Link href="/data-sources" className="hover:text-brand-900 transition-colors underline underline-offset-2">
              Data sources
            </Link>
            <Link href="/privacy" className="hover:text-brand-900 transition-colors underline underline-offset-2">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
