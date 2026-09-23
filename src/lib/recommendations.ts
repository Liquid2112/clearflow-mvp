/**
 * Recommendation engine for ClearFlow
 * Generates water filtration recommendations based on quiz answers and water quality data
 */

export interface QuizAnswers {
  primary_goal: string
  housing: string
  scope: string
  household_size: string
  budget: string
  install_willing: string
  test_confirmation: string
}

export interface WaterSystemInfo {
  pwsid: string
  name: string
  state: string
  systemType: string
  populationServed: number
  serviceConnections: number
}

export interface Recommendation {
  treatment_category: string
  rationale: string
  public_data_limitations: string[]
  home_test_recommended: boolean
  estimated_cost_range: string
  test_kit_suggested: boolean
  suggested_products?: string[]
}

// Default limitations disclaimer
const LIMITATIONS = [
  'This recommendation is based on public water system data, not a test of your specific tap water.',
  'Public data describes the water system serving your area — it does not reflect your household plumbing, private well, or other site-specific factors.',
  'Water quality can vary over time. A single snapshot from public data is a starting point, not a guarantee of current conditions.',
]

// Cost ranges by category
const COST_RANGES: Record<string, string> = {
  'pitcher': '$20–$60 for the pitcher, $10–$20 per filter replacement',
  'faucet': '$20–$50 for the faucet filter, $10–$20 per filter replacement',
  'under_sink_carbon': '$100–$300 for the system, $20–$50 per filter replacement',
  'under_sink_ro': '$200–$500 for the system, $50–$100 per membrane/filter replacement',
  'whole_house_carbon': '$400–$1,200 for the system, $50–$150 per filter replacement',
  'whole_house_softener': '$500–$2,000 for the system, $50–$100 per salt/regeneration',
  'whole_house_ro': '$1,500–$5,000+ for the system, $100–$300 per year in maintenance',
  'test_kit': '$20–$150 depending on the number of contaminants tested',
}

// Product suggestions by category
const PRODUCTS: Record<string, string[]> = {
  'pitcher': [
    'Basic activated carbon pitcher filters',
    'Premium pitcher filters with additional media',
  ],
  'faucet': [
    'Faucet-mount carbon filters',
    'Faucet-mount filters with metal housing',
  ],
  'under_sink_carbon': [
    'Single-stage under-sink carbon block filters',
    'Dual-stage under-sink filtration systems',
  ],
  'under_sink_ro': [
    'Standard 4-stage reverse osmosis systems',
    'Compact under-sink RO systems with remineralization',
  ],
  'whole_house_carbon': [
    'Whole-house activated carbon filtration tanks',
    'Whole-house carbon filters with sediment pre-filter',
  ],
  'whole_house_softener': [
    'Salt-based ion exchange water softeners',
    'Salt-free water conditioners (scale reduction)',
  ],
  'whole_house_ro': [
    'Whole-house reverse osmosis systems (commercial-grade)',
  ],
  'test_kit': [
    'Certified lead test kits (EPA-recognized laboratories)',
    'Comprehensive home water test kits (multiple contaminants)',
    'Hardness and mineral test strips',
  ],
}

function getCostRange(category: string): string {
  return COST_RANGES[category] || '$50–$500 (varies by product and installation)'
}

function getProducts(category: string): string[] {
  return PRODUCTS[category] || []
}

/**
 * Determine recommendation category based on quiz answers and water data
 */
