'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import Link from 'next/link';
import { getLeads, getStats, type LeadRecord, type ClearFlowStats } from '@/lib/db';

// The admin password is compiled in at build time via NEXT_PUBLIC_ADMIN_PASSWORD.
// This is a demo lock only (a NEXT_PUBLIC_* value ships in the client bundle),
// which is appropriate for a static-export pilot with no server. Reading it at
// module scope keeps the build-time inlining explicit.
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? '';

// Human-readable labels for the internal treatment-category keys used by the
// recommendation engine.
const CATEGORY_LABELS: Record<string, string> = {
  test_kit: 'Test first (confirm before you commit)',
  pitcher: 'Carbon pitcher filter',
  faucet: 'Faucet-mount carbon filter',
  under_sink_carbon: 'Under-sink carbon filtration',
  under_sink_ro: 'Under-sink reverse osmosis',
  whole_house_carbon: 'Whole-home carbon filtration',
  whole_house_softener: 'Whole-home water softener',
  whole_house_ro: 'Whole-home reverse osmosis',
};

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-card p-5">
      <dt className="pb-1 text-xs font-semibold uppercase tracking-wider text-ink-400">{label}</dt>
      <dd className="font-display text-3xl font-bold text-ink-900 tabular-nums">{value}</dd>
    </div>
  );
}

export default function AdminPage() {
  const adminEnabled = ADMIN_PASSWORD.length > 0;

  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [stats, setStats] = useState<ClearFlowStats | null>(null);

  const loadData = useCallback(() => {
    setStats(getStats());
    // Newest first for the table.
    setLeads([...getLeads()].reverse());
  }, []);

  // When authenticated, refresh from the browser store on mount.
  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated, loadData]);

  const handleAuth = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPassword('');
    } else {
      setAuthError('Incorrect password.');
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setLeads([]);
    setStats(null);
  };

  const backLink = (
    <Link
      href="/"
      className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 no-underline transition-colors hover:text-brand-700"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Back to home
    </Link>
  );

  // Admin disabled — no password configured at build time. Never hang on a fetch.
  if (!adminEnabled) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        {backLink}
        <div className="surface-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink-100">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0d1b2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h1 className="text-2xl text-ink-900">Admin is disabled</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-500">
            No admin password is configured for this build. Set{' '}
            <code className="rounded bg-ink-100 px-1 py-0.5 text-xs text-ink-700">NEXT_PUBLIC_ADMIN_PASSWORD</code>{' '}
            before building to enable the pilot dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Login screen.
  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        {backLink}
        <div className="surface-card p-8">
          <p className="eyebrow mb-2">Pilot operations</p>
          <h1 className="text-2xl text-ink-900">Admin</h1>
          <p className="mb-6 mt-2 text-sm leading-relaxed text-ink-500">
            A client-side dashboard for ClearFlow pilot leads and activity held in this browser.
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            {authError && (
              <div role="alert" className="rounded-lg border border-ember-200 bg-ember-50 p-3 text-sm text-ember-800">
                {authError}
              </div>
            )}

            <div>
              <label htmlFor="adminPassword" className="mb-1.5 block text-sm font-semibold text-ink-800">
                Admin password
              </label>
              <input
                id="adminPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-ink-900 placeholder:text-ink-300 transition-shadow focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
                placeholder="Enter admin password"
              />
            </div>

            <button type="submit" disabled={!password} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
              Sign in
            </button>
          </form>

          <p className="mt-4 text-xs leading-relaxed text-ink-400">
            This gate uses a build-time <code className="rounded bg-ink-100 px-1 py-0.5 text-[0.7rem] text-ink-600">NEXT_PUBLIC_ADMIN_PASSWORD</code>{' '}
            and is a demo lock, not real security. All data shown is held in this browser only.
          </p>
        </div>
      </div>
    );
  }

  const topCategories = stats
    ? Object.entries(stats.topTreatmentCategories).sort((a, b) => b[1] - a[1])
    : [];

  // Dashboard.
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="eyebrow mb-1">Pilot operations</p>
          <h1 className="text-2xl text-ink-900 sm:text-3xl">Admin dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={loadData}
            className="text-sm font-medium text-ink-500 underline underline-offset-2 transition-colors hover:text-brand-700"
          >
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-ink-500 underline underline-offset-2 transition-colors hover:text-brand-700"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm leading-relaxed text-ink-600">
        This is demo/pilot data held in <strong>this browser only</strong> (localStorage). There is no
        server behind ClearFlow. Numbers reflect the checks, recommendations, and pilot signups made in this
        browser and clear if you clear site data.
      </div>

      {/* Stat cards */}
      <dl className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Checks run" value={stats?.totalChecks ?? 0} />
        <StatCard label="Recommendations" value={stats?.totalRecommendations ?? 0} />
        <StatCard label="Pilot leads" value={stats?.totalLeads ?? 0} />
        <StatCard label="Match failures" value={stats?.matchFailures ?? 0} />
      </dl>

      {/* Match failures note */}
      {stats && stats.matchFailures > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800/90">
          <strong className="mb-1 block">{stats.matchFailures} match failure(s)</strong>
          These are address checks where we could not confidently match a public water system. They may
          indicate private wells, rural properties, or addresses outside mapped service areas.
        </div>
      )}

      {/* Top treatment categories */}
      {topCategories.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-ink-900">Top treatment categories</h2>
          <div className="surface-card divide-y divide-ink-100">
            {topCategories.map(([category, count]) => (
              <div key={category} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm font-medium text-ink-800">
                  {CATEGORY_LABELS[category] ?? category}
                </span>
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-brand-700">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leads table */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-ink-900">Pilot leads</h2>
        {leads.length === 0 ? (
          <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-6 text-center text-sm text-ink-500">
            No pilot leads yet in this browser. Complete a check and join the pilot on the plan page to see
            one appear here.
          </div>
        ) : (
          <div className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50/70">
                    {['Email', 'Name', 'City, State', 'Primary goal', 'Joined'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="transition-colors hover:bg-brand-50/40">
                      <td className="max-w-[200px] truncate px-4 py-3 text-ink-800" title={lead.email}>
                        {lead.email}
                      </td>
                      <td className="px-4 py-3 text-ink-800">{lead.name}</td>
                      <td className="px-4 py-3 text-ink-600">{lead.city_state}</td>
                      <td className="px-4 py-3 text-ink-600">{lead.household_goal}</td>
                      <td className="px-4 py-3 text-xs text-ink-400">{formatDate(lead.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <p className="mx-auto mt-8 max-w-lg text-center text-xs leading-relaxed text-ink-400">
        ClearFlow pilot operations. Lead and activity data live in your browser for this demo and are not
        backed by a server or shared with anyone.
      </p>
    </div>
  );
}
