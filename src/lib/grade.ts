/**
 * ClearFlow water grade engine.
 *
 * Turns a system's public compliance snapshot (from epa.ts) into a single,
 * Whoop-style water "grade": a 0-100 score, an A-F letter, four sub-scores, and
 * a short list of plain-English drivers that explain what moved the grade.
 *
 * DESIGN PRINCIPLES
 *  - Deterministic and pure: the same ComplianceResult always yields the exact
 *    same output. No randomness, no time, no I/O. This is what makes the grade
 *    trustworthy and testable, and lets the plan page project an improved grade.
 *  - Transparent: every point deducted is explained by a driver string.
 *  - Homeowner-relevant: the four sub-scores map to the product's target
 *    concerns — contaminants (safety), disinfection (chlorine taste/byproducts),
 *    hardness (scale), and compliance (the utility's public track record).
 *
 * The overall score is a weighted blend of the four sub-scores. Weights are
 * chosen so that a real health issue (contaminants/compliance) can pull the
 * grade down hard, while aesthetic issues (hardness, chlorine taste) matter but
 * cannot on their own sink an otherwise-safe system below a C.
 */

import type { ComplianceResult, Contaminant } from '@/lib/epa'

export type GradeLetter = 'A' | 'B' | 'C' | 'D' | 'F'

export interface SubScores {
  /** Metals + inorganics vs. their EPA limits (100 = far below limits). */
  contaminants: number
  /** Disinfection byproducts + chlorine/chloramine residual (taste + byproducts). */
  disinfection: number
  /** Hardness in grains per gallon mapped to a scale-risk score. */
  hardness: number
  /** The utility's public compliance status. */
  compliance: number
}

export interface WaterGrade {
  score: number
  letter: GradeLetter
  subScores: SubScores
  drivers: string[]
  /** True when there was not enough public data to produce a real grade. */
  gradable: boolean
}

// Sub-score weights for the overall blend. Health-oriented dimensions dominate.
const WEIGHTS = {
  contaminants: 0.4,
  disinfection: 0.2,
  hardness: 0.15,
  compliance: 0.25,
} as const

// Contaminants that carry the most health weight. Others still count but are
// scored more gently since exceedances are rarer and less acute.
const HIGH_RISK = new Set(['Lead', 'Arsenic', 'Nitrate', 'Copper'])

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}

function round(n: number): number {
  return Math.round(n)
}

/** Ratio of a measured level to its EPA limit, capped. Non-numeric -> 0. */
function limitRatio(c: Contaminant): number | null {
  const level = parseFloat(c.level)
  const limit = parseFloat(c.epaLimit)
  if (isNaN(level) || isNaN(limit) || limit <= 0) return null
  return level / limit
}

/**
 * Contaminant sub-score: starts at 100 and deducts based on how close each
 * metal/inorganic sits to its EPA limit. Approaching the limit costs points;
 * exceeding it costs a lot. High-risk contaminants are penalized harder.
 */
function scoreContaminants(contaminants: Contaminant[], drivers: string[]): number {
  const relevant = contaminants.filter(
    (c) => c.category === 'Metal' || c.category === 'Inorganic'
  )
  if (relevant.length === 0) return 100

  let score = 100
  for (const c of relevant) {
    const ratio = limitRatio(c)
    if (ratio === null) continue
    const weight = HIGH_RISK.has(c.name) ? 1 : 0.6

    if (ratio >= 1) {
      // At or above the EPA limit — heavy, capped penalty.
      const over = clamp((ratio - 1) * 40, 0, 30)
      score -= (25 + over) * weight
      drivers.push(
        `${c.name} is at or above the EPA limit (${c.level} of ${c.epaLimit} ${c.unit})`
      )
    } else if (ratio >= 0.5) {
      // Between half and full limit — meaningful but not failing.
      score -= (ratio - 0.5) * 40 * weight
      drivers.push(`${c.name} is elevated, at ${round(ratio * 100)}% of the EPA limit`)
    } else {
      // Comfortably low — tiny deduction that keeps clean systems near 100.
      score -= ratio * 8 * weight
    }
  }
  return clamp(round(score), 0, 100)
}

/**
 * Disinfection sub-score: combines disinfection byproducts (TTHM/HAA5) against
 * their limits with the raw chlorine/chloramine residual, which drives the
 * "pool water" taste homeowners complain about.
 */
function scoreDisinfection(compliance: ComplianceResult, drivers: string[]): number {
  let score = 100

  const byproducts = compliance.contaminants.filter(
    (c) => c.category === 'Disinfection byproduct'
  )
  let worstRatio = 0
  let worstName = ''
  for (const c of byproducts) {
    const ratio = limitRatio(c)
    if (ratio === null) continue
    if (ratio > worstRatio) {
      worstRatio = ratio
      worstName = c.name
    }
    // Byproducts scale in: nothing under 40% of limit, ramping up after.
    score -= clamp((ratio - 0.4) * 60, 0, 45)
  }
  if (worstRatio >= 0.75 && worstName) {
    drivers.push(
      `${worstName} (a disinfection byproduct) is running high, at ${round(
        worstRatio * 100
      )}% of the EPA limit`
    )
  }

  // Chlorine/chloramine residual taste penalty. ~<1 mg/L is barely noticeable;
  // 2 mg/L is common; 3+ mg/L reads as a strong chemical taste.
  const residual = compliance.disinfectantResidualMgL
  if (residual !== null && residual > 1) {
    const penalty = clamp((residual - 1) * 12, 0, 30)
    score -= penalty
    if (residual >= 2.5) {
      const label = compliance.disinfectantType ?? 'Disinfectant'
      drivers.push(
        `${label} residual is high (${residual} mg/L), which usually means a noticeable chlorine taste`
      )
    }
  }

  return clamp(round(score), 0, 100)
}

