// EPA and water quality data fetching for ClearFlow
// In production, replace with real EPA ECHO / SDWIS API calls

export interface ComplianceResult {
  status: 'no_recent_violation' | 'historical_violation' | 'monitoring_reporting_issue' | 'data_needs_review'
  waterSource: string | null
  lastReportDate: string | null
  ccrUrl: string | null
  contaminants: Array<{
    name: string
    level: string
    unit: string
    epaLimit: string
    exceeds: boolean
  }>
}

// Stub compliance data for known water systems
// In production, fetch from EPA ECHO API: https://echo.epa.gov/tools/data-downloads
const STUB_COMPLIANCE: Record<string, ComplianceResult> = {
  'TNPW0001234': {
    status: 'no_recent_violation',
    waterSource: 'Surface Water (Cumberland River)',
    lastReportDate: '2025-09-15',
    ccrUrl: 'https://example.com/ccr/tn-nashville-2025',
    contaminants: [
      { name: 'Lead', level: '0.002', unit: 'mg/L', epaLimit: '0.015', exceeds: false },
      { name: 'Copper', level: '0.120', unit: 'mg/L', epaLimit: '1.3', exceeds: false },
      { name: 'Total Trihalomethanes', level: '0.035', unit: 'mg/L', epaLimit: '0.080', exceeds: false },
      { name: 'Haloacetic Acids', level: '0.022', unit: 'mg/L', epaLimit: '0.060', exceeds: false },
      { name: 'Arsenic', level: '0.001', unit: 'mg/L', epaLimit: '0.010', exceeds: false },
      { name: 'Nitrate', level: '0.50', unit: 'mg/L', epaLimit: '10', exceeds: false },
      { name: 'Turbidity', level: '0.3', unit: 'NTU', epaLimit: '1.0', exceeds: false },
      { name: 'Total Coliform', level: ' Absent', unit: 'occurrences', epaLimit: '1', exceeds: false },
    ],
  },
  'TNPW0005678': {
    status: 'no_recent_violation',
    waterSource: 'Groundwater (Brentwood Aquifer)',
    lastReportDate: '2025-08-20',
    ccrUrl: 'https://example.com/ccr/tn-brentwood-2025',
    contaminants: [
      { name: 'Lead', level: '0.001', unit: 'mg/L', epaLimit: '0.015', exceeds: false },
      { name: 'Arsenic', level: '0.003', unit: 'mg/L', epaLimit: '0.010', exceeds: false },
      { name: 'Nitrate', level: '0.80', unit: 'mg/L', epaLimit: '10', exceeds: false },
      { name: 'Total Coliform', level: ' Absent', unit: 'occurrences', epaLimit: '1', exceeds: false },
    ],
  },
}

// Mock system coverage — in production this comes from EPA's service area data
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
