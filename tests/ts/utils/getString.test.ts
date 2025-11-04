import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { getString } from '@/utils/getString'

describe('getString utility', () => {
  beforeEach(() => {
    // Clear any existing global config
    delete (window as any).githubReleaseBrowserConfig
  })

  afterEach(() => {
    // Clean up after each test
    delete (window as any).githubReleaseBrowserConfig
  })

  test('returns translation from global config when available', () => {
    ;(window as any).githubReleaseBrowserConfig = {
      strings: {
        'repositories.select': 'Custom Repository Select'
      }
    }

    expect(getString('repositories.select')).toBe('Custom Repository Select')
  })

  test('falls back to default translation when global config is missing', () => {
    expect(getString('repositories.select')).toBe('Select Repository')
  })

  test('falls back to default translation when key not in global config', () => {
    ;(window as any).githubReleaseBrowserConfig = {
      strings: {
        'some.other.key': 'Some other value'
      }
    }

    expect(getString('repositories.select')).toBe('Select Repository')
  })

  test('returns the key when translation is not found in fallbacks', () => {
    expect(getString('nonexistent.key')).toBe('nonexistent.key')
  })

  test('handles empty global config gracefully', () => {
    ;(window as any).githubReleaseBrowserConfig = {}

    expect(getString('repositories.select')).toBe('Select Repository')
  })

  test('handles null global config gracefully', () => {
    ;(window as any).githubReleaseBrowserConfig = null

    expect(getString('repositories.select')).toBe('Select Repository')
  })

  test('handles undefined global config gracefully', () => {
    ;(window as any).githubReleaseBrowserConfig = undefined

    expect(getString('repositories.select')).toBe('Select Repository')
  })

  test('handles global config with null strings gracefully', () => {
    ;(window as any).githubReleaseBrowserConfig = {
      strings: {
        'repositories.select': null
      }
    }

    expect(getString('repositories.select')).toBe('Select Repository')
  })

  test('works with all available translation keys', () => {
    // Test a few common keys to ensure they all work
    expect(getString('repositories.select')).toBe('Select Repository')
    expect(getString('repositories.refresh')).toBe('Refresh repositories')
    expect(getString('repositories.searchPlaceholder')).toBe('Search repositories...')
    expect(getString('loading.repositories')).toBe('Loading repositories...')
    expect(getString('common.tryAgain')).toBe('Try Again')
    expect(getString('actions.insertIntoDownload')).toBe('Insert into download')
    expect(getString('releases.title')).toBe('Releases')
    expect(getString('assets.latest')).toBe('latest')
    expect(getString('assets.noAssets')).toBe('No assets found in this release')
    expect(getString('error.welcome.title')).toBe('Welcome to Release Browser')
    expect(getString('time.today')).toBe('today')
    expect(getString('time.daysAgo')).toBe('%d days ago')
  })
})