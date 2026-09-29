// EPA and water quality data for ClearFlow.
//
// The app ships as a STATIC EXPORT (output: 'export') with no runtime server,
// so all data here is bundled and offline. In production these values would be
// sourced from the EPA ECHO / SDWIS datasets and each system's Consumer
// Confidence Report (CCR); the shapes below mirror what those sources expose so
// the client-side grade + recommendation engines can run entirely offline.

// Broad grouping used by the UI and the grade engine to organize contaminants.
export type ContaminantCategory =
  | 'Disinfection byproduct'
  | 'Disinfectant residual'
  | 'Metal'
  | 'Inorganic'
  | 'Microbial'
  | 'Physical'

export interface Contaminant {
  name: string
  level: string
  unit: string
  // EPA MCL / action level (or a typical aesthetic reference where no MCL exists).
  epaLimit: string
  exceeds: boolean
  // Metadata so results feel specific and human, not like a raw data dump.
  category: ContaminantCategory
  // Plain-English "what it is".
  about: string
  // Health or aesthetic note describing why a homeowner might care.
  note: string
}

export interface ComplianceResult {
  status: 'no_recent_violation' | 'historical_violation' | 'monitoring_reporting_issue' | 'data_needs_review'
  waterSource: string | null
  lastReportDate: string | null
  ccrUrl: string | null
  // Water hardness in grains per gallon (gpg). Common homeowner-facing unit.
  //  0-3 soft, 3-7 moderately hard, 7-10 hard, 10+ very hard.
  hardnessGpg: number | null
  // Free chlorine or chloramine residual carried in the distribution system,
  // in mg/L. Drives chlorine taste/odor. Null when the system does not report it.
  disinfectantType: 'Chlorine' | 'Chloramine' | null
  disinfectantResidualMgL: number | null
  contaminants: Contaminant[]
}

