import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getCheck,
  getLeads,
  getRecommendation,
  getStats,
  saveCheck,
  saveLead,
  saveRecommendation,
  type CheckRecord,
  type LeadRecord,
  type RecommendationRecord,
} from '@/lib/store'

/**
 * The store reads/writes window.sessionStorage + window.localStorage and is
 * SSR-guarded (typeof window === 'undefined' -> no-op / null). Vitest runs in
 * the `node` environment (see vitest.config.ts) where `window` is undefined, so
 * we install a small in-memory Storage double on globalThis per test instead of
 * pulling in jsdom. This keeps the existing 18 grade/recommendation tests
 * untouched while letting us exercise the guarded read/write paths directly.
 */

class MemoryStorage {
  private map = new Map<string, string>()
  get length(): number {
    return this.map.size
  }
  clear(): void {
    this.map.clear()
  }
  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null
  }
  setItem(key: string, value: string): void {
    this.map.set(key, String(value))
  }
  removeItem(key: string): void {
    this.map.delete(key)
  }
  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null
  }
  // Test-only escape hatch to seed raw (possibly malformed) values.
  __setRaw(key: string, value: string): void {
    this.map.set(key, value)
  }
}

let localStorage: MemoryStorage
let sessionStorage: MemoryStorage

function installWindow(): void {
  localStorage = new MemoryStorage()
  sessionStorage = new MemoryStorage()
  ;(globalThis as any).window = { localStorage, sessionStorage }
}

function removeWindow(): void {
  delete (globalThis as any).window
}

