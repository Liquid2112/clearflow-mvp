'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getUserRecommendation, getUserCheck, createLead } from '@/lib/db';
import { fetchComplianceData } from '@/lib/epa';
import { computeWaterGrade, projectGradeWithPlan, type WaterGrade } from '@/lib/grade';

function chipColors(score: number): { bg: string; ring: string; text: string } {
  if (score >= 70) return { bg: 'bg-green-50', ring: 'border-green-200', text: 'text-green-700' };
  if (score >= 60) return { bg: 'bg-amber-50', ring: 'border-amber-200', text: 'text-amber-700' };
  return { bg: 'bg-ember-50', ring: 'border-ember-200', text: 'text-ember-800' };
}

function GradeChip({ label, score, letter, muted }: { label: string; score: number; letter: string; muted?: boolean }) {
  const c = chipColors(score);
  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 ${muted ? 'border-ink-200 bg-ink-50' : `${c.bg} ${c.ring}`}`}
      >
        <span className={`font-display text-3xl font-bold leading-none ${muted ? 'text-ink-400' : c.text}`}>{letter}</span>
        <span className={`mt-0.5 text-xs font-semibold tabular-nums ${muted ? 'text-ink-400' : c.text}`}>{score}/100</span>
      </div>
      <span className="mt-2 text-xs font-semibold text-ink-500">{label}</span>
    </div>
  );
}

function PlanContent() {
  const searchParams = useSearchParams();
  const recommendationId = searchParams.get('recommendationId');

  const [rec, setRec] = useState<any>(null);
  const [grade, setGrade] = useState<WaterGrade | null>(null);
  const [projected, setProjected] = useState<WaterGrade | null>(null);
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

    // Use in-memory store (works for demo on static deploy)
    const recommendation = getUserRecommendation(recommendationId);
    if (!recommendation) {
      setError('Recommendation not found. Please try again.');
      setLoading(false);
      return;
    }

    setRec(recommendation);

    // Re-derive the full water grade deterministically from the matched
    // system's public data, then project how this plan could improve it. This
    // reinforces the "iterate on your grade" loop. The projection is a
    // clearly-labeled estimate, not a measured result.
    const check = getUserCheck(recommendation.checkId);
    const compliance = check?.pwsid ? fetchComplianceData(check.pwsid) : null;
    const current = computeWaterGrade(compliance);
    if (current.gradable) {
      setGrade(current);
      setProjected(projectGradeWithPlan(current, recommendation.treatment_category));
    }

    setLoading(false);
  }, [recommendationId]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    setFormSuccess(false);

    // Persist the lead to the client-side store (localStorage) so the admin
    // dashboard can see it later in this browser. There is no server under the
    // static export, so this browser store is the pilot's only "database".
    setTimeout(() => {
      if (!form.name || !form.email || !form.city_state || !form.household_goal) {
        setFormError('Please fill in all required fields.');
        setFormLoading(false);
        return;
      }
      createLead({
        name: form.name.trim(),
        email: form.email.trim(),
        city_state: form.city_state.trim(),
        household_goal: form.household_goal,
        phone: form.phone.trim() || null,
        consent_timestamp: new Date().toISOString(),
      });
      setFormSuccess(true);
      setFormLoading(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="relative mx-auto mb-5 h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-brand-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-600" />
        </div>
        <p className="text-ink-500">Building your recommendation…</p>
      </div>
    );
  }

  if (error || !rec) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ember-100">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-2xl text-ink-900">We could not load your recommendation</h1>
        <p className="mx-auto mt-2 max-w-sm text-ink-500">{error || 'Something went wrong.'}</p>
        <Link href="/check-water" className="btn-primary mt-6">Start a new check</Link>
      </div>
    );
  }

  // Map internal category keys to display labels and colors
  const categoryDisplayMap: Record<string, { label: string; color: string }> = {
    test_kit: { label: 'Test first — confirm before you commit', color: 'from-ember-500 to-ember-700' },
    pitcher: { label: 'Carbon pitcher filter', color: 'from-brand-500 to-brand-700' },
    faucet: { label: 'Faucet-mount carbon filter', color: 'from-brand-500 to-brand-700' },
    under_sink_carbon: { label: 'Under-sink carbon filtration', color: 'from-brand-600 to-brand-800' },
    under_sink_ro: { label: 'Under-sink reverse osmosis', color: 'from-brand-700 to-ink-800' },
    whole_house_carbon: { label: 'Whole-home carbon filtration', color: 'from-brand-600 to-ink-800' },
    whole_house_softener: { label: 'Whole-home water softener', color: 'from-ink-700 to-ink-900' },
    whole_house_ro: { label: 'Whole-home reverse osmosis', color: 'from-brand-700 to-ink-900' },
  };

  const catInfo = categoryDisplayMap[rec.treatment_category] || {
    label: rec.treatment_category,
    color: 'from-ink-700 to-ink-900',
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      {/* Back */}
      <Link
        href="/how-it-works"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 no-underline transition-colors hover:text-brand-700"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        How it works
      </Link>

      {/* Header */}
      <div className="mt-6 mb-6">
        <p className="eyebrow">Step 4 of 4 · Your plan</p>
        <h1 className="mt-2 text-3xl text-ink-900 sm:text-4xl">Your recommended next step</h1>
        {grade && (
          <p className="mt-3 text-base leading-relaxed text-ink-600">
            Your water scored <strong className="text-ink-900">{grade.score} ({grade.letter})</strong>. Here
            is how to push it higher.
          </p>
        )}
      </div>

      {/* Grade + projected improvement */}
      {grade && projected && (
        <div className="surface-card mb-6 p-6">
          <p className="eyebrow mb-4">How your grade could improve with this plan</p>
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <GradeChip label="Today" score={grade.score} letter={grade.letter} muted />
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#12909f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <GradeChip label="With this plan" score={projected.score} letter={projected.letter} />
          </div>
          <p className="mt-4 text-center text-xs leading-relaxed text-ink-400">
            {projected.score > grade.score
              ? `Estimated improvement of about ${projected.score - grade.score} points.`
              : 'Testing first does not change your water, so your grade holds until you treat it.'}
            {' '}This is a deterministic estimate based on the typical effect of this treatment, not a measured
            result. Re-test after installing to confirm.
          </p>
        </div>
      )}

      {/* Recommendation card */}
      <div className={`mb-6 rounded-2xl bg-gradient-to-br ${catInfo.color} p-6 text-white shadow-lift`}>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">Recommended</p>
        <h2 className="mt-1 text-2xl text-white">{catInfo.label}</h2>
        <p className="mt-3 leading-relaxed text-white/90">{rec.rationale}</p>
      </div>

      {/* What this solves */}
      <div className="surface-card mb-6 p-6">
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink-900">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f7181" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
          </svg>
          What this solves
        </h3>
        <p className="text-sm leading-relaxed text-ink-600">
          Based on what you told us matters most, this recommendation targets the concern you described using
          the public data we matched to your address and your quiz answers.
        </p>
      </div>

      {/* What it does not confirm */}
      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-amber-800">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          What this does not confirm
        </h3>
        <ul className="space-y-2">
          {rec.public_data_limitations.map((lim: string, i: number) => (
            <li key={i} className="flex gap-2 text-sm text-amber-800/90">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
              <span>{lim}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Estimated cost */}
      <div className="mb-6 rounded-2xl border border-ink-100 bg-ink-50/60 p-6">
        <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-ink-900">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f7181" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
          Estimated first-year cost range
        </h3>
        <p className="text-sm text-ink-700">
          {rec.estimated_cost_range}
          <span className="ml-1 text-ink-400">(not a guaranteed price — varies by home, region, and installer)</span>
        </p>
      </div>

      {/* Test kit suggestion */}
      {rec.test_kit_suggested && (
        <div className="mb-6 rounded-2xl border border-brand-200 bg-brand-50 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f7181" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <div>
              <h3 className="mb-1 text-base font-semibold text-brand-900">Home test recommended</h3>
              <p className="text-sm leading-relaxed text-ink-600">
                Because public data cannot confirm what is in the water at your specific tap, we suggest a
                certified home water test before purchasing treatment equipment. Testing first keeps you from
                spending on equipment you may not need.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Join CTA */}
      <div className="mb-6 rounded-2xl bg-ink-900 p-6 text-white shadow-lift">
        {!showForm ? (
          <>
            <h3 className="text-lg font-semibold text-white">Join the ClearFlow pilot</h3>
            <p className="mb-4 mt-2 text-sm leading-relaxed text-white/80">
              We are running a small pilot to improve these recommendations. Join to get your recommendation
              saved, follow-up guidance, and priority access to future features.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="w-full rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-400 active:translate-y-px"
            >
              Join the ClearFlow pilot
            </button>
          </>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Join the ClearFlow pilot</h3>
            <p className="text-sm text-white/70">A few details so we can follow up with your recommendation.</p>

            {formError && (
              <div role="alert" className="rounded-lg border border-ember-400/40 bg-ember-500/20 p-3 text-sm text-ember-100">
                {formError}
              </div>
            )}

            {formSuccess ? (
              <div className="rounded-lg border border-green-400/40 bg-green-500/20 p-4 text-sm text-green-100">
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
                  className="w-full rounded-xl bg-brand-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-400 active:translate-y-px disabled:opacity-50"
                >
                  {formLoading ? 'Submitting…' : 'Join the pilot'}
                </button>
              </>
            )}
          </form>
        )}
      </div>

      {/* Disclosure */}
      <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
        <p className="text-xs leading-relaxed text-ink-500">
          <strong className="text-ink-700">This is a personalized recommendation, not a water test.</strong> ClearFlow
          uses public EPA and local utility data matched to your address, plus your quiz answers, to suggest a
          starting point. A household water test is recommended before making treatment decisions.
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
