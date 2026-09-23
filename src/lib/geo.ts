// Geocoding support for ClearFlow
// In production, replace with a real geocoding service (Google Maps, Mapbox, OpenStreetMap Nominatim, etc.)

export interface GeoResult {
  lat: number
  lng: number
  formatted_address: string
}

// Stub geocoding: returns Nashville-area coordinates for known ZIP codes
// In production, call a geocoding API
const STUB_ZIPS: Record<string, { lat: number; lng: number; city: string; state: string }> = {
  '37013': { lat: 36.301, lng: -86.771, city: 'Goodlettsville', state: 'TN' },
  '37201': { lat: 36.162, lng: -86.781, city: 'Nashville', state: 'TN' },
  '37203': { lat: 36.151, lng: -86.809, city: 'Nashville', state: 'TN' },
  '37204': { lat: 36.171, lng: -86.683, city: 'Nashville', state: 'TN' },
  '37206': { lat: 36.182, lng: -86.742, city: 'Nashville', state: 'TN' },
  '37208': { lat: 36.215, lng: -86.684, city: 'Antioch', state: 'TN' },
  '37210': { lat: 36.223, lng: -86.781, city: 'Nashville', state: 'TN' },
  '37211': { lat: 36.191, lng: -86.831, city: 'Nashville', state: 'TN' },
  '37212': { lat: 36.201, lng: -86.702, city: 'Nashville', state: 'TN' },
  '37213': { lat: 36.241, lng: -86.751, city: 'Nashville', state: 'TN' },
  '37214': { lat: 36.192, lng: -86.901, city: 'Nashville', state: 'TN' },
  '37215': { lat: 36.251, lng: -86.832, city: 'Nashville', state: 'TN' },
  '37216': { lat: 36.271, lng: -86.721, city: 'Nashville', state: 'TN' },
  '37217': { lat: 36.161, lng: -86.651, city: 'Nashville', state: 'TN' },
  '37218': { lat: 36.202, lng: -86.881, city: 'Nashville', state: 'TN' },
  '37220': { lat: 36.231, lng: -86.712, city: 'Nashville', state: 'TN' },
  '37221': { lat: 36.211, lng: -86.652, city: 'Nashville', state: 'TN' },
  '37228': { lat: 36.291, lng: -86.801, city: 'Nashville', state: 'TN' },
  '37229': { lat: 36.301, lng: -86.771, city: 'Goodlettsville', state: 'TN' },
  '37232': { lat: 36.281, lng: -86.851, city: 'Nashville', state: 'TN' },
  '37235': { lat: 36.311, lng: -86.741, city: 'Nashville', state: 'TN' },
  '37237': { lat: 36.331, lng: -86.711, city: 'Madison', state: 'TN' },
  '37243': { lat: 36.351, lng: -86.791, city: 'Hendersonville', state: 'TN' },
  '37245': { lat: 36.371, lng: -86.761, city: 'Hermitage', state: 'TN' },
}

export function geocodeAddress(address: string): GeoResult | null {
  // Try to extract ZIP code from address
  const zipMatch = address.match(/\b(\d{5})\b/)
  if (zipMatch && STUB_ZIPS[zipMatch[1]]) {
    const z = STUB_ZIPS[zipMatch[1]]
    return {
      lat: z.lat,
      lng: z.lng,
      formatted_address: `${z.city}, ${z.state} ${zipMatch[1]}`,
    }
  }

  // Try to extract city/state
  const cityStateMatch = address.match(/,?\s+([A-Za-z\s]+),\s*([A-Z]{2})\b/)
  if (cityStateMatch) {
    const city = cityStateMatch[1].trim()
    const state = cityStateMatch[2]
    // Return approximate center for known cities
    if (city.toLowerCase().includes('nashville') && state === 'TN') {
      return { lat: 36.162, lng: -86.781, formatted_address: 'Nashville, TN' }
    }
    if (city.toLowerCase().includes('brentwood') && state === 'TN') {
      return { lat: 35.982, lng: -86.737, formatted_address: 'Brentwood, TN' }
    }
    if (city.toLowerCase().includes('antioch') && state === 'TN') {
      return { lat: 36.090, lng: -86.711, formatted_address: 'Antioch, TN' }
    }
  }

  // Try full street address parsing (very basic)
  const streetMatch = address.match(/^(\d+\s+[A-Za-z\s]+),\s*([A-Za-z\s]+),\s*([A-Z]{2})\s*(\d{5})?$/)
  if (streetMatch) {
    const street = streetMatch[1].trim()
    const city = streetMatch[2].trim()
    const state = streetMatch[3]
    const zip = streetMatch[4] || null

    if (city.toLowerCase().includes('nashville') && state === 'TN') {
      return { lat: 36.162, lng: -86.781, formatted_address: `${street}, Nashville, TN${zip ? ` ${zip}` : ''}` }
    }
  }

  return null
}

// Point-in-polygon test for matching coordinates to water system boundaries
export function pointInPolygon(
  lat: number,
  lng: number,
  polygon: Array<{ lat: number; lng: number }>
): boolean {
  let inside = false
  const n = polygon.length

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].lng,
      yi = polygon[i].lat
    const xj = polygon[j].lng,
      yj = polygon[j].lat

    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)

    if (intersect) inside = !inside
  }

  return inside
}

// Haversine distance in miles
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959 // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Mock water system boundaries for Nashville area systems
// In production, use real EPA service area polygons
const MOCK_BOUNDARIES: Record<string, Array<{ lat: number; lng: number }>> = {
  'TNPW0001234': [
    { lat: 36.0, lng: -87.0 },
    { lat: 36.5, lng: -87.0 },
    { lat: 36.5, lng: -86.5 },
    { lat: 36.0, lng: -86.5 },
  ],
  'TNPW0005678': [
    { lat: 35.9, lng: -86.9 },
    { lat: 36.1, lng: -86.9 },
    { lat: 36.1, lng: -86.6 },
    { lat: 35.9, lng: -86.6 },
  ],
}

export function matchWaterSystem(
  lat: number,
  lng: number
): {
  pwsid: string
  name: string
  state: string
  system_type: string
  population_served: number
  service_connections: number
  boundary_source: string
  coverage_area: string
  match_confidence: 'High' | 'Medium' | 'Low'
} | null {
  // Find which system boundary contains the point
  for (const [pwsid, polygon] of Object.entries(MOCK_BOUNDARIES)) {
    if (pointInPolygon(lat, lng, polygon)) {
      // Return system info (in production, fetch from EPA)
      const systems = {
        'TNPW0001234': {
          pwsid: 'TNPW0001234',
          name: 'Metropolitan Nashville Department of Water Services',
          state: 'TN',
          system_type: 'Community Water System',
          population_served: 650000,
          service_connections: 280000,
          boundary_source: 'EPA Community Water System service area layer',
          coverage_area: 'Nashville metro area (Davidson County and surrounding)',
          match_confidence: 'High' as const,
        },
        'TNPW0005678': {
          pwsid: 'TNPW0005678',
          name: 'Brentwood Water Department',
          state: 'TN',
          system_type: 'Community Water System',
          population_served: 42000,
          service_connections: 16000,
          boundary_source: 'EPA Community Water System service area layer',
          coverage_area: 'Brentwood, TN (Williamson County)',
          match_confidence: 'High' as const,
        },
      }
      return systems[pwsid as keyof typeof systems] || null
    }
  }
  return null
}