function determineCategory(
  answers: QuizAnswers,
  waterData: { contaminants: Array<{ name: string; exceeds: boolean }> } | null
): string {
  const { primary_goal, housing, scope, budget, install_willing, test_confirmation } = answers

  // If user wants to test first, recommend testing
  if (test_confirmation === 'Yes — test first') {
    return 'test_kit'
  }

  // Lead concern
  if (primary_goal === 'Lead concern') {
    // Check if lead exceeds EPA limit in public data
    const leadExceeds = waterData?.contaminants.some(c => c.name === 'Lead' && c.exceeds)

    if (scope === 'Drinking water only') {
      if (budget === 'Under $100') {
        if (install_willing === 'Yes') return 'under_sink_carbon'
        return 'faucet'
      }
      if (budget === '$100–$300') {
        if (install_willing === 'Yes') return 'under_sink_ro'
        return 'under_sink_carbon'
      }
      // $300-$800 or $800+
      if (install_willing === 'Yes') return 'under_sink_ro'
      return 'under_sink_carbon'
    }

    // Whole-home scope
    if (budget === 'Under $100') {
      return 'under_sink_carbon' // Best option for whole-home concern on tight budget
    }
    if (budget === '$100–$300') {
      return 'whole_house_carbon'
    }
    return 'whole_house_carbon' // or softener if hardness also a concern
  }

  // Hardness/minerals
  if (primary_goal === 'Hardness/minerals' || primary_goal === 'Appliance scale') {
    if (scope === 'Drinking water only') {
      return 'under_sink_carbon' // Carbon doesn't soften, but it's the drinking water option
    }
    // Whole-home hardness best addressed with softener
    if (budget === 'Under $100') {
      return 'under_sink_carbon'
    }
    return 'whole_house_softener'
  }

  // Taste/odor
  if (primary_goal === 'Taste/odor' || primary_goal === 'Reducing chlorine') {
    if (scope === 'Drinking water only') {
      if (budget === 'Under $100') {
        if (install_willing === 'Yes') return 'under_sink_carbon'
        return 'pitcher'
      }
      return 'under_sink_carbon'
    }
    // Whole-home chlorine reduction
    if (budget === 'Under $100') {
      return 'under_sink_carbon'
    }
    return 'whole_house_carbon'
  }

  // Skin/hair
  if (primary_goal === 'Skin/hair') {
    // Chlorine and hardness both affect skin/hair
    if (scope === 'Drinking water only') {
      return 'under_sink_carbon'
    }
    if (budget === 'Under $100') {
      return 'under_sink_carbon'
    }
    // Could be softener or carbon depending on whether hardness is the issue
    return 'whole_house_carbon'
  }

  // General peace of mind
  if (primary_goal === 'General peace of mind') {
    if (scope === 'Drinking water only') {
      if (budget === 'Under $100') {
        if (install_willing === 'Yes') return 'under_sink_carbon'
        return 'pitcher'
      }
      if (budget === '$100–$300') {
        if (install_willing === 'Yes') return 'under_sink_ro'
        return 'under_sink_carbon'
      }
      if (install_willing === 'Yes') return 'under_sink_ro'
      return 'under_sink_carbon'
    }
    // Whole-home general concern
    if (budget === 'Under $100') {
      return 'under_sink_carbon'
    }
    return 'whole_house_carbon'
  }

  // Default fallback
  if (scope === 'Drinking water only') {
    if (budget === 'Under $100') {
      return 'pitcher'
    }
    return 'under_sink_carbon'
  }

  return 'whole_house_carbon'
}

/**
 * Generate a human-readable rationale for the recommendation
 */
