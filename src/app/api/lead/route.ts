import { getLeads, createLead } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      email,
      name,
      city_state,
      household_goal,
      phone,
      consent_timestamp,
    } = body

    if (!email || !name || !city_state || !household_goal || !consent_timestamp) {
      return Response.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      )
    }

    const lead = createLead({
      email,
      name,
      city_state,
      household_goal,
      phone: phone || null,
      consent_timestamp,
    })

    return Response.json({
      success: true,
      leadId: lead.id,
    })
  } catch (err) {
    console.error('lead error:', err)
    return Response.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
