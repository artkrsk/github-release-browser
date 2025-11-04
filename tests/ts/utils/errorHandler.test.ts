import { describe, test, expect } from 'vitest'
import { handleApiError } from '@/utils/errorHandler'

describe('handleApiError utility', () => {
  test('returns error message when error has message property', () => {
    const error = new Error('Network connection failed')
    const result = handleApiError(error)

    expect(result).toBe('Network connection failed')
  })

  test('returns data.message when error has nested data.message', () => {
    const error = {
      data: {
        message: 'Invalid API credentials'
      }
    }
    const result = handleApiError(error)

    expect(result).toBe('Invalid API credentials')
  })

  test('prefers direct message over nested data.message', () => {
    const error = {
      message: 'Direct error message',
      data: {
        message: 'Nested error message'
      }
    }
    const result = handleApiError(error)

    expect(result).toBe('Direct error message')
  })

  test('returns default message when no error message is found', () => {
    const error = {
      code: 'UNKNOWN_ERROR',
      status: 500
    }
    const result = handleApiError(error, 'Default error message')

    expect(result).toBe('Default error message')
  })

  test('uses built-in default message when none provided', () => {
    const error = {
      code: 'UNKNOWN_ERROR',
      status: 500
    }
    const result = handleApiError(error)

    expect(result).toBe('An error occurred')
  })

  test('handles null error', () => {
    const result = handleApiError(null, 'Null error message')

    expect(result).toBe('Null error message')
  })

  test('handles undefined error', () => {
    const result = handleApiError(undefined, 'Undefined error message')

    expect(result).toBe('Undefined error message')
  })

  test('handles empty object error', () => {
    const error = {}
    const result = handleApiError(error, 'Empty object error')

    expect(result).toBe('Empty object error')
  })

  test('handles string error', () => {
    const error = 'String error message'
    const result = handleApiError(error)

    // String doesn't have message property, so should return default
    expect(result).toBe('An error occurred')
  })

  test('handles error with empty message string', () => {
    const error = {
      message: ''
    }
    const result = handleApiError(error, 'Empty message fallback')

    expect(result).toBe('Empty message fallback')
  })

  test('handles error with nested empty data.message', () => {
    const error = {
      data: {
        message: ''
      }
    }
    const result = handleApiError(error, 'Nested empty message fallback')

    expect(result).toBe('Nested empty message fallback')
  })

  test('handles complex API response error', () => {
    const error = {
      response: {
        data: {
          message: 'API rate limit exceeded'
        },
        status: 429
      }
    }
    const result = handleApiError(error)

    // Should return default since it doesn't match expected structure
    expect(result).toBe('An error occurred')
  })

  test('handles GitHub API error format', () => {
    const error = {
      message: 'Bad credentials',
      data: {
        message: 'GitHub API token is invalid'
      }
    }
    const result = handleApiError(error, 'GitHub API error')

    expect(result).toBe('Bad credentials')
  })
})