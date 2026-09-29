import { describe, it, expect } from 'vitest'
import { computeWaterGrade, scoreToLetter, projectGradeWithPlan } from '@/lib/grade'
import { fetchComplianceData, type ComplianceResult } from '@/lib/epa'

// Helper: build a minimal clean compliance snapshot we can mutate per-test.
function cleanCompliance(overrides: Partial<ComplianceResult> = {}): ComplianceResult {
  return {
    status: 'no_recent_violation',
    waterSource: 'Surface Water',
    lastReportDate: '2025-01-01',
    ccrUrl: null,
    hardnessGpg: 4,
    disinfectantType: 'Chlorine',
    disinfectantResidualMgL: 1.0,
    contaminants: [
      { name: 'Lead', level: '0.001', unit: 'mg/L', epaLimit: '0.015', exceeds: false, category: 'Metal', about: '', note: '' },
      { name: 'Total Trihalomethanes', level: '0.020', unit: 'mg/L', epaLimit: '0.080', exceeds: false, category: 'Disinfection byproduct', about: '', note: '' },
    ],
    ...overrides,
  }
}

describe('scoreToLetter', () => {
  it('maps score ranges to the documented letters', () => {
    expect(scoreToLetter(95)).toBe('A')
    expect(scoreToLetter(90)).toBe('A')
    expect(scoreToLetter(85)).toBe('B')
    expect(scoreToLetter(75)).toBe('C')
    expect(scoreToLetter(65)).toBe('D')
    expect(scoreToLetter(59)).toBe('F')
    expect(scoreToLetter(0)).toBe('F')
  })
})

describe('computeWaterGrade', () => {
  it('grades a clean, soft-water system high (A or B)', () => {
    const g = computeWaterGrade(cleanCompliance())
    expect(g.gradable).toBe(true)
    expect(g.score).toBeGreaterThanOrEqual(80)
    expect(['A', 'B']).toContain(g.letter)
  })

  it('grades a system with a historical violation lower than a clean one', () => {
    const clean = computeWaterGrade(cleanCompliance())
    const violated = computeWaterGrade(cleanCompliance({ status: 'historical_violation' }))
    expect(violated.score).toBeLessThan(clean.score)
    expect(violated.subScores.compliance).toBeLessThan(clean.subScores.compliance)
    expect(violated.drivers.join(' ')).toMatch(/historical/i)
  })

  it('loses hardness sub-score points for hard water', () => {
    const soft = computeWaterGrade(cleanCompliance({ hardnessGpg: 2 }))
    const hard = computeWaterGrade(cleanCompliance({ hardnessGpg: 16 }))
    expect(hard.subScores.hardness).toBeLessThan(soft.subScores.hardness)
    expect(hard.subScores.hardness).toBeLessThan(50)
    expect(hard.drivers.join(' ')).toMatch(/hard/i)
  })

  it('penalizes contaminants that exceed the EPA limit', () => {
    const clean = computeWaterGrade(cleanCompliance())
    const overLimit = computeWaterGrade(
      cleanCompliance({
        contaminants: [
          { name: 'Lead', level: '0.020', unit: 'mg/L', epaLimit: '0.015', exceeds: true, category: 'Metal', about: '', note: '' },
        ],
      })
    )
    expect(overLimit.subScores.contaminants).toBeLessThan(clean.subScores.contaminants)
    expect(overLimit.subScores.contaminants).toBeLessThan(80)
  })

  it('penalizes a high chlorine residual on the disinfection sub-score', () => {
    const low = computeWaterGrade(cleanCompliance({ disinfectantResidualMgL: 0.8 }))
    const high = computeWaterGrade(cleanCompliance({ disinfectantResidualMgL: 3.2 }))
    expect(high.subScores.disinfection).toBeLessThan(low.subScores.disinfection)
  })

  it('is pure and deterministic: same input -> same output', () => {
    const input = cleanCompliance({ hardnessGpg: 9, status: 'monitoring_reporting_issue' })
    const a = computeWaterGrade(input)
    const b = computeWaterGrade(input)
    expect(a).toEqual(b)
    // Independent identical inputs must also match exactly.
    const c = computeWaterGrade(cleanCompliance({ hardnessGpg: 9, status: 'monitoring_reporting_issue' }))
    expect(c.score).toBe(a.score)
    expect(c.subScores).toEqual(a.subScores)
  })

  it('returns a non-gradable placeholder when there is no data', () => {
    const g = computeWaterGrade(null)
    expect(g.gradable).toBe(false)
    expect(g.drivers).toHaveLength(0)
  })

  it('produces visibly different grades across the bundled systems', () => {
    const nashville = computeWaterGrade(fetchComplianceData('TNPW0001234'))
    const riverside = computeWaterGrade(fetchComplianceData('MIPW0003456'))
    // The lead-violation, hard-water system must grade clearly worse.
    expect(riverside.score).toBeLessThan(nashville.score)
    // At least one bundled system falls below a B.
    expect(riverside.score).toBeLessThan(80)
  })
})

describe('projectGradeWithPlan', () => {
  it('projects a higher grade for a treating plan (carbon)', () => {
    const current = computeWaterGrade(fetchComplianceData('TXPW0004567'))
    const projected = projectGradeWithPlan(current, 'whole_house_carbon')
    expect(projected.score).toBeGreaterThanOrEqual(current.score)
    expect(projected.subScores.disinfection).toBeGreaterThanOrEqual(current.subScores.disinfection)
  })

  it('does not change the grade for a test-only plan', () => {
    const current = computeWaterGrade(fetchComplianceData('TXPW0004567'))
    const projected = projectGradeWithPlan(current, 'test_kit')
    expect(projected.score).toBe(current.score)
  })

  it('softener plan improves the hardness sub-score', () => {
    const current = computeWaterGrade(fetchComplianceData('AZPW0009012'))
    const projected = projectGradeWithPlan(current, 'whole_house_softener')
    expect(projected.subScores.hardness).toBeGreaterThan(current.subScores.hardness)
  })
})
