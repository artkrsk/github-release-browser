/**
 * Test Utilities & Mock Data Factories
 *
 * This file provides three main categories of utilities:
 *
 * 1. **Domain Entity Factories** - Use these to create mock GitHub entities
 *    - createMockAsset() - Creates IAsset objects
 *    - createMockRelease() - Creates IRelease objects
 *    - createMockRepo() - Creates IRepo objects
 *    - createMockBrowserConfig() - Creates IBrowserConfig objects
 *
 * 2. **Test Utilities** - Rendering and setup helpers
 *    - render() - Custom render with providers
 *    - setupTestEnvironment() - Configures window.githubReleaseBrowserConfig
 *    - mockWindowOpen - Mock for window.open
 *
 * 3. **Testing Library Re-exports** - Standard testing utilities
 *    - screen, waitFor, fireEvent, act, userEvent
 *
 * **Usage Guidelines:**
 * - ALWAYS use factories instead of creating inline mock objects
 * - Factories accept partial overrides via the overrides parameter
 * - For WordPress AJAX response wrappers, see tests/msw/factories.ts
 * - For integration test state mocks, see tests/ts/integration/__helpers__/
 */
import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'
import userEvent from '@testing-library/user-event'

// Global test setup utilities
export * from '@testing-library/react'
export { userEvent }

// Custom render function with WordPress context
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything from Testing Library
export { customRender as render }

// Unique ID counter for mock data generation
let mockAssetIdCounter = 1

/**
 * Domain Entity Factories
 *
 * These factories create realistic mock objects for GitHub API entities.
 * Always use these instead of creating inline objects to ensure consistency.
 */

/**
 * Creates a mock GitHub release asset
 *
 * @param overrides - Partial properties to override defaults
 * @returns IAsset object with realistic default values
 *
 * @example
 * const asset = createMockAsset({ name: 'my-plugin.zip', size: 2048 })
 */
export const createMockAsset = (overrides = {}) => ({
  url: `https://api.github.com/repos/owner/repo/releases/assets/${mockAssetIdCounter}`,
  id: mockAssetIdCounter++,
  name: 'test-file.zip',
  label: null,
  content_type: 'application/zip',
  state: 'uploaded',
  size: 1024,
  download_count: 10,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
})

/**
 * Creates a mock GitHub release
 *
 * @param overrides - Partial properties to override defaults
 * @returns IRelease object with one default asset included
 *
 * @example
 * const release = createMockRelease({
 *   tag_name: 'v2.0.0',
 *   assets: [createMockAsset(), createMockAsset()]
 * })
 */
export const createMockRelease = (overrides = {}) => ({
  url: 'https://api.github.com/repos/owner/repo/releases/1',
  html_url: 'https://github.com/owner/repo/releases/tag/v1.0.0',
  assets_url: 'https://api.github.com/repos/owner/repo/releases/1/assets',
  upload_url: 'https://uploads.github.com/repos/owner/repo/releases/1/assets',
  tarball_url: 'https://api.github.com/repos/owner/repo/tarball/v1.0.0',
  zipball_url: 'https://api.github.com/repos/owner/repo/zipball/v1.0.0',
  id: 1,
  tag_name: 'v1.0.0',
  target_commitish: 'main',
  name: 'Test Release',
  body: 'Test release notes',
  draft: false,
  prerelease: false,
  created_at: '2024-01-01T00:00:00Z',
  published_at: '2024-01-15T00:00:00Z',
  assets: [createMockAsset()],
  ...overrides
})

/**
 * Creates a mock GitHub repository
 *
 * @param overrides - Partial properties to override defaults
 * @returns IRepo object with complete owner information
 *
 * @example
 * const repo = createMockRepo({
 *   name: 'my-repo',
 *   full_name: 'owner/my-repo',
 *   stargazers_count: 500
 * })
 */
export const createMockRepo = (overrides = {}) => ({
  id: 1,
  name: 'test-repo',
  full_name: 'owner/test-repo',
  description: 'Test repository',
  html_url: 'https://github.com/owner/test-repo',
  private: false,
  stargazers_count: 10,
  watchers_count: 10,
  forks_count: 5,
  language: 'TypeScript',
  updated_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  pushed_at: '2024-01-01T00:00:00Z',
  default_branch: 'main',
  owner: {
    login: 'owner',
    id: 1,
    avatar_url: 'https://github.com/owner.png',
    gravatar_id: '',
    url: 'https://api.github.com/users/owner',
    html_url: 'https://github.com/owner',
    followers_url: 'https://api.github.com/users/owner/followers',
    following_url: 'https://api.github.com/users/owner/following{/other_user}',
    gists_url: 'https://api.github.com/users/owner/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/owner/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/owner/subscriptions',
    organizations_url: 'https://api.github.com/users/owner/orgs',
    repos_url: 'https://api.github.com/users/owner/repos',
    events_url: 'https://api.github.com/users/owner/events{/privacy}',
    received_events_url: 'https://api.github.com/users/owner/received_events',
    type: 'User',
    site_admin: false
  },
  ...overrides
})

