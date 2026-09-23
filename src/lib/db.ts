import { hashString } from '@/lib/utils'
import { geocodeAddress, matchWaterSystem } from '@/lib/geo'
import { fetchComplianceData } from '@/lib/epa'

export interface WaterSystem {
  pwsid: string
  name: string
  state: string
  systemType: string
  populationServed: number
  serviceConnections: number
  boundarySource: string
  coverageArea: string
  matchConfidence: 'High' | 'Medium' | 'Low'
}

// In-memory store for MVP (replace with real DB in production)
const checks = new Map<string, ReturnType<typeof createUserCheck>>()
const recommendations = new Map<string, ReturnType<typeof createRecommendation>>()
const leadsList = new Map<string, ReturnType<typeof createLead>>()
let checkCounter = 0
let recCounter = 0
let leadCounter = 0

export function createUserCheck(input: {
  address: string
  zip: string | null
  latitude: number
  longitude: number | null
  pwsid: string | null
  matchConfidence: string
  boundarySource: string | null
  waterSystem: any
}) {
  const id = `check-${++checkCounter}`
  // Hash the address for storage — do NOT keep the raw address text.
  // Per the privacy policy: raw addresses are not stored by default.
  const addressHash = hashString(input.address)
  const record = {
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
  checks.set(id, record)
  return record
}

export function getUserCheck(checkId: string) {
  return checks.get(checkId) || null
}

export function createRecommendation(input: {
  checkId: string
  treatment_category: string
  rationale: string
  public_data_limitations: string[]
  home_test_recommended: boolean
  estimated_cost_range: string
  test_kit_suggested: boolean
}) {
  const id = `rec-${++recCounter}`
  const record = {
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
  recommendations.set(id, record)
  return record
}

export function getUserRecommendation(recommendationId: string) {
  return recommendations.get(recommendationId) || null
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

export function getStats() {
  const recs = Array.from(recommendations.values());
  const categoryCounts: Record<string, number> = {};
  let matchFailures = 0;
  for (const c of checks.values()) {
    if (!c.pwsid || c.matchConfidence === 'Low' || c.matchConfidence === 'No match') {
      matchFailures++;
    }
  }
  for (const r of recs) {
    const cat = r.treatment_category.toLowerCase().replace(/\s*\+.*$/, '').replace(/\s*—.*$/, '').trim();
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }
  return {
    total_checks: checks.size,
    total_leads: leadsList.size,
    total_recommendations: recommendations.size,
    match_failures: matchFailures,
    top_treatment_categories: categoryCounts,
  };
}
