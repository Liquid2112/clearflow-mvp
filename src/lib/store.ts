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
  createdAt: string
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

function readJSON<T>(key: string): T | null {
  if (!isBrowser()) return null
  try {
    const raw = window.sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    // Malformed or inaccessible storage — degrade gracefully.
    return null
  }
}

function writeJSON(key: string, value: unknown): void {
  if (!isBrowser()) return
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage may be full or blocked (private mode) — fail silently.
  }
}

export function saveCheck(record: CheckRecord): CheckRecord {
  writeJSON(`${CHECK_PREFIX}${record.id}`, record)
  return record
}

export function getCheck(id: string): CheckRecord | null {
  if (!id) return null
  return readJSON<CheckRecord>(`${CHECK_PREFIX}${id}`)
}

export function saveRecommendation(record: RecommendationRecord): RecommendationRecord {
  writeJSON(`${REC_PREFIX}${record.id}`, record)
  return record
}

export function getRecommendation(id: string): RecommendationRecord | null {
  if (!id) return null
  return readJSON<RecommendationRecord>(`${REC_PREFIX}${id}`)
}