/**
 * Creates a mock browser configuration object
 *
 * @param overrides - Partial properties to override defaults
 * @returns IBrowserConfig object with all required fields
 *
 * @example
 * const config = createMockBrowserConfig({
 *   apiUrl: 'https://custom.com/ajax',
 *   features: { useLatestRelease: false }
 * })
 */
export const createMockBrowserConfig = (overrides = {}) => ({
  apiUrl: 'https://example.com/wp-admin/admin-ajax.php',
  nonce: 'test-nonce-123',
  actionPrefix: 'github_release',
  onSelectAsset: vi.fn(),
  features: { useLatestRelease: true },
  upgradeUrl: 'https://example.com/upgrade',
  strings: {
    loading: 'Loading repositories...',
    selectRepo: 'Select Repository',
    insertIntoDownload: 'Insert into download',
    back: 'Back to repositories',
    refresh: 'Refresh repositories',
    search: 'Search repositories...',
    noResults: 'No repositories match your search',
    noRepos: 'No repositories found',
    welcomeTitle: 'Welcome to Release Browser',
    tokenSetupMessage: 'To browse and insert files from your GitHub releases, you need to configure your GitHub Personal Access Token.',
    invalidTokenTitle: 'Invalid GitHub Token',
    invalidTokenMessage: 'Your GitHub Personal Access Token is invalid or has been revoked. Please update your token in the settings.',
    tryAgain: 'Try Again',
    upgradeToPro: 'Upgrade to Pro',
    assetsIn: 'Assets in',
    latest: 'latest',
    noAssetsInRelease: 'No assets found in this release',
    releases: 'Releases',
    useLatestRelease: 'Use Latest Release',
    useLatestReleaseDesc: 'Automatically serve the latest published release',
    asset: 'asset',
    assets: 'assets',
    getPro: 'Get Pro'
  },
  ...overrides
})

// Mock window.open
export const mockWindowOpen = vi.fn()

beforeEach(() => {
  mockAssetIdCounter = 1  // Reset counter between tests
  Object.defineProperty(window, 'open', {
    value: mockWindowOpen,
    writable: true
  })
  vi.clearAllMocks()
})

/** Default localized strings for test environment */
const DEFAULT_TEST_STRINGS = {
  'actions.insertIntoDownload': 'Insert into download',
  'repositories.searchPlaceholder': 'Search repositories...',
  'repositories.select': 'Select Repository',
  'repositories.refresh': 'Refresh repositories',
  'repositories.noResults': 'No repositories match your search',
  'repositories.noneFound': 'No repositories found',
  'common.tryAgain': 'Try Again',
  'common.getPro': 'Get Pro',
  'common.upgradeToPro': 'Upgrade to Pro',
  'loading.repositories': 'Loading repositories...',
  'assets.backToRepos': 'Back to repositories',
  'assets.assetsIn': 'Assets in',
  'assets.latest': 'latest',
  'assets.noAssets': 'No assets found in this release',
  'assets.asset': 'asset',
  'assets.assets': 'assets',
  'releases.noReleases': 'No releases found.',
  'releases.createOne': 'Create one →',
  'releases.useLatest': 'Use Latest Release',
  'releases.latestDescription': 'Automatically serve the latest published release',
  'releases.title': 'Releases',
  'error.welcome.title': 'Welcome to Release Browser',
  'error.welcome.description': 'To browse and insert files from your GitHub releases, you need to configure your GitHub Personal Access Token.',
  'error.goToSettings': 'Go to Settings',
  'error.title.invalidToken': 'Invalid GitHub Token',
  'error.desc.invalidToken': 'Your GitHub Personal Access Token is invalid or has been revoked. Please update your token in the settings.'
}

// Setup test environment with mocked window.githubReleaseBrowserConfig
export const setupTestEnvironment = (config: Record<string, unknown> = {}) => {
  const defaultConfig = {
    apiUrl: 'https://example.com/wp-admin/admin-ajax.php',
    nonce: 'test-nonce-123',
    actionPrefix: 'github_release',
    onSelectAsset: vi.fn(),
    features: { useLatestRelease: true },
    upgradeUrl: 'https://example.com/upgrade',
    strings: DEFAULT_TEST_STRINGS,
    settingsUrl: 'https://example.com/settings'
  }

  const configStrings = config.strings as Record<string, string> | undefined

  // Merge config with defaults, preserving all default strings unless explicitly overridden
  const mergedConfig = {
    ...defaultConfig,
    ...config,
    strings: configStrings ? { ...DEFAULT_TEST_STRINGS, ...configStrings } : DEFAULT_TEST_STRINGS
  }

  Object.defineProperty(window, 'githubReleaseBrowserConfig', {
    value: mergedConfig,
    writable: true
  })
}

// Re-export testing utilities
export {
  screen,
  waitFor,
  fireEvent,
  act
} from '@testing-library/react'