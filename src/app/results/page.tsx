'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkId = searchParams.get('checkId');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checkId) {
      setError('No check ID found. Please start from the home page.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/results?checkId=${checkId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.checkId) {
          setError(d.error || 'Results not found.');
        } else {
          setData(d);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load results. Please try again.');
        setLoading(false);
      });
  }, [checkId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="inline-block w-10 h-10 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
        <p className="text-brand-700/60">Finding your water system...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-ink mb-2">Could not load results</h2>
        <p className="text-brand-700/70 mb-6">{error || 'Something went wrong.'}</p>
        <a
          href="/check-water"
          className="inline-block px-6 py-2.5 bg-brand-900 hover:bg-brand-800 text-white rounded-lg font-semibold transition-colors"
        >
          Try again
        </a>
      </div>
    );
  }

  // Match failed
  if (data.matchConfidence === 'Low' && !data.waterSystem) {
    return (
      <div className="max-w-2xl mx-auto">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-brand-900 hover:text-brand-600 transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to home
        </a>

        <div className="bg-white rounded-xl border border-brand-100 shadow-sm p-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-brand-900 text-center mb-3">
            We could not confidently match your address
          </h1>
          <p className="text-brand-700/70 text-center leading-relaxed mb-6 max-w-md mx-auto">
            We couldn&apos;t find a public water system that clearly matches the address you entered.
            This can happen with rural properties, private wells, or addresses that fall outside mapped service areas.
          </p>

          <div className="bg-brand-50 rounded-lg border border-brand-100 p-4 mb-6">
            <p className="text-sm text-brand-800/80 text-center">
              <strong>Try this:</strong> Check your utility bill for your water system name and PWSID, or contact your local water utility directly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/check-water"
              className="flex-1 py-3 px-5 bg-brand-900 hover:bg-brand-800 text-white rounded-lg font-semibold text-center transition-colors"
            >
              Try a different address
            </a>
            <a
              href="/how-it-works"
              className="flex-1 py-3 px-5 bg-white hover:bg-brand-50 text-brand-900 border border-brand-200 rounded-lg font-semibold text-center transition-colors"
            >
              How it works
            </a>
          </div>
        </div>

        <p className="mt-6 text-xs text-brand-600/60 text-center leading-relaxed max-w-lg mx-auto">
          ClearFlow uses public EPA and local utility data. A home test is recommended before making household-specific treatment decisions.
        </p>
      </div>
    );
  }

  // Successful match
  const ws = data.waterSystem;
  const confidenceColor =
    data.matchConfidence === 'High'
      ? 'bg-green-100 text-green-800 border-green-200'
      : data.matchConfidence === 'Medium'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-red-100 text-red-800 border-red-200';

  const statusColor =
    data.complianceStatus === 'no_recent_violation'
      ? 'bg-green-100 text-green-800 border-green-200'
      : data.complianceStatus === 'historical_violation'
      ? 'bg-red-100 text-red-800 border-red-200'
      : data.complianceStatus === 'monitoring_reporting_issue'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-gray-100 text-gray-700 border-gray-200';

  const statusLabel =
    data.complianceStatus === 'no_recent_violation'
      ? 'No recent health-based violation found'
      : data.complianceStatus === 'historical_violation'
      ? 'Historical violation found'
      : data.complianceStatus === 'monitoring_reporting_issue'
      ? 'Monitoring / reporting issue found'
      : 'Data needs review';

  return (
    <div className="max-w-2xl mx-auto">
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-brand-900 hover:text-brand-600 transition-colors mb-6"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to home
      </a>

      <div className="bg-white rounded-xl border border-brand-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-brand-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0c4a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.7 5.7a8 8 0 11-11.4 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-brand-900 truncate">
                {ws ? ws.name : 'Water System Match'}
              </h1>
              <p className="text-sm text-brand-600/70 mt-0.5">
                {ws ? `PWSID: ${ws.pwsid}` : '—'}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${confidenceColor} capitalize`}>
              {data.matchConfidence} confidence
            </span>
          </div>
        </div>

        {/* Data */}
        <div className="divide-y divide-brand-100">
          {ws && (
            <>
              <div className="px-6 py-4 flex flex-wrap gap-x-8 gap-y-2">
                <dl className="flex flex-wrap gap-x-8 gap-y-2">
                  <div>
                    <dt className="text-xs text-brand-600/60 font-medium pb-0.5">Water system</dt>
                    <dd className="text-sm text-ink font-medium">{ws.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-brand-600/60 font-medium pb-0.5">State</dt>
                    <dd className="text-sm text-ink font-medium">{ws.state}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-brand-600/60 font-medium pb-0.5">System type</dt>
                    <dd className="text-sm text-ink font-medium">{ws.system_type}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-brand-600/60 font-medium pb-0.5">Population served</dt>
                    <dd className="text-sm text-ink font-medium">
                      {ws.population_served >= 1000
                        ? `${(ws.population_served / 1000).toFixed(1)}k`
                        : `${ws.population_served}`}
                      {' '}people
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-brand-600/60 font-medium pb-0.5">Service connections</dt>
                    <dd className="text-sm text-ink font-medium">{ws.service_connections.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-brand-600/60 font-medium pb-0.5">Boundary source</dt>
                    <dd className="text-sm text-ink font-medium">{ws.boundary_source}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-brand-600/60 font-medium pb-0.5">Water source</dt>
                    <dd className="text-sm text-ink font-medium">
                      {data.waterSource || <em className="text-brand-600/50">Not available from public data</em>}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-brand-600/60 font-medium pb-0.5">Most recent report</dt>
                    <dd className="text-sm text-ink font-medium">
                      {data.lastReportDate
                        ? new Date(data.lastReportDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : <em className="text-brand-600/50">Not available</em>}
                    </dd>
                  </div>
                </dl>
              </div>
            </>
          )}

          {/* Public data status */}
          <div className="px-6 py-4">
            <dt className="text-xs text-brand-600/60 font-medium pb-1.5">Public data status</dt>
            <dd className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
              {statusLabel}
            </dd>
          </div>

          {/* CCR link */}
          {data.ccrUrl && (
            <div className="px-6 py-4">
              <p className="text-xs text-brand-600/60 mb-2">Consumer Confidence Report (CCR)</p>
              <a
                href={data.ccrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-600 transition-colors"
              >
                View CCR on SDWIS
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6M10 14L21 3" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Disclosure */}
      <div className="mt-4 p-4 bg-brand-50 rounded-lg border border-brand-100">
        <p className="text-xs text-brand-800/70 leading-relaxed">
          <strong>What this is:</strong> A match to a public water system based on your address, with a snapshot of publicly available EPA and utility compliance data for that system.
        </p>
        <p className="text-xs text-brand-800/70 leading-relaxed mt-2">
          <strong>What this is not:</strong> A test of the water at your specific tap. Public data does not capture household plumbing conditions, private wells, or other site-specific factors.
        </p>
      </div>

      {/* CTAs */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <a
          href={`/quiz?checkId=${data.checkId}`}
          className="flex-1 py-3 px-5 bg-brand-900 hover:bg-brand-800 text-white rounded-lg font-semibold text-center transition-colors"
        >
          Continue to personalization
        </a>
        <a
          href="/how-it-works"
          className="flex-1 py-3 px-5 bg-white hover:bg-brand-50 text-brand-900 border border-brand-200 rounded-lg font-semibold text-center transition-colors"
        >
          How it works
        </a>
      </div>

      <p className="mt-6 text-xs text-brand-600/60 text-center leading-relaxed max-w-lg mx-auto">
        ClearFlow uses public EPA and local utility data. A home test is recommended before making household-specific treatment decisions.
      </p>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto text-center py-16"><p className="text-brand-700/60">Loading...</p></div>}>
      <ResultsContent />
    </Suspense>
  );
}
