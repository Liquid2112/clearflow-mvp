import { generateRecommendation, QuizAnswers, WaterSystemInfo } from '@/lib/recommendations'
import { getUserRecommendation, createRecommendation, getUserCheck } from '@/lib/db'

function toWaterSystemInfo(ws: any | null): WaterSystemInfo | null {
  if (!ws) return null
  return {
    pwsid: ws.pwsid,
    name: ws.name,
    state: ws.state,
    systemType: ws.system_type,
    populationServed: ws.population_served,
    serviceConnections: ws.service_connections,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const recommendationId = searchParams.get('recommendationId') || searchParams.get('id')

  if (!recommendationId) {
    return Response.json(
      { error: 'recommendationId is required.' },
      { status: 400 }
    )
  }

  const rec = getUserRecommendation(recommendationId)
  if (!rec) {
    return Response.json(
      { error: 'Recommendation not found.' },
      { status: 404 }
    )
  }

  return Response.json({
    id: rec.id,
    recommendationId: rec.id,
    checkId: rec.checkId,
    treatment_category: rec.treatment_category,
    rationale: rec.rationale,
    public_data_limitations: rec.public_data_limitations,
    home_test_recommended: rec.home_test_recommended,
    estimated_cost_range: rec.estimated_cost_range,
    test_kit_suggested: rec.test_kit_suggested,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { checkId, answers } = body

    if (!checkId || !answers) {
      return Response.json(
        { error: 'checkId and answers are required.' },
        { status: 400 }
      )
    }

    const check = getUserCheck(checkId)
    if (!check) {
      return Response.json(
        { error: 'Check not found.' },
        { status: 404 }
      )
    }

    const answersTyped = answers as QuizAnswers
    const waterSystem = toWaterSystemInfo(check.waterSystem)
    const rec = generateRecommendation(waterSystem, answersTyped, null)

    const recommendation = createRecommendation({
      checkId,
      treatment_category: rec.treatment_category,
      rationale: rec.rationale,
      public_data_limitations: rec.public_data_limitations,
      home_test_recommended: rec.home_test_recommended,
      estimated_cost_range: rec.estimated_cost_range,
      test_kit_suggested: rec.test_kit_suggested,
    })

    return Response.json({
      recommendationId: recommendation.id,
      ...rec,
    })
  } catch (err) {
    console.error('plan error:', err)
    return Response.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
