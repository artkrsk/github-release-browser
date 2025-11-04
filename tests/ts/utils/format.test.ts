import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatFileSize, formatDate, formatRelativeTime } from '@/utils/format'

describe('formatFileSize utility', () => {
  test('formats bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0 B')
    expect(formatFileSize(1024)).toBe('1.00 KB')
    expect(formatFileSize(1048576)).toBe('1.00 MB')
    expect(formatFileSize(1073741824)).toBe('1.00 GB')
  })

  test('handles decimal places', () => {
    expect(formatFileSize(1536)).toBe('1.50 KB') // 1.5 * 1024
    expect(formatFileSize(2560)).toBe('2.50 KB') // 2.5 * 1024
  })

  test('handles edge cases', () => {
    expect(formatFileSize(1023)).toBe('1023.00 B') // Just under 1KB
    expect(formatFileSize(1025)).toBe('1.00 KB') // Just over 1KB
  })

  test('handles large numbers', () => {
    expect(formatFileSize(5368709120)).toBe('5.00 GB') // 5 * 1024^3
    expect(formatFileSize(1099511627776)).toBe('1.00 TB') // 1 TB
  })
})

describe('formatDate utility', () => {
  test('formats date string to locale date', () => {
    // Test with a known date
    const dateString = '2024-01-15T10:30:00Z'
    const result = formatDate(dateString)

    // Result should be a localized date string
    expect(result).toMatch(/1\/15\/2024|15\/1\/2024|Jan.*15.*2024|15.*Jan.*2024/)
  })

  test('handles invalid date strings', () => {
    const invalidDate = 'invalid-date'
    const result = formatDate(invalidDate)

    // Should still return something (toLocaleDateString handles invalid dates)
    expect(typeof result).toBe('string')
  })

  test('handles empty string', () => {
    const result = formatDate('')
    expect(typeof result).toBe('string')
  })

  test('handles ISO dates with time zones', () => {
    const dateString = '2024-12-31T23:59:59-05:00'
    const result = formatDate(dateString)
    expect(typeof result).toBe('string')
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}.*\d{1,2}.*\d{4}/)
  })
})

describe('formatRelativeTime utility', () => {
  beforeEach(() => {
    // Mock Date.now() for consistent testing
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('shows "today" for current date', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    vi.setSystemTime(now)

    const dateString = '2024-01-15T10:30:00Z'
    const result = formatRelativeTime(dateString)

    expect(result).toBe('today')
  })

  test('shows "yesterday" for previous day', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    vi.setSystemTime(now)

    const dateString = '2024-01-14T12:00:00Z'
    const result = formatRelativeTime(dateString)

    expect(result).toBe('yesterday')
  })

  test('shows "X days ago" for recent days', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    vi.setSystemTime(now)

    // Test 2 days ago
    const dateString = '2024-01-13T12:00:00Z'
    const result = formatRelativeTime(dateString)

    expect(result).toBe('2 days ago')
  })

  test('shows "X weeks ago" for recent weeks', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    vi.setSystemTime(now)

    // Test 2 weeks ago (14 days)
    const dateString = '2024-01-01T12:00:00Z'
    const result = formatRelativeTime(dateString)

    expect(result).toBe('2 weeks ago')
  })

  test('shows "X months ago" for recent months', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    vi.setSystemTime(now)

    // Test 2 months ago (~60 days)
    const dateString = '2023-11-15T12:00:00Z'
    const result = formatRelativeTime(dateString)

    expect(result).toBe('2 months ago')
  })

  test('shows "X years ago" for old dates', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    vi.setSystemTime(now)

    // Test 2 years ago
    const dateString = '2022-01-15T12:00:00Z'
    const result = formatRelativeTime(dateString)

    expect(result).toBe('2 years ago')
  })

  test('handles edge case - exactly 7 days ago', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    vi.setSystemTime(now)

    // Exactly 7 days ago falls into the months range (>= 30 days calculation)
    const dateString = '2024-01-08T12:00:00Z'
    const result = formatRelativeTime(dateString)

    expect(result).toBe('1 weeks ago')
  })

  test('handles edge case - exactly 30 days ago', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    vi.setSystemTime(now)

    // Exactly 30 days ago falls into the months range
    const dateString = '2023-12-16T12:00:00Z'
    const result = formatRelativeTime(dateString)

    expect(result).toBe('1 months ago')
  })

  test('handles edge case - exactly 365 days ago', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    vi.setSystemTime(now)

    // Exactly 365 days ago falls into the years range
    const dateString = '2023-01-15T12:00:00Z'
    const result = formatRelativeTime(dateString)

    expect(result).toBe('1 years ago')
  })

  test('handles future dates gracefully', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    vi.setSystemTime(now)

    // Future date (negative diffDays)
    const dateString = '2024-01-20T12:00:00Z'
    const result = formatRelativeTime(dateString)

    // Future dates with negative diffDays will be calculated as negative days
    expect(result).toBe('-5 days ago')
  })
})
