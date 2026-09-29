import { describe, it, expect } from 'vitest'
import { generateRecommendation, type QuizAnswers } from '@/lib/recommendations'

function answers(overrides: Partial<QuizAnswers> = {}): QuizAnswers {
  return {
    primary_goal: 'General peace of mind',
    housing: 'Own',
    scope: 'Drinking water only',
    household_size: '3-4',
    budget: '$100-$300',
    install_willing: 'Yes',
    test_confirmation: 'No',
    ...overrides,
  }
}

const leadWaterData = {
  contaminants: [
    { name: 'Lead', level: '0.002', unit: 'mg/L', epaLimit: '0.015', exceeds: false },
  ],
}

describe('generateRecommendation', () => {
  it('recommends a test kit when the user chooses to test first', () => {
    const rec = generateRecommendation(null, answers({ test_confirmation: 'Yes — test first' }), null)
    expect(rec.treatment_category).toBe('test_kit')
    expect(rec.home_test_recommended).toBe(true)
    expect(rec.test_kit_suggested).toBe(true)
  })

  it('recommends RO or carbon for a lead concern on drinking water only', () => {
    const rec = generateRecommendation(
      null,
      answers({ primary_goal: 'Lead concern', scope: 'Drinking water only', budget: '$100-$300', install_willing: 'Yes' }),
      leadWaterData
    )
    expect(['under_sink_ro', 'under_sink_carbon']).toContain(rec.treatment_category)
  })

  it('recommends a softener for whole-home hardness', () => {
    const rec = generateRecommendation(
      null,
      answers({ primary_goal: 'Hardness/minerals', scope: 'Whole-home', budget: '$300-$800' }),
      null
    )
    expect(rec.treatment_category).toBe('whole_house_softener')
  })

  it('is deterministic for identical inputs', () => {
    const a = generateRecommendation(null, answers({ primary_goal: 'Lead concern' }), leadWaterData)
    const b = generateRecommendation(null, answers({ primary_goal: 'Lead concern' }), leadWaterData)
    expect(a.treatment_category).toBe(b.treatment_category)
    expect(a.rationale).toBe(b.rationale)
  })
})
