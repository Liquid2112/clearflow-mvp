'use client';

import { useState, FormEvent } from 'react';
import { geocodeAddress, matchWaterSystem } from '@/lib/geo';
import { fetchComplianceData } from '@/lib/epa';
import { createUserCheck, getUserCheck } from '@/lib/db';

export default function CheckWaterPage() {
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
      setError('You must check the consent box to continue.');
      return;
    }

    const queryZip = useZipFallback ? zip.trim() : '';
    const queryAddress = useZipFallback ? '' : address.trim();

    if (useZipFallback && queryZip.length === 0) {
      setError('Please enter a ZIP code.');
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
      } catch {
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  if (submitted && checkId) {
    // Build results URL — use window.location for client-side routing on static deploy
    const params = new URLSearchParams(window.location.search);
    params.set('checkId', checkId);
    window.location.search = params.toString();
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="inline-block w-10 h-10 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
        <p className="text-brand-700/60">Redirecting to results...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <a
        href="/"
        className="inline-flex items-center gap-1.5 text-brand-900 mb-8 hover:text-brand-600 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to home
      </a>

      <div className="mb-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-900">Check your water</h1>
        <p className="mt-2 text-lg text-brand-800/70">
          Enter your address to find your likely public water system and what public data says about it.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-brand-100 shadow-sm p-6 mt-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-3 p-4 bg-brand-50 rounded-lg border border-brand-100">
            <input
              type="checkbox"
              id="zipFallback"
              checked={useZipFallback}
              onChange={(e) => setUseZipFallback(e.target.checked)}
              className="h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="zipFallback" className="text-sm font-medium text-brand-900 cursor-pointer select-none">
              Use ZIP code instead of address <span className="text-brand-600/60 ml-1">(US only)</span>
            </label>
          </div>

          {!useZipFallback && (
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-ink mb-1.5">
                Street address
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, State"
                className="w-full px-4 py-2.5 border border-brand-200 rounded-lg bg-white text-ink placeholder:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-shadow"
              />
              <p className="mt-1.5 text-xs text-brand-600/60">
                US addresses only. We use public EPA data to find your water system.
              </p>
            </div>
          )}

          {useZipFallback && (
            <div>
              <label htmlFor="zip" className="block text-sm font-semibold text-ink mb-1.5">
                ZIP code
              </label>
              <input
                id="zip"
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="37201"
                maxLength={5}
                className="w-full px-4 py-2.5 border border-brand-200 rounded-lg bg-white text-ink placeholder:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-shadow"
              />
              <p className="mt-1.5 text-xs text-brand-600/60">
                Enter a US ZIP code. Results are more general than an address match.
              </p>
            </div>
          )}

          <div className="pt-2 border-t border-brand-100">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="consent" className="ml-2 text-sm text-brand-800/80 cursor-pointer select-none leading-relaxed">
              I understand this creates a <strong>likely water-system match</strong>, not a household water test.
              The public data shown is about the water system serving this area — not a test of my specific water.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-brand-900 hover:bg-brand-800 text-white rounded-lg font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Checking...
              </span>
            ) : (
              'Check My Water'
            )}
          </button>
        </form>
      </div>

      <p className="mt-6 text-xs text-brand-600/60 text-center leading-relaxed">
        ClearFlow uses public EPA and local utility data. A home test is recommended before making household-specific treatment decisions.
      </p>
    </div>
  );
}