function makeCheck(overrides: Partial<CheckRecord> = {}): CheckRecord {
  return {
    id: 'check_abc',
    addressHash: 'hash123',
    zip: '37201',
    latitude: 36.16,
    longitude: -86.78,
    pwsid: 'TNPW0001234',
    matchConfidence: 'High',
    boundarySource: 'bundled',
    waterSystem: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeRecommendation(
  overrides: Partial<RecommendationRecord> = {}
): RecommendationRecord {
  return {
    id: 'rec_abc',
    checkId: 'check_abc',
    treatment_category: 'under_sink_carbon',
    rationale: 'Because.',
    public_data_limitations: ['no tap-level data'],
    home_test_recommended: true,
    estimated_cost_range: '$100-$300',
    test_kit_suggested: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeLead(overrides: Partial<LeadRecord> = {}): LeadRecord {
  return {
    id: 'lead_abc',
    email: 'jane@example.com',
    name: 'Jane Doe',
    city_state: 'Nashville, TN',
    household_goal: 'Reduce chlorine',
    phone: null,
    consent_timestamp: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('store (with browser storage available)', () => {
  beforeEach(() => {
    installWindow()
  })
  afterEach(() => {
    removeWindow()
    vi.restoreAllMocks()
  })

  it('round-trips a check record through sessionStorage', () => {
    const record = makeCheck()
    const saved = saveCheck(record)
    expect(saved).toEqual(record)

    const loaded = getCheck(record.id)
    expect(loaded).toEqual(record)
  })

  it('round-trips a recommendation record through sessionStorage', () => {
    const record = makeRecommendation()
    const saved = saveRecommendation(record)
    expect(saved).toEqual(record)

    const loaded = getRecommendation(record.id)
    expect(loaded).toEqual(record)
  })

  it('returns null for unknown check and recommendation ids', () => {
    expect(getCheck('does_not_exist')).toBeNull()
    expect(getRecommendation('does_not_exist')).toBeNull()
  })

  it('returns null for empty ids without touching storage', () => {
    const spy = vi.spyOn(sessionStorage, 'getItem')
    expect(getCheck('')).toBeNull()
    expect(getRecommendation('')).toBeNull()
    expect(spy).not.toHaveBeenCalled()
  })

  it('degrades to null when stored JSON is malformed (does not throw)', () => {
    sessionStorage.__setRaw('clearflow:check:check_abc', '{ not valid json ')
    expect(() => getCheck('check_abc')).not.toThrow()
    expect(getCheck('check_abc')).toBeNull()
  })

  it('degrades to null when reading throws (privacy-mode style failure)', () => {
    saveCheck(makeCheck())
    vi.spyOn(sessionStorage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    expect(() => getCheck('check_abc')).not.toThrow()
    expect(getCheck('check_abc')).toBeNull()
  })

  it('increments a match failure when a check has no pwsid', () => {
    saveCheck(makeCheck({ pwsid: null }))
    const stats = getStats()
    expect(stats.totalChecks).toBe(1)
    expect(stats.matchFailures).toBe(1)
  })

  it('increments a match failure when match confidence is Low', () => {
    saveCheck(makeCheck({ matchConfidence: 'Low' }))
    const stats = getStats()
    expect(stats.totalChecks).toBe(1)
    expect(stats.matchFailures).toBe(1)
  })

  it('does not count a match failure for a confident, matched check', () => {
    saveCheck(makeCheck({ pwsid: 'TNPW0001234', matchConfidence: 'High' }))
    const stats = getStats()
    expect(stats.totalChecks).toBe(1)
    expect(stats.matchFailures).toBe(0)
  })

  it('accumulates check counts and match failures across saves', () => {
    saveCheck(makeCheck({ id: 'c1', matchConfidence: 'High', pwsid: 'X' }))
    saveCheck(makeCheck({ id: 'c2', pwsid: null }))
    saveCheck(makeCheck({ id: 'c3', matchConfidence: 'Low' }))
    const stats = getStats()
    expect(stats.totalChecks).toBe(3)
    expect(stats.matchFailures).toBe(2)
  })

  it('tracks recommendation counts and top treatment categories', () => {
    saveRecommendation(makeRecommendation({ id: 'r1', treatment_category: 'under_sink_carbon' }))
    saveRecommendation(makeRecommendation({ id: 'r2', treatment_category: 'under_sink_carbon' }))
    saveRecommendation(makeRecommendation({ id: 'r3', treatment_category: 'whole_house_softener' }))
    const stats = getStats()
    expect(stats.totalRecommendations).toBe(3)
    expect(stats.topTreatmentCategories.under_sink_carbon).toBe(2)
    expect(stats.topTreatmentCategories.whole_house_softener).toBe(1)
  })

  it('round-trips leads through localStorage and reflects them in stats', () => {
    saveLead(makeLead({ id: 'l1', email: 'a@example.com' }))
    saveLead(makeLead({ id: 'l2', email: 'b@example.com' }))
    const leads = getLeads()
    expect(leads).toHaveLength(2)
    expect(leads.map((l) => l.email)).toEqual(['a@example.com', 'b@example.com'])
    expect(getStats().totalLeads).toBe(2)
  })

  it('returns an empty leads array when the stored value is malformed', () => {
    localStorage.__setRaw('clearflow:leads', 'not-an-array')
    expect(getLeads()).toEqual([])
  })

  it('starts from a zeroed, empty stats snapshot', () => {
    const stats = getStats()
    expect(stats).toEqual({
      totalChecks: 0,
      totalRecommendations: 0,
      totalLeads: 0,
      matchFailures: 0,
      topTreatmentCategories: {},
    })
  })

  it('recovers zeroed activity counters when the activity blob is malformed', () => {
    localStorage.__setRaw('clearflow:activity', '<<garbage>>')
    // A save on top of malformed activity should not throw and should reset.
    expect(() => saveCheck(makeCheck({ pwsid: null }))).not.toThrow()
    const stats = getStats()
    expect(stats.totalChecks).toBe(1)
    expect(stats.matchFailures).toBe(1)
  })
})

describe('store (SSR / no window available)', () => {
  beforeEach(() => {
    removeWindow()
  })

  it('does not throw and returns safe defaults when window is undefined', () => {
    expect(typeof (globalThis as any).window).toBe('undefined')

    expect(() => saveCheck(makeCheck())).not.toThrow()
    expect(() => saveRecommendation(makeRecommendation())).not.toThrow()
    expect(() => saveLead(makeLead())).not.toThrow()

    expect(getCheck('check_abc')).toBeNull()
    expect(getRecommendation('rec_abc')).toBeNull()
    expect(getLeads()).toEqual([])
    expect(getStats()).toEqual({
      totalChecks: 0,
      totalRecommendations: 0,
      totalLeads: 0,
      matchFailures: 0,
      topTreatmentCategories: {},
    })
  })
})
