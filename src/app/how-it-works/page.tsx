import Link from 'next/link';

const CHECK = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f7181" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 no-underline transition-colors hover:text-brand-700">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>
        <p className="eyebrow">How it works</p>
        <h1 className="mt-2 text-3xl text-ink-900 sm:text-4xl">From public data to a water grade</h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-600">
          ClearFlow turns free public water-system data into a single, Whoop-style grade for your water and a
          clear next step. Here is exactly where the information comes from and how the grade is built.
        </p>
      </div>

      <div className="space-y-8">
        {/* Step: data sources */}
        <section>
          <h2 className="mb-4 flex items-center gap-3 text-2xl text-ink-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">1</span>
            Public data sources
          </h2>
          <p className="mb-4 text-base leading-relaxed text-ink-600">
            ClearFlow draws on publicly available water-system information maintained by the U.S.
            Environmental Protection Agency (EPA) and local water utilities.
          </p>
          <ul className="space-y-3">
            {[
              {
                title: 'EPA Community Water System service-area data',
                desc: 'A national dataset of public water system service boundaries. This geographic layer lets us match an address to the water system most likely serving it.',
                link: 'https://www.epa.gov/community-water-systems',
              },
              {
                title: 'SDWIS / ECHO compliance data',
                desc: 'The Safe Drinking Water Information System (SDWIS) and Enforcement and Compliance History Online (ECHO) provide public information about violations, monitoring, and reporting.',
                link: 'https://echo.epa.gov/',
              },
              {
                title: 'Consumer Confidence Reports (CCRs)',
                desc: 'Every community water system publishes an annual Consumer Confidence Report. ClearFlow links to these so you can read what your system reports about its water quality.',
                link: 'https://sdwis.epa.gov/fylccr/',
              },
            ].map((item, i) => (
              <li key={i} className="surface-card flex gap-4 p-4">
                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                <div>
                  <h3 className="mb-1 font-semibold text-ink-900">{item.title}</h3>
                  <p className="mb-2 text-sm leading-relaxed text-ink-500">{item.desc}</p>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 transition-colors hover:text-brand-600">
                    Visit source
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6M10 14L21 3" /></svg>
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl border border-ink-100 bg-ink-50/60 p-4 text-sm leading-relaxed text-ink-500">
            <strong className="text-ink-700">Demo note:</strong> this pilot runs on a bundled sample of the
            data above for a handful of real systems (Nashville-area coverage) so it works offline with no
            server. A production build would query the live EPA/SDWIS APIs at the integration points listed on
            the <Link href="/data-sources" className="font-medium text-brand-700">Data sources</Link> page.
          </p>
        </section>

        {/* Step: the grade */}
        <section>
          <h2 className="mb-4 flex items-center gap-3 text-2xl text-ink-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">2</span>
            Your water grade
          </h2>
          <p className="mb-4 text-base leading-relaxed text-ink-600">
            We distill the matched system&apos;s public compliance snapshot into a single{' '}
            <strong className="text-ink-900">0–100 score and an A–F letter</strong> — a Whoop-style grade you
            can track and improve. The overall grade is a weighted blend of four sub-scores:
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { name: 'Contaminants', weight: '40%', desc: 'Metals and inorganics (lead, arsenic, copper, nitrate) measured against their EPA limits.' },
              { name: 'Compliance', weight: '25%', desc: 'The utility\'s public track record: violations, monitoring, and reporting status.' },
              { name: 'Disinfection', weight: '20%', desc: 'Disinfection byproducts plus chlorine/chloramine residual — the "pool water" taste.' },
              { name: 'Hardness', weight: '15%', desc: 'Grains per gallon mapped to scale risk on fixtures and appliances.' },
            ].map((s, i) => (
              <div key={i} className="surface-card p-4">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-semibold text-ink-900">{s.name}</h3>
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">{s.weight}</span>
                </div>
                <p className="text-sm leading-relaxed text-ink-500">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink-500">
            Health-oriented dimensions dominate the blend, so a real contaminant or compliance issue can pull
            the grade down hard while aesthetic issues cannot on their own sink an otherwise-safe system. Every
            point deducted is explained by a plain-English driver on your results, and when there is not enough
            public data we show an honest &ldquo;not enough data to grade&rdquo; state instead of a made-up number.
          </p>
        </section>

        {/* Step: recommendation engine */}
        <section>
          <h2 className="mb-4 flex items-center gap-3 text-2xl text-ink-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">3</span>
            Deterministic recommendation engine
          </h2>
          <p className="mb-4 text-base leading-relaxed text-ink-600">
            Your quiz answers and the public data snapshot pass through a rules-based engine that turns your
            grade into a next step. That means:
          </p>
          <ul className="space-y-2">
            {[
              'Your recommendation is the result of explicit, documented rules — not a guess.',
              'No large language model or AI decides what treatment you should buy.',
              'The same inputs always produce the same recommendation, so you can understand why.',
              'The plan page projects how your grade could improve with the recommended treatment, as a clearly-labeled estimate — not a measured result.',
              'A recommendation is a starting point, not a replacement for a household water test.',
            ].map((item, i) => (
              <li key={i} className="flex gap-3">
                {CHECK}
                <span className="text-sm text-ink-600">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Step: test-kit logic */}
        <section>
          <h2 className="mb-4 flex items-center gap-3 text-2xl text-ink-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">4</span>
            Test-kit logic
          </h2>
          <p className="mb-4 text-base leading-relaxed text-ink-600">
            When ClearFlow recommends a home test, we point you toward certified water testing options. Our
            suggestions are based on:
          </p>
          <ul className="space-y-2">
            {[
              'The primary concern you identified (lead, hardness, general quality, etc.).',
              'The scope you described (drinking water vs. whole-home).',
              'Widely available, certified home test kits — not any specific brand partnership.',
            ].map((item, i) => (
              <li key={i} className="flex gap-3">
                {CHECK}
                <span className="text-sm text-ink-600">{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-ink-400">
            ClearFlow is not paid to recommend any specific test kit or treatment product. Recommendations are
            informational.
          </p>
        </section>

        {/* Limitations */}
        <section>
          <h2 className="mb-4 flex items-center gap-3 text-2xl text-ink-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">5</span>
            Limitations
          </h2>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <p className="mb-4 text-sm leading-relaxed text-amber-800/90">
              ClearFlow is a public-data tool. It is not a substitute for a household water test, a
              consultation with a water professional, or a regulatory determination. Specifically:
            </p>
            <ul className="space-y-2">
              {[
                'Public data describes the water system, not the water at your specific tap.',
                'Private wells and some rural properties may not be covered by public system data.',
                'Household plumbing (pipes, fixtures, solder) can introduce contaminants that public data does not capture.',
                'Water quality varies over time. A single snapshot is a starting point, not a guarantee.',
                'This demo ships with bundled sample data for a few systems to show how the product works; broader coverage depends on live data availability.',
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 font-bold text-amber-500">·</span>
                  <span className="text-sm text-amber-800/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="mt-10 rounded-xl border border-ink-100 bg-ink-50/60 p-4">
        <p className="text-xs leading-relaxed text-ink-500">
          ClearFlow uses public EPA and local utility data. A home test is recommended before making
          household-specific treatment decisions.
        </p>
      </div>
    </div>
  );
}