function generateRationale(
  category: string,
  answers: QuizAnswers,
  waterData: { contaminants: Array<{ name: string; level: string; epaLimit: string; exceeds: boolean }> } | null,
  waterSystem: WaterSystemInfo | null
): string {
  const { primary_goal, housing, scope, budget } = answers

  const isRenter = housing === 'Rent'
  const isOwner = housing === 'Own'

  const goalDescriptions: Record<string, string> = {
    'Taste/odor': 'taste and odor',
    'Reducing chlorine': 'reducing chlorine',
    'Hardness/minerals': 'hardness and mineral content',
    'Lead concern': 'lead in your water',
    'Skin/hair': 'skin and hair concerns from water quality',
    'Appliance scale': 'scale buildup on appliances',
    'General peace of mind': 'overall water quality peace of mind',
  }

  const goal = goalDescriptions[primary_goal] || 'your water quality concerns'

  const scopeDesc = scope === 'Drinking water only'
    ? 'drinking water'
    : 'your whole home'

  let rationale = `Based on your focus on ${goal} for ${scopeDesc}`

  if (waterSystem) {
    rationale += ` and your water system (${waterSystem.name})`
  }

  rationale += ', we recommend '

  const categoryDescriptions: Record<string, string> = {
    'pitcher': 'a pitcher filter — an affordable, no-installation option that reduces chlorine taste, odor, and some contaminants.',
    'faucet': 'a faucet-mount filter — easy to install without permanent changes, good for renters, and effective for chlorine and taste improvement.',
    'under_sink_carbon': 'an under-sink carbon filtration system — more effective than pitcher or faucet filters, with better taste and contaminant reduction, installed under your kitchen sink.',
    'under_sink_ro': 'an under-sink reverse osmosis (RO) system — the most effective option for drinking water, removing lead, arsenic, nitrates, and many other contaminants at the molecular level.',
    'whole_house_carbon': 'a whole-house carbon filtration system — treats all water entering your home, reducing chlorine and improving taste and odor at every tap.',
    'whole_house_softener': 'a whole-house water softener — the standard solution for hard water, reducing scale buildup on appliances, fixtures, and improving soap efficiency throughout your home.',
    'whole_house_ro': 'a whole-house reverse osmosis system — the most comprehensive treatment, providing RO-quality water at every tap in your home.',
    'test_kit': 'starting with a certified home water test kit — this lets you confirm what is actually in your water at your specific tap before investing in treatment equipment.',
  }

  rationale += categoryDescriptions[category] || 'a water filtration system appropriate for your needs.'

  // Add renter caveat
  if (isRenter && (category.startsWith('whole_house') || category === 'under_sink_ro')) {
    rationale += ' Note: as a renter, check with your landlord before installing permanent equipment. Faucet or pitcher filters may be more practical options.'
  }

  // Add lead-specific warning
  if (primary_goal === 'Lead concern' && waterData) {
    const leadContaminant = waterData.contaminants.find(c => c.name === 'Lead')
    if (leadContaminant) {
      if (leadContaminant.exceeds) {
        rationale += ` IMPORTANT: The public data shows lead levels (${leadContaminant.level} mg/L) exceeding the EPA limit (${leadContaminant.epaLimit} mg/L) for your water system. A certified filter specifically rated for lead removal is strongly recommended.`
      } else {
        rationale += ` While the public data shows lead levels within EPA limits for your water system, lead can enter water through household plumbing. A filter certified for lead removal adds an extra layer of protection.`
      }
    }
  }

  return rationale
}

/**
 * Generate a recommendation based on quiz answers and water quality data
 */
export function generateRecommendation(
  waterSystem: WaterSystemInfo | null,
  answers: QuizAnswers,
  waterData: { contaminants: Array<{ name: string; level: string; epaLimit: string; exceeds: boolean }> } | null = null
): Recommendation {
  const category = determineCategory(answers, waterData)
  const rationale = generateRationale(category, answers, waterData, waterSystem)

  const testKitRecommended = Boolean(
    answers.test_confirmation === 'Yes — test first' ||
      (answers.primary_goal === 'Lead concern' &&
        waterData?.contaminants.some((c) => c.name === 'Lead' && !c.exceeds))
  )

  const testKitSuggested = Boolean(
    testKitRecommended || answers.test_confirmation === 'Not sure'
  )

  return {
    treatment_category: category,
    rationale,
    public_data_limitations: LIMITATIONS,
    home_test_recommended: testKitRecommended,
    estimated_cost_range: getCostRange(category),
    test_kit_suggested: testKitSuggested,
    suggested_products: getProducts(category),
  }
}
