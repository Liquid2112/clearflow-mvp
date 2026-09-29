'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getUserCheck } from '@/lib/db';
import { fetchComplianceData } from '@/lib/epa';
import { computeWaterGrade } from '@/lib/grade';
import WaterGradeCard from '@/components/WaterGradeCard';

function ResultsContent() {
  const searchParams = useSearchParams();
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

    const check = getUserCheck(checkId);
    if (!check) {
      setError('Results not found. Please try again.');
      setLoading(false);
      return;
    }

    let complianceStatus = 'data_needs_review';
    let waterSource = null;
    let lastReportDate = null;
    let ccrUrl = null;
    let compliance = null;

    if (check.pwsid) {
      compliance = fetchComplianceData(check.pwsid);
      if (compliance) {
        complianceStatus = compliance.status;
        waterSource = compliance.waterSource;
        lastReportDate = compliance.lastReportDate;
        ccrUrl = compliance.ccrUrl;
      }
    }

    // Deterministic Whoop-style grade computed from the public compliance data.
    const grade = computeWaterGrade(compliance);

    setData({
      checkId: check.id,
      addressHash: check.addressHash,
      zip: check.zip,
      waterSystem: check.waterSystem,
      matchConfidence: check.matchConfidence,
      boundarySource: check.boundarySource,
      complianceStatus,
      compliance,
      waterSource,
      lastReportDate,
      ccrUrl,
      grade,
    });
    setLoading(false);
  }, [checkId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="relative mx-auto mb-5 h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-brand-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-600" />
        </div>
        <p className="text-ink-500">Finding your water system…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ember-100">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-2xl text-ink-900">We could not load your results</h1>
        <p className="mx-auto mt-2 max-w-sm text-ink-500">{error || 'Something went wrong.'}</p>
        <Link href="/check-water" className="btn-primary mt-6">Start a new check</Link>
      </div>
    );
  }

  // Low-confidence / no-match — framed as helpful next steps, not an error.
  if (data.matchConfidence === 'Low' && !data.waterSystem) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 no-underline transition-colors hover:text-brand-700">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>

        <div className="surface-card mt-8 p-8">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-ember-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9.5 12l1.8 1.8L15 10" />
            </svg>
          </div>
          <h1 className="text-center text-2xl text-ink-900">No confident match yet — here is what to do</h1>
          <p className="mx-auto mt-3 max-w-md text-center leading-relaxed text-ink-500">
            We couldn&apos;t confidently match your address to a mapped public water system. This is common
            for rural properties, private wells, or addresses outside our current demo coverage.
          </p>

          <div className="mt-6 space-y-3">
            {[
              'Check a recent water bill for your water system name and PWSID.',
              'Try the ZIP-code lookup — it matches at a broader area level.',
              'Private well? A certified home test is the most reliable next step.',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-ink-100 bg-ink-50/60 p-4">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {i + 1}
                </span>
                <p className="text-sm text-ink-600">{tip}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/check-water" className="btn-primary flex-1">Try a different lookup</Link>
            <Link href="/how-it-works" className="btn-ghost flex-1">How it works</Link>
          </div>
        </div>
      </div>
    );
  }

  const ws = data.waterSystem;

  const statusMeta: Record<string, { label: string; cls: string }> = {
    no_recent_violation: { label: 'No recent health-based violation', cls: 'bg-green-50 text-green-700 border-green-200' },
    historical_violation: { label: 'Historical violation on record', cls: 'bg-ember-50 text-ember-800 border-ember-200' },
    monitoring_reporting_issue: { label: 'Monitoring / reporting gap', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    data_needs_review: { label: 'Data needs review', cls: 'bg-ink-100 text-ink-600 border-ink-200' },
  };
  const status = statusMeta[data.complianceStatus] || statusMeta.data_needs_review;

  const confidenceCls =
    data.matchConfidence === 'High'
      ? 'bg-green-50 text-green-700 border-green-200'
      : data.matchConfidence === 'Medium'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-ember-50 text-ember-800 border-ember-200';

  const snapshot: Array<{ label: string; value: React.ReactNode }> = ws
    ? [
        { label: 'Water system', value: ws.name },
        { label: 'State', value: ws.state },
        { label: 'System type', value: ws.system_type },
        {
          label: 'Population served',
          value:
            ws.population_served >= 1000
              ? `${(ws.population_served / 1000).toFixed(1)}k people`
              : `${ws.population_served} people`,
        },
        { label: 'Service connections', value: ws.service_connections.toLocaleString() },
        { label: 'Boundary source', value: ws.boundary_source },
        {
          label: 'Water source',
          value: data.waterSource || <em className="text-ink-400">Not in public data</em>,
        },
        {
          label: 'Most recent report',
          value: data.lastReportDate
            ? new Date(data.lastReportDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : <em className="text-ink-400">Not available</em>,
        },
      ]
    : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 no-underline transition-colors hover:text-brand-700">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to home
      </Link>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="eyebrow">Step 2 of 4 · Your results</p>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${confidenceCls}`}>
          {data.matchConfidence} confidence
        </span>
      </div>

      {/* Grade leads — the product centerpiece. */}
      {data.grade && (
        <div className="mt-4">
          <WaterGradeCard grade={data.grade} systemName={ws ? ws.name : null} />
        </div>
      )}

      {/* System snapshot */}
      <div className="surface-card mt-6 overflow-hidden">
        <div className="flex items-start gap-4 border-b border-ink-100 p-6">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f7181" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2.69l5.7 5.7a8 8 0 11-11.4 0z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl text-ink-900">{ws ? ws.name : 'Water system match'}</h1>
            <p className="mt-0.5 text-sm text-ink-400">{ws ? `PWSID: ${ws.pwsid}` : '—'}</p>
          </div>
        </div>

        {ws && (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 p-6 sm:grid-cols-3">
            {snapshot.map((row) => (
              <div key={row.label}>
                <dt className="text-xs font-medium text-ink-400">{row.label}</dt>
                <dd className="mt-0.5 text-sm font-medium text-ink-800">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="border-t border-ink-100 p-6">
          <p className="text-xs font-medium text-ink-400">Public data status</p>
          <span className={`mt-1.5 inline-block rounded-full border px-3 py-1 text-xs font-semibold ${status.cls}`}>
            {status.label}
          </span>

          {data.ccrUrl && (
            <div className="mt-4">
              <a
                href={data.ccrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 no-underline transition-colors hover:text-brand-600"
              >
                View Consumer Confidence Report on SDWIS
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6M10 14L21 3" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Trust disclosure — styled as a trust element, not fine print. */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-brand-800">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
            What this is
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            A match to a public water system based on your address, with a grade drawn from published EPA
            and utility compliance data for that system.
          </p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-ink-700">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            What this is not
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">
            A test of the water at your specific tap. Public data does not capture household plumbing,
            private wells, or other site-specific factors.
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href={`/quiz?checkId=${encodeURIComponent(data.checkId)}`} className="btn-primary flex-1">
          Continue to your plan
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
        <Link href="/how-it-works" className="btn-ghost flex-1">How it works</Link>
      </div>

      <p className="mx-auto mt-6 max-w-md text-center text-xs leading-relaxed text-ink-400">
        ClearFlow uses public EPA and local utility data. A home test is recommended before making
        household-specific treatment decisions.
      </p>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-4 py-24 text-center"><p className="text-ink-500">Loading…</p></div>}>
      <ResultsContent />
    </Suspense>
  );
}
