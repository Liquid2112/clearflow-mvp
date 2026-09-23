/**
 * Utility functions for ClearFlow
 */

/**
 * Simple hash function for addresses (not cryptographically secure,
 * sufficient for deduplication in MVP)
 */
export function hashString(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Format a date string for display
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid date'
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return 'Invalid date'
  }
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Calculate a water quality score from contaminant data
 * Returns a score from 0-100 (higher is better)
 */
export function calculateWaterQualityScore(contaminants: Array<{ exceeds: boolean; level: string; epaLimit: string }>): number {
  if (!contaminants || contaminants.length === 0) return 100

  let totalRatio = 0
  let count = 0

  for (const c of contaminants) {
    const level = parseFloat(c.level)
    const limit = parseFloat(c.epaLimit)
    if (!isNaN(level) && !isNaN(limit) && limit > 0) {
      totalRatio += Math.min(level / limit, 2) // Cap ratio at 2x limit
      count++
    }
  }

  if (count === 0) return 100

  const avgRatio = totalRatio / count

  // Score: 100 - (avgRatio * 50), minimum 0
  // At 0% of limit: score 100
  // At 50% of limit: score 75
  // At 100% of limit: score 50
  // At 200%+ of limit: score 0
  const score = Math.max(0, 100 - (avgRatio * 50))
  return Math.round(score)
}

/**
 * Debounce a function call
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), wait)
  }
}

/**
 * Generate a random ID
 */
export function generateId(prefix: string = 'id'): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}_${timestamp}${random}`
}
