/**
 * Client-side persistence layer for ClearFlow.
 *
 * The app is deployed as a static export (output: 'export') to GitHub Pages,
 * so there is NO server at runtime — no API routes, no server actions. The
 * core flow (check-water -> results -> quiz -> plan) navigates with full-page
 * reloads, which wipe any in-memory state. To keep records available across
 * those navigations within the same tab session, we persist them to
 * sessionStorage, keyed by id.
 *
 * All reads/writes are guarded for SSR (typeof window !== 'undefined') so the
 * static prerender does not crash, and JSON parsing is wrapped so malformed or
 * tampered values degrade gracefully to null.
 */

import { WaterSystem } from '@/lib/geo'

const CHECK_PREFIX = 'clearflow:check:'
const REC_PREFIX = 'clearflow:rec:'

// Leads and aggregate activity counters live in localStorage rather than
// sessionStorage so the admin dashboard (a separate route/tab) can read what a
// user actually did during the demo. There is no server under static export,
// so this browser store is the only "database" the pilot has.
const LEADS_KEY = 'clearflow:leads'
const ACTIVITY_KEY = 'clearflow:activity'

export interface CheckRecord {
  id: string
  addressHash: string
  zip: string | null
  latitude: number
  longitude: number | null
  pwsid: string | null
  matchConfidence: string
  boundarySource: string | null
  waterSystem: WaterSystem | null
  createdAt: string
}

export interface RecommendationRecord {
  id: string
  checkId: string
  treatment_category: string
  rationale: string
  public_data_limitations: string[]
  home_test_recommended: boolean
  estimated_cost_range: string
  test_kit_suggested: boolean
  // Snapshot of the water grade at recommendation time, so the plan page can
  // reference the user's grade and show a projected improvement without
  // needing to re-match the system. Optional for backward compatibility.
  grade?: {
    score: number
    letter: string
    drivers: string[]
    gradable: boolean
  } | null
  createdAt: string
}

type StorageKind = 'session' | 'local'

function getStorage(kind: StorageKind): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    const store = kind === 'local' ? window.localStorage : window.sessionStorage
    return typeof store !== 'undefined' ? store : null
  } catch {
    // Accessing storage can throw in some privacy modes.
    return null
  }
}

function readJSON<T>(key: string, kind: StorageKind = 'session'): T | null {
  const store = getStorage(kind)
  if (!store) return null
  try {
    const raw = store.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    // Malformed or inaccessible storage — degrade gracefully.
    return null
  }
}

function writeJSON(key: string, value: unknown, kind: StorageKind = 'session'): void {
  const store = getStorage(kind)
  if (!store) return
  try {
    store.setItem(key, JSON.stringify(value))
  } catch {
    // Storage may be full or blocked (private mode) — fail silently.
  }
}

export function saveCheck(record: CheckRecord): CheckRecord {
  writeJSON(`${CHECK_PREFIX}${record.id}`, record)
  // Track aggregate activity for the admin dashboard. A check counts as a
  // "match failure" when we could not confidently tie it to a public system
  // (no PWSID, or an explicitly Low confidence match).
  const matchFailed =
    !record.pwsid || String(record.matchConfidence).toLowerCase() === 'low'
  recordActivity((a) => {
    a.checks += 1
    if (matchFailed) a.matchFailures += 1
  })
  return record
}

export function getCheck(id: string): CheckRecord | null {
  if (!id) return null
  return readJSON<CheckRecord>(`${CHECK_PREFIX}${id}`)
}

export function saveRecommendation(record: RecommendationRecord): RecommendationRecord {
  writeJSON(`${REC_PREFIX}${record.id}`, record)
  recordActivity((a) => {
    a.recommendations += 1
    const cat = record.treatment_category
    if (cat) {
      a.categoryCounts[cat] = (a.categoryCounts[cat] ?? 0) + 1
    }
  })
  return record
}

export function getRecommendation(id: string): RecommendationRecord | null {
  if (!id) return null
  return readJSON<RecommendationRecord>(`${REC_PREFIX}${id}`)
}

// ---------------------------------------------------------------------------
// Leads + aggregate activity (localStorage, shared across routes/tabs)
// ---------------------------------------------------------------------------

export interface LeadRecord {
  id: string
  email: string
  name: string
  city_state: string
  household_goal: string
  phone: string | null
  consent_timestamp: string
  createdAt: string
}

interface ActivityCounters {
  checks: number
  recommendations: number
  matchFailures: number
  categoryCounts: Record<string, number>
}

export interface ClearFlowStats {
  totalChecks: number
  totalRecommendations: number
  totalLeads: number
  matchFailures: number
  /** Treatment category -> count, from recommendations issued this browser. */
  topTreatmentCategories: Record<string, number>
}

function emptyActivity(): ActivityCounters {
  return { checks: 0, recommendations: 0, matchFailures: 0, categoryCounts: {} }
}

function readActivity(): ActivityCounters {
  const raw = readJSON<Partial<ActivityCounters>>(ACTIVITY_KEY, 'local')
  if (!raw) return emptyActivity()
  return {
    checks: typeof raw.checks === 'number' ? raw.checks : 0,
    recommendations: typeof raw.recommendations === 'number' ? raw.recommendations : 0,
    matchFailures: typeof raw.matchFailures === 'number' ? raw.matchFailures : 0,
    categoryCounts:
      raw.categoryCounts && typeof raw.categoryCounts === 'object' ? raw.categoryCounts : {},
  }
}

function recordActivity(mutate: (a: ActivityCounters) => void): void {
  const activity = readActivity()
  mutate(activity)
  writeJSON(ACTIVITY_KEY, activity, 'local')
}

export function saveLead(record: LeadRecord): LeadRecord {
  const leads = getLeads()
  leads.push(record)
  writeJSON(LEADS_KEY, leads, 'local')
  return record
}

export function getLeads(): LeadRecord[] {
  const leads = readJSON<LeadRecord[]>(LEADS_KEY, 'local')
  return Array.isArray(leads) ? leads : []
}

export function getStats(): ClearFlowStats {
  const activity = readActivity()
  return {
    totalChecks: activity.checks,
    totalRecommendations: activity.recommendations,
    totalLeads: getLeads().length,
    matchFailures: activity.matchFailures,
    topTreatmentCategories: activity.categoryCounts,
  }
}