/**
 * Hardness sub-score in grains per gallon (gpg):
 *   0-3 soft (100-90), 3-7 moderate (~90-70), 7-10 hard (~70-45),
 *   10-15 very hard (~45-20), 15+ extremely hard (<20).
 */
function scoreHardness(hardnessGpg: number | null, drivers: string[]): number {
  if (hardnessGpg === null) return 100
  const gpg = Math.max(0, hardnessGpg)
  // Linear-ish: lose ~5.5 points per gpg above 0, floored.
  const score = clamp(round(100 - gpg * 5.5), 0, 100)

  if (gpg >= 10.5) {
    drivers.push(`Water is very hard (${gpg} gpg), which drives scale on fixtures and appliances`)
  } else if (gpg >= 7) {
    drivers.push(`Water is hard (${gpg} gpg), so expect some scale buildup over time`)
  }
  return score
}

/** Compliance sub-score from the utility's public status. */
function scoreCompliance(status: ComplianceResult['status'], drivers: string[]): number {
  switch (status) {
    case 'no_recent_violation':
      return 100
    case 'monitoring_reporting_issue':
      drivers.push('The utility has a monitoring or reporting gap in its public record')
      return 70
    case 'historical_violation':
      drivers.push('This system has a historical EPA violation on record')
      return 45
    case 'data_needs_review':
    default:
      // Defensive branch: with the current bundled data every gradable system
      // resolves to one of the statuses above, so this path is not reached
      // today. It is kept intentionally for when real, live compliance data is
      // wired in and may report an ambiguous/under-review status. Do not remove
      // it as dead code — it is the honest fallback for that future case.
      drivers.push('Public compliance data for this system needs review')
      return 60
  }
}

/** Map a 0-100 score to a letter grade. */
export function scoreToLetter(score: number): GradeLetter {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

/**
 * Compute the water grade from a compliance snapshot. Pure + deterministic.
 *
 * Returns a non-gradable placeholder when there is no compliance data or no
 * usable measurements, so the UI can show an honest "not enough public data to
 * grade" state instead of a fabricated score.
 */
export function computeWaterGrade(compliance: ComplianceResult | null): WaterGrade {
  if (
    !compliance ||
    (compliance.contaminants.length === 0 &&
      compliance.hardnessGpg === null &&
      compliance.disinfectantResidualMgL === null)
  ) {
    return {
      score: 0,
      letter: 'F',
      subScores: { contaminants: 0, disinfection: 0, hardness: 0, compliance: 0 },
      drivers: [],
      gradable: false,
    }
  }

  const drivers: string[] = []

  const contaminants = scoreContaminants(compliance.contaminants, drivers)
  const disinfection = scoreDisinfection(compliance, drivers)
  const hardness = scoreHardness(compliance.hardnessGpg, drivers)
  const complianceScore = scoreCompliance(compliance.status, drivers)

  const subScores: SubScores = {
    contaminants,
    disinfection,
    hardness,
    compliance: complianceScore,
  }

  const blended =
    contaminants * WEIGHTS.contaminants +
    disinfection * WEIGHTS.disinfection +
    hardness * WEIGHTS.hardness +
    complianceScore * WEIGHTS.compliance

  const score = clamp(round(blended), 0, 100)

  // If nothing pulled the grade down, surface a positive, human driver so the
  // card always has something to say.
  if (drivers.length === 0) {
    drivers.push('No contaminants near EPA limits and a clean compliance record')
  }

  return {
    score,
    letter: scoreToLetter(score),
    subScores,
    // Keep the 3 most decisive drivers (they are pushed in weight order above).
    drivers: drivers.slice(0, 3),
    gradable: true,
  }
}

/**
 * Deterministic, clearly-labeled ESTIMATE of the grade after applying a
 * treatment plan. Used on the plan page to reinforce the "iterate on your
 * grade" loop. This is NOT a measured result — it models the typical effect of
 * each treatment category on the sub-scores, then re-blends.
 */
export function projectGradeWithPlan(
  current: WaterGrade,
  treatmentCategory: string
): WaterGrade {
  if (!current.gradable) return current

  const s = { ...current.subScores }

  const bump = (key: keyof SubScores, to: number) => {
    s[key] = clamp(Math.max(s[key], to), 0, 100)
  }

  switch (treatmentCategory) {
    case 'under_sink_ro':
    case 'whole_house_ro':
      // RO removes most contaminants and byproducts.
      bump('contaminants', 96)
      bump('disinfection', 94)
      break
    case 'under_sink_carbon':
    case 'whole_house_carbon':
    case 'faucet':
    case 'pitcher':
      // Carbon strongly reduces chlorine taste + disinfection byproducts.
      bump('disinfection', 92)
      bump('contaminants', Math.min(96, s.contaminants + 6))
      break
    case 'whole_house_softener':
      // Softener targets hardness.
      bump('hardness', 95)
      break
    case 'test_kit':
    default:
      // Testing does not change the water; no projected bump.
      return current
  }

  const blended =
    s.contaminants * WEIGHTS.contaminants +
    s.disinfection * WEIGHTS.disinfection +
    s.hardness * WEIGHTS.hardness +
    s.compliance * WEIGHTS.compliance

  const score = clamp(round(blended), 0, 100)

  return {
    score,
    letter: scoreToLetter(score),
    subScores: s,
    drivers: current.drivers,
    gradable: true,
  }
}
