'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { geocodeAddress, matchWaterSystem } from '@/lib/geo';
import { createUserCheck } from '@/lib/db';

export default function CheckWaterPage() {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [useZipFallback, setUseZipFallback] = useState(false);
  const [zip, setZip] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [checkId, setCheckId] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!consent) {
      setError('Please confirm you understand this is a likely match, not a tap test.');
      return;
    }

    const queryZip = useZipFallback ? zip.trim() : '';
    const queryAddress = useZipFallback ? '' : address.trim();

    if (useZipFallback && queryZip.length < 5) {
      setError('Please enter a 5-digit US ZIP code.');
      return;
    }

    if (!useZipFallback && queryAddress.length === 0) {
      setError('Please enter an address.');
      return;
    }

    setLoading(true);

    // Simulate async — run the actual geo/matching logic client-side
    setTimeout(() => {
      try {
        const lookup = useZipFallback ? queryZip : queryAddress;
        const geo = geocodeAddress(lookup);
        let pwsid: string | null = null;
        let waterSystem = null;

        if (geo && geo.lat !== null && geo.lng !== null) {
          waterSystem = matchWaterSystem(geo.lat, geo.lng);
          if (waterSystem) {
            pwsid = waterSystem.pwsid;
          }
        }

        const check = createUserCheck({
          address: useZipFallback ? `ZIP:${queryZip}` : queryAddress,
          zip: useZipFallback ? queryZip : null,
          latitude: geo?.lat ?? 0,
          longitude: geo?.lng ?? null,
          pwsid: pwsid,
          matchConfidence: waterSystem?.match_confidence ?? 'Low',
          boundarySource: waterSystem?.boundary_source ?? null,
          waterSystem: waterSystem,
        });

        setCheckId(check.id);
        setSubmitted(true);
        // The check is now persisted in sessionStorage (see store.ts), so it
        // survives the navigation to /results. router.push respects basePath.
        router.push(`/results?checkId=${encodeURIComponent(check.id)}`);
      } catch {
        setError('Something went wrong. Please try again.');
        setLoading(false);
      }
    }, 600);
  };

  if (submitted && checkId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="relative mx-auto mb-6 h-16 w-16">
          <div className="absolute inset-0 rounded-full border-2 border-brand-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-600" />
          <span className="absolute inset-0 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#12909f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </span>
        </div>
        <h1 className="text-2xl text-ink-900">Matching your water system…</h1>
        <p className="mt-2 text-ink-500">Grading the public data now. This only takes a moment.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 no-underline transition-colors hover:text-brand-700"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to home
      </Link>

      <div className="mt-8">
        <p className="eyebrow">Step 1 of 4 · Location</p>
        <h1 className="mt-2 text-3xl text-ink-900 sm:text-4xl">Check your water</h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-600">
          Enter your address to find your likely public water system and get a grade based on public data.
        </p>
      </div>

      <div className="surface-card mt-6 p-6 sm:p-7">
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2 rounded-lg border border-ember-200 bg-ember-50 p-3 text-sm text-ember-800"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Address vs ZIP toggle as a segmented control */}
          <div>
            <span className="mb-2 block text-sm font-semibold text-ink-800">Look up by</span>
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-ink-200 bg-ink-50 p-1" role="tablist" aria-label="Lookup method">
              <button
                type="button"
                role="tab"
                aria-selected={!useZipFallback}
                onClick={() => setUseZipFallback(false)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  !useZipFallback ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                Street address
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={useZipFallback}
                onClick={() => setUseZipFallback(true)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  useZipFallback ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                ZIP code
              </button>
            </div>
          </div>

          {!useZipFallback ? (
            <div>
              <label htmlFor="address" className="mb-1.5 block text-sm font-semibold text-ink-800">
                Street address
              </label>
              <input
                id="address"
                type="text"
                autoComplete="street-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, Nashville, TN"
                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-ink-900 placeholder:text-ink-300 transition-shadow focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
              />
              <p className="mt-1.5 text-xs text-ink-400">
                US addresses only. We use public EPA data to find your water system.
              </p>
            </div>
          ) : (
            <div>
              <label htmlFor="zip" className="mb-1.5 block text-sm font-semibold text-ink-800">
                ZIP code
              </label>
              <input
                id="zip"
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="37201"
                maxLength={5}
                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-lg tracking-[0.3em] text-ink-900 placeholder:tracking-normal placeholder:text-ink-300 transition-shadow focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
              />
              <p className="mt-1.5 text-xs text-ink-400">
                Try 37201 (Nashville) for a demo. A ZIP match is more general than an address match.
              </p>
            </div>
          )}

          <label
            htmlFor="consent"
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink-100 bg-ink-50/60 p-4 transition-colors hover:border-brand-200"
          >
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm leading-relaxed text-ink-600">
              I understand this creates a <strong className="text-ink-800">likely water-system match</strong>,
              not a household water test. The public data shown describes the system serving this area.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-base disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Checking…
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                Check my water
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mx-auto mt-6 max-w-md text-center text-xs leading-relaxed text-ink-400">
        ClearFlow uses public EPA and local utility data. A home test is recommended before making
        household-specific treatment decisions.
      </p>
    </div>
  );
}
