'use client';

import { useState, FormEvent, useEffect, useCallback } from 'react';

interface Lead {
  id: string;
  email: string;
  name: string;
  city_state: string;
  household_goal: string;
  created_at: string;
}

interface Stats {
  total_leads: number;
  match_failures: number;
  top_treatment_categories: Record<string, number>;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.authenticated && data.token) {
        setToken(data.token);
        setAuthenticated(true);
        setPassword('');
        setAuthError(null);
        // Load data immediately
        fetchData(data.token);
      } else {
        setAuthError(data.error || 'Authentication failed.');
        setToken(null);
        setAuthenticated(false);
      }
    } catch {
      setAuthError('Network error. Please try again.');
    }

    setLoading(false);
  };

  const fetchData = useCallback(async (tkn: string) => {
    setLoading(true);
    setError(null);
    try {
      const [leadsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/leads?token=${tkn}`),
        fetch(`/api/admin/stats?token=${tkn}`),
      ]);

      const [leadsData, statsData] = await Promise.all([leadsRes.json(), statsRes.json()]);

      if (leadsRes.ok) {
        setLeads(leadsData.leads || []);
      } else {
        setError(leadsData.error || 'Could not load leads.');
      }

      if (statsRes.ok) {
        setStats(statsData);
      }
    } catch {
      setError('Network error loading dashboard data.');
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    setToken(null);
    setAuthenticated(false);
    setLeads([]);
    setStats(null);
    setError(null);
  };

  // Render login screen
  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto py-12">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-brand-900 hover:text-brand-600 transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to home
        </a>

        <div className="bg-white rounded-xl border border-brand-100 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-brand-900 mb-2">Admin</h1>
          <p className="text-brand-700/70 text-sm mb-6">
            Password-protected dashboard for ClearFlow pilot leads and stats.
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {authError}
              </div>
            )}

            <div>
              <label htmlFor="adminPassword" className="block text-sm font-medium text-ink mb-1.5">
                Admin password
              </label>
              <input
                id="adminPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full px-4 py-2.5 border border-brand-200 rounded-lg bg-white text-ink placeholder:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition-shadow"
                placeholder="Enter admin password"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-2.5 px-4 bg-brand-900 hover:bg-brand-800 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-4 text-xs text-brand-600/60 leading-relaxed">
            Set the <code>ADMIN_PASSWORD</code> environment variable to enable admin access. Without it, the admin panel is disabled.
          </p>
        </div>
      </div>
    );
  }

  // Render dashboard
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-900">Admin dashboard</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-brand-700 hover:text-brand-900 underline underline-offset-2"
        >
          Sign out
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-brand-100 shadow-sm p-5">
          <dt className="text-xs text-brand-600/60 font-medium pb-1">Total leads</dt>
          <dd className="text-3xl font-bold text-brand-900">{stats?.total_leads ?? 0}</dd>
        </div>
        <div className="bg-white rounded-xl border border-brand-100 shadow-sm p-5">
          <dt className="text-xs text-brand-600/60 font-medium pb-1">Match failures</dt>
          <dd className="text-3xl font-bold text-brand-900">{stats?.match_failures ?? 0}</dd>
        </div>
        <div className="bg-white rounded-xl border border-brand-100 shadow-sm p-5">
          <dt className="text-xs text-brand-600/60 font-medium pb-1">Recommendations issued</dt>
          <dd className="text-3xl font-bold text-brand-900">
            {stats?.top_treatment_categories
              ? Object.values(stats.top_treatment_categories).reduce((a: number, b: number) => a + b, 0)
              : 0}
          </dd>
        </div>
      </div>

      {/* Match failures note */}
      {stats?.match_failures !== undefined && stats.match_failures > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800/80">
          <strong className="block mb-1">{stats.match_failures} match failure(s)</strong>
          These are address checks where we could not confidently match a public water system. They may indicate private wells, rural properties, or addresses outside mapped service areas.
        </div>
      )}

      {/* Top treatment categories */}
      {stats?.top_treatment_categories && Object.keys(stats.top_treatment_categories).length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-brand-900 mb-3">Top treatment categories</h2>
          <div className="bg-white rounded-xl border border-brand-100 shadow-sm divide-y divide-brand-100">
            {Object.entries(stats.top_treatment_categories)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => (
                <div key={category} className="px-5 py-3 flex items-center justify-between">
                  <span className="text-sm text-ink font-medium">{category}</span>
                  <span className="text-sm text-brand-600/60 bg-brand-50 px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Leads table */}
      <div>
        <h2 className="text-lg font-bold text-brand-900 mb-3">Leads</h2>
        {loading ? (
          <div className="text-center py-8 text-brand-700/60">
            <div className="inline-block w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-3" />
            Loading...
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
            {error}
          </div>
        ) : leads.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600 text-center">
            No leads yet.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-brand-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-brand-50 border-b border-brand-100">
                    <th className="text-left px-4 py-3 font-semibold text-brand-700/70 text-xs uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-brand-700/70 text-xs uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-brand-700/70 text-xs uppercase tracking-wider">
                      City, State
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-brand-700/70 text-xs uppercase tracking-wider">
                      Primary goal
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-brand-700/70 text-xs uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-brand-50/30 transition-colors">
                      <td className="px-4 py-3 text-ink max-w-[200px] truncate" title={lead.email}>
                        {lead.email}
                      </td>
                      <td className="px-4 py-3 text-ink">{lead.name}</td>
                      <td className="px-4 py-3 text-brand-700/80">{lead.city_state}</td>
                      <td className="px-4 py-3 text-brand-700/80">{lead.household_goal}</td>
                      <td className="px-4 py-3 text-brand-600/60 text-xs">
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-brand-600/60 text-center leading-relaxed">
        This dashboard is for ClearFlow pilot operations. Lead data is stored in-memory and is not backed by a persistent database in this MVP.
      </p>
    </div>
  );
}
