import Link from 'next/link';

export default function DataSourcesPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-brand-900 hover:text-brand-600 transition-colors mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          Back to home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-900 mb-3">Data sources</h1>
        <p className="text-lg text-brand-800/70 leading-relaxed max-w-2xl">
          ClearFlow is built on public water-system data. Here are the specific sources we use, how they connect, and where the data comes from.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-brand-900 mb-4">EPA and utility data sources</h2>
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
              desc: 'Safe Drinking Water Information System and Enforcement and Compliance History Online. Provides public compliance, monitoring, and reporting data for each PWSID.',
            },
            {
              name: 'EPA Consumer Confidence Reports (CCR)',
              url: 'https://sdwis.epa.gov/fylccr/',
              desc: 'Annual water quality reports published by community water systems. ClearFlow links directly to your system\'s CCR when available.',
            },
          ].map((item, i) => (
            <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-brand-100">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-brand-900 mb-1">{item.name}</h3>
                <p className="text-sm text-brand-700/70 leading-relaxed mb-2">{item.desc}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-600 transition-colors">
                  {item.url}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6M10 14L21 3" /></svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-brand-900 mb-4">Last refreshed</h2>
        <div className="bg-brand-50 rounded-xl border border-brand-100 p-6">
          <p className="text-sm text-brand-800/80">
            Public data snapshot last refreshed:{' '}
            <span className="font-semibold">February 2026</span>
            <span className="block mt-1 text-brand-600/60">
              (placeholder — a real deployment would show an actual timestamp pulled from the refresh job)
            </span>
          </p>
          <p className="text-xs text-brand-600/60 mt-3 leading-relaxed">
            We aim to refresh quarterly. Compliance data can change between refreshes; always check your system&apos;s most recent CCR for the latest information.
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-brand-900 mb-4">Methodology</h2>
        <div className="bg-white rounded-xl border border-brand-100 shadow-sm overflow-hidden">
          {[
            { step: 'Step 1 — Geocode', desc: 'Your address is converted to a latitude/longitude using a geocoding service.' },
            { step: 'Step 2 — Point-in-polygon', desc: 'The geocoded point is tested against EPA Community Water System service-area boundaries to find the PWSID most likely serving that location.' },
            { step: 'Step 3 — PWSID lookup', desc: 'Once we have a PWSID, we retrieve the public system profile: name, type, population served, service connections, and boundary source.' },
            { step: 'Step 4 — SDWIS compliance check', desc: 'We check SDWIS/ECHO for the most recent compliance and monitoring status of the matched system, and link to the Consumer Confidence Report when available.' },
            { step: 'Step 5 — Deterministic recommendation', desc: 'Your quiz answers and the public data snapshot are passed through a rules-based engine. The engine is deterministic: the same inputs always return the same recommendation.' },
          ].map((item, i) => (
            <div key={i} className="px-6 py-4 border-b border-brand-100 last:border-b-0">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs flex-shrink-0 mt-0.5">{i + 1}</div>
                <div>
                  <h3 className="font-semibold text-brand-900 text-sm mb-1">{item.step}</h3>
                  <p className="text-sm text-brand-700/70 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-brand-900 mb-4">Where real EPA integration connects</h2>
        <div className="space-y-3">
          {[
            { place: 'lib/geo.ts — geocodeAddress()', note: 'Replace the Nashville stub with a call to a geocoding service (e.g., EPA GeoPlatform, US Census geocoder, or a commercial provider).' },
            { place: 'lib/geo.ts — matchWaterSystem()', note: 'Replace with a point-in-polygon query against the EPA Community Water System ArcGIS feature service.' },
            { place: 'lib/epa.ts — fetchComplianceData()', note: 'Replace with queries to EPA ECHO REST API or SDWIS bulk data to fetch real compliance events for a PWSID.' },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">{item.place}</span>
              </div>
              <p className="text-sm text-brand-700/80">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="p-4 bg-brand-50 rounded-lg border border-brand-100">
        <p className="text-xs text-brand-800/70 leading-relaxed">
          ClearFlow uses public EPA and local utility data. A home test is recommended before making household-specific treatment decisions.
        </p>
      </div>
    </div>
  );
}
