'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

function PlanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const recommendationId = searchParams.get('recommendationId');

  const [rec, setRec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lead form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    city_state: '',
    household_goal: '',
    phone: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!recommendationId) {
      setError('No recommendation ID found. Please start from the home page.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/plan?recommendationId=${recommendationId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.id && !d.recommendationId) {
          setError(d.error || 'Recommendation not found.');
        } else {
          setRec(d);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load recommendation. Please try again.');
        setLoading(false);
      });
  }, [recommendationId]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    setFormSuccess(false);

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          phone: form.phone || null,
          consent_timestamp: new Date().toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Something went wrong.');
        setFormLoading(false);
        return;
      }

      setFormSuccess(true);
      setFormLoading(false);
    } catch {
      setFormError('Network error. Please try again.');
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="inline-block w-10 h-10 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
        <p className="text-brand-700/60">Loading your recommendation...</p>
      </div>
    );
  }

  if (error || !rec) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-ink mb-2">Could not load recommendation</h2>
        <p className="text-brand-700/70 mb-6">{error || 'Something went wrong.'}</p>
        <a
          href="/how-it-works"
          className="inline-block px-6 py-2.5 bg-brand-900 hover:bg-brand-800 text-white rounded-lg font-semibold transition-colors"
        >
          How it works
        </a>
      </div>
    );
  }

  // Map internal category keys to display labels and colors
  const categoryDisplayMap: Record<string, { label: string; color: string }> = {
    test_kit: { label: 'Test First — Confirm Before You Commit', color: 'from-sky-500 to-blue-600' },
    pitcher: { label: 'Carbon Pitcher Filter', color: 'from-teal-500 to-cyan-600' },
    faucet: { label: 'Faucet-Mount Carbon Filter', color: 'from-teal-500 to-cyan-600' },
    under_sink_carbon: { label: 'Under-Sink Carbon Filtration', color: 'from-teal-500 to-cyan-600' },
    under_sink_ro: { label: 'Under-Sink Reverse Osmosis', color: 'from-indigo-500 to-blue-600' },
    whole_house_carbon: { label: 'Whole-Home Carbon Filtration', color: 'from-cyan-500 to-blue-600' },
    whole_house_softener: { label: 'Whole-Home Water Softener', color: 'from-violet-500 to-purple-600' },
    whole_house_ro: { label: 'Whole-Home Reverse Osmosis', color: 'from-indigo-500 to-blue-600' },
  }

  const catInfo = categoryDisplayMap[rec.treatment_category] || {
    label: rec.treatment_category,
    color: 'from-slate-600 to-slate-700',
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Back */}
      <a
        href="/how-it-works"
        className="inline-flex items-center gap-1.5 text-brand-900 hover:text-brand-600 transition-colors mb-6"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        How it works
      </a>

      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-brand-600/60 font-medium mb-1">Your personalized recommendation</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-900">
          Your recommended next step
        </h1>
      </div>

      {/* Recommendation card */}
      <div className={`bg-gradient-to-br ${catInfo.color} rounded-xl p-6 text-white shadow-lg mb-6`}>
        <h2 className="text-xl sm:text-2xl font-bold mb-3">{catInfo.label}</h2>
        <p className="text-white/90 text-base leading-relaxed">{rec.rationale}</p>
      </div>

      {/* What this solves */}
      <div className="bg-white rounded-xl border border-brand-100 shadow-sm p-6 mb-6">
        <h3 className="font-bold text-brand-900 mb-3 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0c4a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          What this solves
        </h3>
        <p className="text-brand-700/80 text-sm leading-relaxed">
          Based on what you told us matters most, this recommendation targets the concern you described using the public data we matched to your address and your quiz answers.
        </p>
      </div>

      {/* What it does not confirm */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
        <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          What this does not confirm
        </h3>
        <ul className="space-y-2">
          {rec.public_data_limitations.map((lim: string, i: number) => (
            <li key={i} className="flex gap-2 text-sm text-amber-800/85">
              <span className="text-amber-500 flex-shrink-0 mt-0.5">—</span>
              <span>{lim}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Estimated cost */}
      <div className="bg-brand-50 rounded-xl border border-brand-100 p-6 mb-6">
        <h3 className="font-bold text-brand-900 mb-2 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0c4a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
          Estimated first-year cost range
        </h3>
        <p className="text-brand-800/80 text-sm">
          {rec.estimated_cost_range}
          <span className="text-brand-600/50 ml-1">(not a guaranteed price — varies by home, region, and installer)</span>
        </p>
      </div>

      {/* Test kit suggestion */}
      {rec.test_kit_suggested && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-6 mb-6">
          <div className="flex gap-3 items-start">
            <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sky-900 mb-1">Home test recommended</h3>
              <p className="text-sky-800/80 text-sm leading-relaxed">
                Because public data cannot confirm what is in the water at your specific tap, we suggest a certified home water test before purchasing treatment equipment. Testing first keeps you from spending on equipment you may not need.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Join CTA */}
      <div className="bg-brand-900 rounded-xl p-6 text-white mb-6">
        {!showForm ? (
          <>
            <h3 className="text-lg font-bold mb-2">Join the ClearFlow pilot</h3>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              We are running a small pilot to improve these recommendations. Join to get your recommendation saved, follow-up guidance, and priority access to future features.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 px-5 bg-white hover:bg-brand-100 text-brand-900 rounded-lg font-semibold transition-colors"
            >
              Join the ClearFlow pilot
            </button>
          </>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <h3 className="text-lg font-bold mb-1">Join the ClearFlow pilot</h3>
            <p className="text-white/70 text-sm">A few details so we can follow up with your recommendation.</p>

            {formError && (
              <div className="p-3 bg-red-500/20 border border-red-400/40 rounded-lg text-red-200 text-sm">
                {formError}
              </div>
            )}

            {formSuccess ? (
              <div className="p-4 bg-green-500/20 border border-green-400/40 rounded-lg text-green-200 text-sm">
                <strong>You are in!</strong> We saved your recommendation and will follow up at the email you provided.
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Full name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">City, State</label>
                  <input
                    type="text"
                    required
                    value={form.city_state}
                    onChange={(e) => setForm((f) => ({ ...f, city_state: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
                    placeholder="Nashville, TN"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Primary household goal</label>
                  <select
                    required
                    value={form.household_goal}
                    onChange={(e) => setForm((f) => ({ ...f, household_goal: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                  >
                    <option value="" disabled className="bg-brand-900">Select one</option>
                    <option value="Improve taste/odor" className="bg-brand-900">Improve taste/odor</option>
                    <option value="Reduce chlorine" className="bg-brand-900">Reduce chlorine</option>
                    <option value="Address hardness/scale" className="bg-brand-900">Address hardness/scale</option>
                    <option value="Lead concern" className="bg-brand-900">Lead concern</option>
                    <option value="Skin/hair concerns" className="bg-brand-900">Skin/hair concerns</option>
                    <option value="General water quality peace of mind" className="bg-brand-900">General water quality peace of mind</option>
                    <option value="Other" className="bg-brand-900">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">Phone (optional)</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40"
                    placeholder="(555) 555-5555"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-3 px-5 bg-white hover:bg-brand-100 text-brand-900 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {formLoading ? 'Submitting...' : 'Join the pilot'}
                </button>
              </>
            )}
          </form>
        )}
      </div>

      {/* Disclosure */}
      <div className="p-4 bg-brand-50 rounded-lg border border-brand-100">
        <p className="text-xs text-brand-800/70 leading-relaxed">
          <strong>This is a personalized recommendation, not a water test.</strong> ClearFlow uses public EPA and local utility data matched to your address, plus your quiz answers, to suggest a starting point. A household water test is recommended before making treatment decisions.
        </p>
      </div>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="max-w-xl mx-auto text-center py-16"><p className="text-brand-700/60">Loading...</p></div>}>
      <PlanContent />
    </Suspense>
  );
}
