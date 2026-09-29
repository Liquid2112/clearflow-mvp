import { hashString, generateId } from '@/lib/utils'
import type { WaterSystem } from '@/lib/geo'
import {
  saveCheck,
  getCheck,
  saveRecommendation,
  getRecommendation,
  type CheckRecord,
  type RecommendationRecord,
} from '@/lib/store'

// Re-export the canonical water-system shape so existing callers that import
// `WaterSystem` from '@/lib/db' keep working. The single source of truth for
// this type lives in geo.ts (snake_case), matching what the matcher returns
// and what the results page consumes.
export type { WaterSystem }

// Check and recommendation records are persisted client-side via sessionStorage
// (see store.ts). The previous module-level Map was wiped on every full-page
// navigation (window.location.search = ...), which broke the entire flow. Leads
// remain in-memory for now; the admin surface that reads them is a later feature.
const leadsList = new Map<string, ReturnType<typeof createLead>>()
let leadCounter = 0

export function createUserCheck(input: {
  address: string
  zip: string | null
  latitude: number
  longitude: number | null
  pwsid: string | null
  matchConfidence: string
  boundarySource: string | null
  waterSystem: WaterSystem | null
}): CheckRecord {
  const id = generateId('check')
  // Hash the address for storage — do NOT keep the raw address text.
  // Per the privacy policy: raw addresses are not stored by default.
  const addressHash = hashString(input.address)
  const record: CheckRecord = {
    id,
    addressHash,
    // Raw address intentionally omitted — only the hash is retained.
    zip: input.zip,
    latitude: input.latitude,
    longitude: input.longitude,
    pwsid: input.pwsid,
    matchConfidence: input.matchConfidence,
    boundarySource: input.boundarySource,
    waterSystem: input.waterSystem,
    createdAt: new Date().toISOString(),
  }
  return saveCheck(record)
}

export function getUserCheck(checkId: string): CheckRecord | null {
  return getCheck(checkId)
}

export function createRecommendation(input: {
  checkId: string
  treatment_category: string
  rationale: string
  public_data_limitations: string[]
  home_test_recommended: boolean
  estimated_cost_range: string
  test_kit_suggested: boolean
}): RecommendationRecord {
  const id = generateId('rec')
  const record: RecommendationRecord = {
    id,
    checkId: input.checkId,
    treatment_category: input.treatment_category,
    rationale: input.rationale,
    public_data_limitations: input.public_data_limitations,
    home_test_recommended: input.home_test_recommended,
    estimated_cost_range: input.estimated_cost_range,
    test_kit_suggested: input.test_kit_suggested,
    createdAt: new Date().toISOString(),
  }
  return saveRecommendation(record)
}

export function getUserRecommendation(recommendationId: string): RecommendationRecord | null {
  return getRecommendation(recommendationId)
}

export function createLead(input: {
  email: string
  name: string
  city_state: string
  household_goal: string
  phone: string | null
  consent_timestamp: string
}) {
  const id = `lead-${++leadCounter}`
  const record = {
    id,
    email: input.email,
    name: input.name,
    city_state: input.city_state,
    household_goal: input.household_goal,
    phone: input.phone,
    consent_timestamp: input.consent_timestamp,
    createdAt: new Date().toISOString(),
  }
  leadsList.set(id, record)
  return record
}

export function getLeads() {
  return Array.from(leadsList.values())
}
