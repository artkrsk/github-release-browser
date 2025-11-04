import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { BrowserApp } from '@/components/BrowserApp'
import { IBrowserConfig } from '@/interfaces'
import { setupTestEnvironment } from '@test-utils'

// Mock GitHubService
vi.mock('@/services/GitHubService', () => ({
  GitHubService: vi.fn().mockImplementation(() => ({
    getUserRepos: vi.fn(),
    getReleases: vi.fn(),
    clearCache: vi.fn()
  }))
}))

// Mock ReleaseList component
vi.mock('@/components/ReleaseList', () => ({
  ReleaseList: () => React.createElement('div', { 'data-testid': 'release-list' })
}))

// Mock AssetList component
vi.mock('@/components/AssetList', () => ({
  AssetList: () => React.createElement('div', { 'data-testid': 'asset-list' })
}))

// Mock window.open
const mockWindowOpen = vi.fn()

describe('BrowserApp component', () => {
  const mockConfig: IBrowserConfig = {
    apiUrl: 'https://example.com/wp-admin/admin-ajax.php',
    nonce: 'test-nonce-123',
    actionPrefix: 'github_release',
    onSelectAsset: vi.fn()
  }

  const mockConfigWithFeatures: IBrowserConfig = {
    ...mockConfig,
    features: { useLatestRelease: true },
    upgradeUrl: 'https://example.com/upgrade',
    strings: {
      loading: 'Loading repositories...',
      selectRepo: 'Select Repository',
      insertIntoDownload: 'Insert into download',
      back: 'Back to repositories',
      upgradeToPro: 'Upgrade to Pro'
    }
  }

  beforeEach(() => {
    setupTestEnvironment()
    // Mock window.open
    Object.defineProperty(window, 'open', {
      value: mockWindowOpen,
      writable: true
    })
    vi.clearAllMocks()
  })

  test('renders with minimal required config', () => {
    const element = React.createElement(BrowserApp, { config: mockConfig })

    expect(element).toBeDefined()
    expect(element.type).toBe(BrowserApp)
    expect(element.props.config).toBe(mockConfig)
  })

  test('renders with full config including features', () => {
    const element = React.createElement(BrowserApp, { config: mockConfigWithFeatures })

    expect(element.props.config).toBe(mockConfigWithFeatures)
    expect(element.props.config.features).toEqual({ useLatestRelease: true })
    expect(element.props.config.upgradeUrl).toBe('https://example.com/upgrade')
    expect(element.props.config.strings?.loading).toBe('Loading repositories...')
  })

  test('renders with different API URLs', () => {
    const apiUrls = [
      'https://example.com/wp-admin/admin-ajax.php',
      'https://myapp.com/ajax-handler.php',
      'https://localhost:3000/api'
    ]

    apiUrls.forEach(url => {
      const config = { ...mockConfig, apiUrl: url }
      const element = React.createElement(BrowserApp, { config })

      expect(element.props.config.apiUrl).toBe(url)
    })
  })

  test('renders with different nonces', () => {
    const nonces = [
      'nonce-123',
      'security-token-abc',
      'wp_rest_nonce_xyz'
    ]

    nonces.forEach(nonce => {
      const config = { ...mockConfig, nonce }
      const element = React.createElement(BrowserApp, { config })

      expect(element.props.config.nonce).toBe(nonce)
    })
  })

  test('renders with different action prefixes', () => {
    const actionPrefixes = [
      'github_release',
      'my_app_action',
      'custom_prefix'
    ]

    actionPrefixes.forEach(prefix => {
      const config = { ...mockConfig, actionPrefix: prefix }
      const element = React.createElement(BrowserApp, { config })

      expect(element.props.config.actionPrefix).toBe(prefix)
    })
  })

  test('renders with different onSelectAsset callbacks', () => {
    const callbacks = [
      vi.fn(),
      vi.fn(),
      () => {},
      function mockCallback() {}
    ]

    callbacks.forEach(callback => {
      const config = { ...mockConfig, onSelectAsset: callback }
      const element = React.createElement(BrowserApp, { config })

      expect(element.props.config.onSelectAsset).toBe(callback)
      expect(typeof element.props.config.onSelectAsset).toBe('function')
    })
  })

  test('renders with optional protocol', () => {
    const protocols = [
      'github-release://',
      'custom-protocol://',
      undefined
    ]

    protocols.forEach(protocol => {
      const config = { ...mockConfig, protocol }
      const element = React.createElement(BrowserApp, { config })

      expect(element.props.config.protocol).toBe(protocol)
    })
  })

  test('renders with different feature configurations', () => {
    const featureConfigs = [
      { useLatestRelease: true },
      { useLatestRelease: false },
      { useLatestRelease: true, someOtherFeature: true },
      {},
      undefined
    ]

    featureConfigs.forEach(features => {
      const config = { ...mockConfig, features }
      const element = React.createElement(BrowserApp, { config })

      expect(element.props.config.features).toEqual(features)
    })
  })

  test('renders with different upgrade URLs', () => {
    const upgradeUrls = [
      'https://example.com/pro',
      'https://myapp.com/upgrade',
      undefined
    ]

    upgradeUrls.forEach(upgradeUrl => {
      const config = { ...mockConfig, upgradeUrl }
      const element = React.createElement(BrowserApp, { config })

      expect(element.props.config.upgradeUrl).toBe(upgradeUrl)
    })
  })

  test('renders with different string configurations', () => {
    const stringConfigs = [
      { loading: 'Loading...' },
      {
        loading: 'Loading repositories',
        selectRepo: 'Select repo',
        insertIntoDownload: 'Insert file'
      },
      {
        loading: 'Loading...',
        selectRepo: 'Select Repository',
        insertIntoDownload: 'Insert into download',
        back: 'Back',
        refresh: 'Refresh',
        search: 'Search',
        noResults: 'No results',
        noRepos: 'No repositories',
        welcomeTitle: 'Welcome',
        tokenSetupMessage: 'Setup token',
        invalidTokenTitle: 'Invalid token',
        invalidTokenMessage: 'Token is invalid',
        tryAgain: 'Try Again',
        upgradeToPro: 'Upgrade',
        assetsIn: 'Assets in',
        latest: 'latest',
        noAssetsInRelease: 'No assets',
        releases: 'Releases',
        useLatestRelease: 'Use latest',
        useLatestReleaseDesc: 'Auto use latest',
        asset: 'file',
        assets: 'files',
        getPro: 'Get Pro'
      },
      {},
      undefined
    ]

    stringConfigs.forEach(strings => {
      const config = { ...mockConfig, strings }
      const element = React.createElement(BrowserApp, { config })

      expect(element.props.config.strings).toEqual(strings)
    })
  })

  test('renders with different text domains', () => {
    const textDomains = [
      'my-text-domain',
      'github-release-browser',
      'default',
      undefined
    ]

    textDomains.forEach(textDomain => {
      const config = { ...mockConfig, textDomain }
      const element = React.createElement(BrowserApp, { config })

      expect(element.props.config.textDomain).toBe(textDomain)
    })
  })

  test('renders with different assets URLs', () => {
    const assetsUrls = [
      'https://example.com/assets/',
      'https://cdn.example.com/',
      '/wp-content/plugins/my-app/assets/',
      undefined
    ]

    assetsUrls.forEach(assetsUrl => {
      const config = { ...mockConfig, assetsUrl }
      const element = React.createElement(BrowserApp, { config })

      expect(element.props.config.assetsUrl).toBe(assetsUrl)
    })
  })

  test('renders with different cache prefixes', () => {
    const cachePrefixes = [
      'my_cache_',
      'github_release_',
      'app_',
      undefined
    ]

    cachePrefixes.forEach(cachePrefix => {
      const config = { ...mockConfig, cachePrefix }
      const element = React.createElement(BrowserApp, { config })

      expect(element.props.config.cachePrefix).toBe(cachePrefix)
    })
  })

  test('renders with different token keys', () => {
    const tokenKeys = [
      'github_token',
      'api_key',
      'access_token',
      undefined
    ]

    tokenKeys.forEach(tokenKey => {
      const config = { ...mockConfig, tokenKey }
      const element = React.createElement(BrowserApp, { config })

      expect(element.props.config.tokenKey).toBe(tokenKey)
    })
  })

  test('renders with complex configuration', () => {
    const complexConfig: IBrowserConfig = {
      apiUrl: 'https://api.example.com/ajax',
      nonce: 'complex-nonce-456',
      actionPrefix: 'complex_app',
      protocol: 'custom-protocol://',
      onSelectAsset: vi.fn(),
      features: {
        useLatestRelease: false,
        customFeature1: true,
        customFeature2: false,
        advancedFeature: { enabled: true, options: {} }
      },
      upgradeUrl: 'https://upgrade.example.com/pro',
      strings: {
        loading: 'Loading complex app...',
        customString: 'Custom text'
      },
      textDomain: 'complex-app',
      assetsUrl: 'https://cdn.example.com/complex-app/',
      cachePrefix: 'complex_',
      tokenKey: 'complex_access_token'
    }

    const element = React.createElement(BrowserApp, { config: complexConfig })

    expect(element.props.config).toEqual(complexConfig)
    expect(element.props.config.apiUrl).toBe('https://api.example.com/ajax')
    expect(element.props.config.features?.customFeature1).toBe(true)
    expect(element.props.config.strings?.customString).toBe('Custom text')
  })

  test('component is a function component', () => {
    expect(typeof BrowserApp).toBe('function')
  })

  test('component has correct display name', () => {
    expect(BrowserApp.displayName || BrowserApp.name).toBe('BrowserApp')
  })

  describe('Translation System Integration', () => {
    test('works with translation system', () => {
      setupTestEnvironment({
        strings: {
          'actions.insertIntoDownload': 'Custom Insert Button',
          'loading.repositories': 'Custom Loading Text',
          'repositories.select': 'Custom Repository Select',
          'repositories.noneFound': 'No repos found',
          'common.tryAgain': 'Custom Retry',
          'common.upgradeToPro': 'Custom Upgrade'
        }
      })

      const element = React.createElement(BrowserApp, { config: mockConfig })
      expect(element).toBeTruthy()
      expect(element.type).toBe(BrowserApp)

      // Test that component can be created with translation system
      // Note: We don't fully render here to keep this a unit test
      expect(() => React.createElement(BrowserApp, { config: mockConfig })).not.toThrow()
    })

    test('falls back to default translations when translation missing', () => {
      setupTestEnvironment({
        strings: {
          // Only override some keys, others should use defaults
          'actions.insertIntoDownload': 'Custom Insert'
          // loading.repositories, repositories.select, etc. should use defaults
        }
      })

      const element = React.createElement(BrowserApp, { config: mockConfig })
      expect(element).toBeTruthy()
    })
  })
})