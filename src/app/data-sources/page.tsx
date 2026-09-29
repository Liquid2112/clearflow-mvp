import Link from 'next/link';

export default function DataSourcesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 no-underline transition-colors hover:text-brand-700">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back to home
        </Link>
        <p className="eyebrow">Transparency</p>
        <h1 className="mt-2 text-3xl text-ink-900 sm:text-4xl">Data sources</h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-600">
          ClearFlow is built on free public water-system data. Here are the specific sources, how they connect,
          and exactly what this demo uses today.
        </p>
      </div>

      {/* Demo data callout */}
      <div className="mb-10 rounded-2xl border border-brand-200 bg-brand-50 p-5">
        <h2 className="mb-1 flex items-center gap-2 text-base font-semibold text-ink-900">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f7181" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
          What this demo uses
        </h2>
        <p className="text-sm leading-relaxed text-ink-600">
          This pilot is a static app with <strong>no server</strong>. To work reliably offline and avoid
          browser CORS limits, it ships with a <strong>bundled sample</strong> of the public sources below for
          a handful of real water systems (Nashville-area coverage). The sources, references, and matching
          method are real; the data snapshot is a fixed sample. A production build swaps the bundled sample for
          live EPA/SDWIS queries at the integration points listed further down.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-xl text-ink-900">EPA and utility data sources</h2>
        <div className="space-y-3">
          {[
            {
              name: 'EPA Community Water System service-area layer',
              url: 'https://www.epa.gov/community-water-systems',
              desc: 'ArcGIS-hosted service-area boundaries for public water systems across the U.S. This is the geographic layer used to match an address (via geocoding and point-in-polygon) to the PWSID most likely serving it.',
            },
            {
              name: 'EPA SDWIS / ECHO',
              url: 'https://echo.epa.gov/',
              desc: 'Safe Drinking Water Information System and Enforcement and Compliance History Online. Provides public compliance, monitoring, and reporting data for each PWSID — the compliance input to your water grade.',
            },
            {
              name: 'EPA Consumer Confidence Reports (CCR)',
              url: 'https://sdwis.epa.gov/fylccr/',
              desc: 'Annual water quality reports published by community water systems. ClearFlow links directly to your system\u2019s CCR when available.',
            },
          ].map((item, i) => (
            <div key={i} className="surface-card flex gap-4 p-4">
              <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
              <div className="min-w-0 flex-1">
                <h3 className="mb-1 font-semibold text-ink-900">{item.name}</h3>
                <p className="mb-2 text-sm leading-relaxed text-ink-500">{item.desc}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 break-all text-sm font-medium text-brand-700 transition-colors hover:text-brand-600">
                  {item.url}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6M10 14L21 3" /></svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl text-ink-900">Last refreshed</h2>
        <div className="surface-card p-6">
          <p className="text-sm text-ink-600">
            Bundled sample snapshot dated:{' '}
            <span className="font-semibold text-ink-900">February 2026</span>
            <span className="mt-1 block text-ink-400">
              (fixed demo sample — a live deployment would show an actual timestamp from the refresh job)
            </span>
          </p>
          <p className="mt-3 text-xs leading-relaxed text-ink-400">
            A production build would refresh quarterly. Compliance data can change between refreshes; always
            check your system&apos;s most recent CCR for the latest information.
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl text-ink-900">Methodology</h2>
        <div className="surface-card overflow-hidden">
          {[
            { step: 'Geocode', desc: 'Your address is converted to a latitude/longitude.' },
            { step: 'Point-in-polygon', desc: 'The geocoded point is tested against EPA Community Water System service-area boundaries to find the PWSID most likely serving that location.' },
            { step: 'PWSID lookup', desc: 'Once we have a PWSID, we retrieve the public system profile: name, type, population served, service connections, and boundary source.' },
            { step: 'SDWIS compliance check', desc: 'We check SDWIS/ECHO for the most recent compliance and monitoring status, and link to the Consumer Confidence Report when available.' },
            { step: 'Grade', desc: 'The compliance snapshot is scored into a 0–100 grade (contaminants, compliance, disinfection, hardness) with plain-English drivers.' },
            { step: 'Deterministic recommendation', desc: 'Your quiz answers and the grade pass through a rules-based engine. The same inputs always return the same recommendation.' },
          ].map((item, i) => (
            <div key={i} className="border-b border-ink-100 px-6 py-4 last:border-b-0">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{i + 1}</div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-ink-900">{item.step}</h3>
                  <p className="text-sm leading-relaxed text-ink-500">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-xl text-ink-900">Where live EPA integration connects</h2>
        <p className="mb-3 text-sm leading-relaxed text-ink-500">
          These are the exact functions a production build would point at the live EPA services instead of the
          bundled sample data:
        </p>
        <div className="space-y-3">
          {[
            { place: 'lib/geo.ts — geocodeAddress()', note: 'Replace the sample geocoder with a real geocoding service (e.g., US Census geocoder, EPA GeoPlatform, or a commercial provider).' },
            { place: 'lib/geo.ts — matchWaterSystem()', note: 'Replace with a point-in-polygon query against the EPA Community Water System ArcGIS feature service.' },
            { place: 'lib/epa.ts — fetchComplianceData()', note: 'Replace with queries to the EPA ECHO REST API or SDWIS bulk data to fetch real compliance events for a PWSID.' },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-ink-100 bg-ink-50/60 p-4">
              <span className="mb-1 inline-block rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs text-ink-700">{item.place}</span>
              <p className="mt-1 text-sm text-ink-600">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-4">
        <p className="text-xs leading-relaxed text-ink-500">
          ClearFlow uses public EPA and local utility data. A home test is recommended before making
          household-specific treatment decisions.
        </p>
      </div>
    </div>
  );
}
