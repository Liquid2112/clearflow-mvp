import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-brand-900 hover:text-brand-600 transition-colors mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-900 mb-3">How ClearFlow works</h1>
        <p className="text-lg text-brand-800/70 leading-relaxed max-w-2xl">
          ClearFlow helps you understand your public water system and choose the right next step — without guesswork.
          Here is exactly where our information comes from and how we use it.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-brand-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">1</span>
            Data sources
          </h2>
          <p className="text-brand-700/80 text-base leading-relaxed mb-4">
            ClearFlow draws on publicly available water-system information maintained by the U.S. Environmental Protection Agency (EPA) and local water utilities.
          </p>
          <ul className="space-y-3">
            {[
              {
                title: 'EPA Community Water System service-area data',
                desc: 'The EPA maintains a national dataset of public water system service boundaries. This is the geographic layer that lets us match an address to the water system most likely serving it.',
                link: 'https://www.epa.gov/community-water-systems',
              },
              {
                title: 'SDWIS / ECHO compliance data',
                desc: 'The Safe Drinking Water Information System (SDWIS) and the Enforcement and Compliance History Online (ECHO) portal provide public information about water system violations, monitoring, and reporting.',
                link: 'https://echo.epa.gov/',
              },
              {
                title: 'Consumer Confidence Reports (CCRs)',
                desc: 'Every community water system publishes an annual Consumer Confidence Report. ClearFlow links to these reports so you can read what your system reports about its water quality.',
                link: 'https://sdwis.epa.gov/fylccr/',
              },
            ].map((item, i) => (
              <li key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-brand-100">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-brand-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-brand-700/70 leading-relaxed mb-2">{item.desc}</p>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 transition-colors">
                      Visit source
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6M10 14L21 3" /></svg>
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-brand-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">2</span>
            Data refresh
          </h2>
          <p className="text-brand-700/80 text-base leading-relaxed">
            We refresh our public data snapshot on a quarterly basis. Compliance data, service area boundaries, and system information can change over time.
          </p>
          <p className="text-sm text-brand-600/60 mt-3">
            Last refreshed:{' '}
            <em>see Data Sources page for current placeholder date.</em>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-brand-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">3</span>
            Deterministic recommendation engine
          </h2>
          <p className="text-brand-700/80 text-base leading-relaxed mb-4">
            ClearFlow uses a rules-based, deterministic engine to generate your recommendation. That means:
          </p>
          <ul className="space-y-2">
            {[
              'Your recommendation is the result of explicit, documented rules — not a guess.',
              'No large language model (LLM) or AI is deciding what treatment you should buy.',
              'The same inputs always produce the same recommendation. You can understand why.',
              'Recommendations are a starting point, not a replacement for a household water test.',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 items-start">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
                <span className="text-sm text-brand-700/80">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-brand-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">4</span>
            Test-kit logic
          </h2>
          <p className="text-brand-700/80 text-base leading-relaxed mb-4">
            When ClearFlow recommends a home test, we point you toward certified water testing options. Our test-kit suggestions are based on:
          </p>
          <ul className="space-y-2">
            {[
              'The primary concern you identified (lead, hardness, general quality, etc.).',
              'The scope you described (drinking water vs. whole-home).',
              'Widely available, certified home test kits — not any specific brand partnership.',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 items-start">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
                <span className="text-sm text-brand-700/80">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-brand-600/60 mt-4">
            ClearFlow is not paid to recommend any specific test kit or treatment product. Recommendations are informational.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-brand-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">5</span>
            Limitations
          </h2>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <p className="text-sm text-amber-800/80 leading-relaxed mb-4">
              ClearFlow is a public-data tool. It is not a substitute for a household water test, a consultation with a water professional, or a regulatory determination. Specifically:
            </p>
            <ul className="space-y-2">
              {[
                'Public data describes the water system, not the water at your specific tap.',
                'Private wells and some rural properties may not be covered by public system data.',
                'Household plumbing (pipes, fixtures, solder) can introduce contaminants that public data does not capture.',
                'Water quality varies over time. A single snapshot is a starting point, not a guarantee.',
                'Our Nashville mock coverage shows how the system works; broader coverage depends on data availability.',
              ].map((item, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="text-amber-500 flex-shrink-0 mt-0.5 font-bold">—</span>
                  <span className="text-sm text-amber-800/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="mt-10 p-4 bg-brand-50 rounded-lg border border-brand-100">
        <p className="text-xs text-brand-800/70 leading-relaxed">
          ClearFlow uses public EPA and local utility data. A home test is recommended before making household-specific treatment decisions.
        </p>
      </div>
    </div>
  );
}