// Bundled compliance data for known water systems. Values are representative of
// each system's public profile and are intentionally varied so grades differ.
const STUB_COMPLIANCE: Record<string, ComplianceResult> = {
  // Nashville — large surface-water system, clean recent record, moderately hard.
  'TNPW0001234': {
    status: 'no_recent_violation',
    waterSource: 'Surface Water (Cumberland River)',
    lastReportDate: '2025-09-15',
    ccrUrl: 'https://example.com/ccr/tn-nashville-2025',
    hardnessGpg: 5.5,
    disinfectantType: 'Chloramine',
    disinfectantResidualMgL: 2.1,
    contaminants: [
      { name: 'Lead', level: '0.002', unit: 'mg/L', epaLimit: '0.015', exceeds: false, category: 'Metal', about: 'A toxic metal that can leach from older service lines and household plumbing.', note: 'No safe level for children; even low amounts are worth reducing at the tap.' },
      { name: 'Copper', level: '0.120', unit: 'mg/L', epaLimit: '1.3', exceeds: false, category: 'Metal', about: 'A metal that dissolves from copper pipes and brass fixtures.', note: 'High levels can cause a metallic taste and, over time, stomach upset.' },
      { name: 'Total Trihalomethanes', level: '0.035', unit: 'mg/L', epaLimit: '0.080', exceeds: false, category: 'Disinfection byproduct', about: 'A group of byproducts formed when chlorine reacts with organic matter.', note: 'A common target of carbon filtration; associated with long-term exposure concerns.' },
      { name: 'Haloacetic Acids', level: '0.022', unit: 'mg/L', epaLimit: '0.060', exceeds: false, category: 'Disinfection byproduct', about: 'Another family of disinfection byproducts from chlorinated water.', note: 'Reduced by activated carbon; tracked alongside trihalomethanes.' },
      { name: 'Arsenic', level: '0.001', unit: 'mg/L', epaLimit: '0.010', exceeds: false, category: 'Inorganic', about: 'A naturally occurring element that can enter groundwater.', note: 'Long-term exposure is a health concern; reverse osmosis reduces it well.' },
      { name: 'Nitrate', level: '0.50', unit: 'mg/L', epaLimit: '10', exceeds: false, category: 'Inorganic', about: 'A nutrient that enters water from fertilizer and runoff.', note: 'Especially important for infants; reverse osmosis is effective.' },
      { name: 'Turbidity', level: '0.3', unit: 'NTU', epaLimit: '1.0', exceeds: false, category: 'Physical', about: 'A measure of cloudiness from suspended particles.', note: 'Low turbidity indicates effective filtration at the treatment plant.' },
      { name: 'Total Coliform', level: 'Absent', unit: 'occurrences', epaLimit: '1', exceeds: false, category: 'Microbial', about: 'Bacteria used as an indicator of possible contamination.', note: 'Absence is a good sign that the distribution system is intact.' },
    ],
  },
  // Brentwood — groundwater, clean record, harder water.
  'TNPW0005678': {
    status: 'no_recent_violation',
    waterSource: 'Groundwater (Brentwood Aquifer)',
    lastReportDate: '2025-08-20',
    ccrUrl: 'https://example.com/ccr/tn-brentwood-2025',
    hardnessGpg: 9.5,
    disinfectantType: 'Chlorine',
    disinfectantResidualMgL: 1.4,
    contaminants: [
      { name: 'Lead', level: '0.001', unit: 'mg/L', epaLimit: '0.015', exceeds: false, category: 'Metal', about: 'A toxic metal that can leach from older service lines and household plumbing.', note: 'No safe level for children; even low amounts are worth reducing at the tap.' },
      { name: 'Arsenic', level: '0.003', unit: 'mg/L', epaLimit: '0.010', exceeds: false, category: 'Inorganic', about: 'A naturally occurring element that can enter groundwater.', note: 'Long-term exposure is a health concern; reverse osmosis reduces it well.' },
      { name: 'Nitrate', level: '0.80', unit: 'mg/L', epaLimit: '10', exceeds: false, category: 'Inorganic', about: 'A nutrient that enters water from fertilizer and runoff.', note: 'Especially important for infants; reverse osmosis is effective.' },
      { name: 'Total Trihalomethanes', level: '0.041', unit: 'mg/L', epaLimit: '0.080', exceeds: false, category: 'Disinfection byproduct', about: 'A group of byproducts formed when chlorine reacts with organic matter.', note: 'A common target of carbon filtration; associated with long-term exposure concerns.' },
      { name: 'Total Coliform', level: 'Absent', unit: 'occurrences', epaLimit: '1', exceeds: false, category: 'Microbial', about: 'Bacteria used as an indicator of possible contamination.', note: 'Absence is a good sign that the distribution system is intact.' },
    ],
  },
  // Phoenix, AZ — very hard groundwater/surface blend, strong chlorine taste.
  'AZPW0009012': {
    status: 'no_recent_violation',
    waterSource: 'Surface Water (Colorado & Salt River blend)',
    lastReportDate: '2025-07-30',
    ccrUrl: 'https://example.com/ccr/az-phoenix-2025',
    hardnessGpg: 16.5,
    disinfectantType: 'Chlorine',
    disinfectantResidualMgL: 3.2,
    contaminants: [
      { name: 'Lead', level: '0.003', unit: 'mg/L', epaLimit: '0.015', exceeds: false, category: 'Metal', about: 'A toxic metal that can leach from older service lines and household plumbing.', note: 'No safe level for children; even low amounts are worth reducing at the tap.' },
      { name: 'Total Trihalomethanes', level: '0.058', unit: 'mg/L', epaLimit: '0.080', exceeds: false, category: 'Disinfection byproduct', about: 'A group of byproducts formed when chlorine reacts with organic matter.', note: 'A common target of carbon filtration; associated with long-term exposure concerns.' },
      { name: 'Haloacetic Acids', level: '0.044', unit: 'mg/L', epaLimit: '0.060', exceeds: false, category: 'Disinfection byproduct', about: 'Another family of disinfection byproducts from chlorinated water.', note: 'Reduced by activated carbon; tracked alongside trihalomethanes.' },
      { name: 'Arsenic', level: '0.006', unit: 'mg/L', epaLimit: '0.010', exceeds: false, category: 'Inorganic', about: 'A naturally occurring element that can enter groundwater.', note: 'Long-term exposure is a health concern; reverse osmosis reduces it well.' },
      { name: 'Nitrate', level: '1.20', unit: 'mg/L', epaLimit: '10', exceeds: false, category: 'Inorganic', about: 'A nutrient that enters water from fertilizer and runoff.', note: 'Especially important for infants; reverse osmosis is effective.' },
      { name: 'Total Coliform', level: 'Absent', unit: 'occurrences', epaLimit: '1', exceeds: false, category: 'Microbial', about: 'Bacteria used as an indicator of possible contamination.', note: 'Absence is a good sign that the distribution system is intact.' },
    ],
  },
  // Flint-style example (fictional PWSID) — historical lead violation, hard water.
  'MIPW0003456': {
    status: 'historical_violation',
    waterSource: 'Surface Water (regional river intake)',
    lastReportDate: '2025-06-10',
    ccrUrl: 'https://example.com/ccr/mi-riverside-2025',
    hardnessGpg: 11.0,
    disinfectantType: 'Chlorine',
    disinfectantResidualMgL: 2.6,
    contaminants: [
      { name: 'Lead', level: '0.018', unit: 'mg/L', epaLimit: '0.015', exceeds: true, category: 'Metal', about: 'A toxic metal that can leach from older service lines and household plumbing.', note: 'This system exceeded the EPA action level; a certified lead filter is strongly advised.' },
      { name: 'Copper', level: '0.900', unit: 'mg/L', epaLimit: '1.3', exceeds: false, category: 'Metal', about: 'A metal that dissolves from copper pipes and brass fixtures.', note: 'High levels can cause a metallic taste and, over time, stomach upset.' },
      { name: 'Total Trihalomethanes', level: '0.071', unit: 'mg/L', epaLimit: '0.080', exceeds: false, category: 'Disinfection byproduct', about: 'A group of byproducts formed when chlorine reacts with organic matter.', note: 'Approaching the limit here; carbon filtration is a good idea.' },
      { name: 'Haloacetic Acids', level: '0.052', unit: 'mg/L', epaLimit: '0.060', exceeds: false, category: 'Disinfection byproduct', about: 'Another family of disinfection byproducts from chlorinated water.', note: 'Reduced by activated carbon; tracked alongside trihalomethanes.' },
      { name: 'Nitrate', level: '2.10', unit: 'mg/L', epaLimit: '10', exceeds: false, category: 'Inorganic', about: 'A nutrient that enters water from fertilizer and runoff.', note: 'Especially important for infants; reverse osmosis is effective.' },
      { name: 'Total Coliform', level: 'Absent', unit: 'occurrences', epaLimit: '1', exceeds: false, category: 'Microbial', about: 'Bacteria used as an indicator of possible contamination.', note: 'Absence is a good sign that the distribution system is intact.' },
    ],
  },
  // Portland, OR — soft surface water, low disinfection byproducts, monitoring gap.
  'ORPW0007890': {
    status: 'monitoring_reporting_issue',
    waterSource: 'Surface Water (protected mountain watershed)',
    lastReportDate: '2025-05-05',
    ccrUrl: 'https://example.com/ccr/or-portland-2025',
    hardnessGpg: 1.5,
    disinfectantType: 'Chlorine',
    disinfectantResidualMgL: 0.9,
    contaminants: [
      { name: 'Lead', level: '0.004', unit: 'mg/L', epaLimit: '0.015', exceeds: false, category: 'Metal', about: 'A toxic metal that can leach from older service lines and household plumbing.', note: 'Soft, low-mineral water can be more corrosive to old plumbing, so lead at the tap is still worth checking.' },
      { name: 'Total Trihalomethanes', level: '0.020', unit: 'mg/L', epaLimit: '0.080', exceeds: false, category: 'Disinfection byproduct', about: 'A group of byproducts formed when chlorine reacts with organic matter.', note: 'Low here thanks to a protected, low-organic source water.' },
      { name: 'Haloacetic Acids', level: '0.012', unit: 'mg/L', epaLimit: '0.060', exceeds: false, category: 'Disinfection byproduct', about: 'Another family of disinfection byproducts from chlorinated water.', note: 'Reduced by activated carbon; tracked alongside trihalomethanes.' },
      { name: 'Nitrate', level: '0.30', unit: 'mg/L', epaLimit: '10', exceeds: false, category: 'Inorganic', about: 'A nutrient that enters water from fertilizer and runoff.', note: 'Especially important for infants; reverse osmosis is effective.' },
      { name: 'Total Coliform', level: 'Absent', unit: 'occurrences', epaLimit: '1', exceeds: false, category: 'Microbial', about: 'Bacteria used as an indicator of possible contamination.', note: 'Absence is a good sign that the distribution system is intact.' },
    ],
  },
  // Austin, TX — hard surface water, elevated disinfection byproducts near limit.
  'TXPW0004567': {
    status: 'no_recent_violation',
    waterSource: 'Surface Water (Colorado River / Highland Lakes)',
    lastReportDate: '2025-08-01',
    ccrUrl: 'https://example.com/ccr/tx-austin-2025',
    hardnessGpg: 12.5,
    disinfectantType: 'Chloramine',
    disinfectantResidualMgL: 2.9,
    contaminants: [
      { name: 'Lead', level: '0.002', unit: 'mg/L', epaLimit: '0.015', exceeds: false, category: 'Metal', about: 'A toxic metal that can leach from older service lines and household plumbing.', note: 'No safe level for children; even low amounts are worth reducing at the tap.' },
      { name: 'Total Trihalomethanes', level: '0.066', unit: 'mg/L', epaLimit: '0.080', exceeds: false, category: 'Disinfection byproduct', about: 'A group of byproducts formed when chlorine reacts with organic matter.', note: 'Running high here; carbon filtration meaningfully reduces it.' },
      { name: 'Haloacetic Acids', level: '0.049', unit: 'mg/L', epaLimit: '0.060', exceeds: false, category: 'Disinfection byproduct', about: 'Another family of disinfection byproducts from chlorinated water.', note: 'Reduced by activated carbon; tracked alongside trihalomethanes.' },
      { name: 'Arsenic', level: '0.002', unit: 'mg/L', epaLimit: '0.010', exceeds: false, category: 'Inorganic', about: 'A naturally occurring element that can enter groundwater.', note: 'Long-term exposure is a health concern; reverse osmosis reduces it well.' },
      { name: 'Nitrate', level: '0.90', unit: 'mg/L', epaLimit: '10', exceeds: false, category: 'Inorganic', about: 'A nutrient that enters water from fertilizer and runoff.', note: 'Especially important for infants; reverse osmosis is effective.' },
      { name: 'Total Coliform', level: 'Absent', unit: 'occurrences', epaLimit: '1', exceeds: false, category: 'Microbial', about: 'Bacteria used as an indicator of possible contamination.', note: 'Absence is a good sign that the distribution system is intact.' },
    ],
  },
}

// Bundled system coverage. In production this comes from EPA service-area data.
const MOCK_SYSTEMS: Array<{
  pwsid: string
  name: string
  state: string
  systemType: string
  populationServed: number
  serviceConnections: number
  boundarySource: string
  coverageArea: string
}> = [
  {
    pwsid: 'TNPW0001234',
    name: 'Metropolitan Nashville Department of Water Services',
    state: 'TN',
    systemType: 'Community Water System',
    populationServed: 650000,
    serviceConnections: 280000,
    boundarySource: 'EPA Community Water System service area layer',
    coverageArea: 'Nashville metro area (Davidson County and surrounding)',
  },
  {
    pwsid: 'TNPW0005678',
    name: 'Brentwood Water Department',
    state: 'TN',
    systemType: 'Community Water System',
    populationServed: 42000,
    serviceConnections: 16000,
    boundarySource: 'EPA Community Water System service area layer',
    coverageArea: 'Brentwood, TN (Williamson County)',
  },
  {
    pwsid: 'AZPW0009012',
    name: 'City of Phoenix Water Services Department',
    state: 'AZ',
    systemType: 'Community Water System',
    populationServed: 1600000,
    serviceConnections: 430000,
    boundarySource: 'EPA Community Water System service area layer',
    coverageArea: 'Phoenix, AZ metro (Maricopa County)',
  },
  {
    pwsid: 'MIPW0003456',
    name: 'Riverside Municipal Water Authority',
    state: 'MI',
    systemType: 'Community Water System',
    populationServed: 95000,
    serviceConnections: 34000,
    boundarySource: 'EPA Community Water System service area layer',
    coverageArea: 'Riverside, MI (regional river-fed system)',
  },
  {
    pwsid: 'ORPW0007890',
    name: 'Portland Water Bureau',
    state: 'OR',
    systemType: 'Community Water System',
    populationServed: 990000,
    serviceConnections: 190000,
    boundarySource: 'EPA Community Water System service area layer',
    coverageArea: 'Portland, OR metro (Bull Run watershed)',
  },
  {
    pwsid: 'TXPW0004567',
    name: 'Austin Water',
    state: 'TX',
    systemType: 'Community Water System',
    populationServed: 1030000,
    serviceConnections: 260000,
    boundarySource: 'EPA Community Water System service area layer',
    coverageArea: 'Austin, TX metro (Travis County)',
  },
]

export function fetchComplianceData(pwsid: string): ComplianceResult | null {
  return STUB_COMPLIANCE[pwsid] || null
}

export function lookupWaterSystem(pwsid: string): (typeof MOCK_SYSTEMS)[0] | null {
  return MOCK_SYSTEMS.find(s => s.pwsid === pwsid) || null
}

export function getMockSystems(): typeof MOCK_SYSTEMS {
  return MOCK_SYSTEMS
}
