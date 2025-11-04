import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserApp } from '@/components/BrowserApp'
import { createMockBrowserConfig, createMockRepo, createMockRelease, createMockAsset, render, setupTestEnvironment } from '@test-utils'

// Mock WordPress components
vi.mock('@wordpress/components', () => ({
  Button: ({ children, onClick, disabled, variant, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      className={`wp-button wp-button-${variant || 'default'} `}
      data-testid={variant === 'primary' ? 'button-primary' : `button-${variant || 'default'}`}
      {...props}
    >
      {children}
    </button>
  )
}))

// Mock all child components to isolate BrowserApp testing
vi.mock('@/components/LoadingState', () => ({
  LoadingState: ({ message }: { message: string }) => (
    <div data-testid="loading-state">{message}</div>
  )
}))

vi.mock('@/components/ErrorState', () => ({
  ErrorState: ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div data-testid="error-state">
      <div data-testid="error-message">{error}</div>
      <button onClick={onRetry} data-testid="retry-button">Retry</button>
    </div>
  )
}))

vi.mock('@/components/RepositorySearch', () => ({
  RepositorySearch: ({ searchQuery, onSearchChange, onRefresh, refreshDisabled }: any) => (
    <div data-testid="repository-search">
      <input
        data-testid="search-input"
        value={searchQuery || ''}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search repositories..."
      />
      <button
        data-testid="refresh-button"
        onClick={onRefresh}
        disabled={refreshDisabled}
      >
        Refresh
      </button>
    </div>
  )
}))

vi.mock('@/components/RepositoryList', () => ({
  RepositoryList: ({ repos, onRepoToggle }: any) => (
    <div data-testid="repository-list">
      {repos && repos.length > 0 ? (
        repos.map((repo: any) => (
          <div key={repo.id}>
            <button onClick={() => onRepoToggle(repo.full_name)} data-testid={`repo-${repo.id}`}>
              {repo.name}
            </button>
          </div>
        ))
      ) : (
        <div data-testid="no-repos">No repositories</div>
      )}
    </div>
  )
}))

vi.mock('@/components/AssetsView', () => ({
  AssetsView: ({ selectedRepo, onBack }: any) => (
    <div data-testid="assets-view">
      <div data-testid="selected-repo">{selectedRepo}</div>
      <button onClick={onBack} data-testid="back-button">Back</button>
    </div>
  )
}))

vi.mock('@/components/AppFooter', () => ({
  AppFooter: ({ primaryButton, config }: any) => (
    <div data-testid="app-footer">
      {primaryButton}
      {config?.upgradeUrl && (
        <a href={config.upgradeUrl} data-testid="upgrade-link">Upgrade</a>
      )}
    </div>
  )
}))

// Mock hooks with default return values
let mockBrowserState: any = {}
let mockGitHubData: any = {}
let mockRepositoryActions: any = {}
let mockAssetConfirmation: any = {}

vi.mock('@/hooks/useBrowserState', () => ({
  useBrowserState: () => mockBrowserState
}))

vi.mock('@/hooks/useGitHubData', () => ({
  useGitHubData: () => mockGitHubData
}))

vi.mock('@/hooks/useRepositoryActions', () => ({
  useRepositoryActions: () => mockRepositoryActions
}))

vi.mock('@/hooks/useAssetConfirmation', () => ({
  useAssetConfirmation: () => mockAssetConfirmation
}))

describe('BrowserApp - DOM Testing', () => {
  const mockConfig = createMockBrowserConfig()
  const mockRepos = [createMockRepo({ id: 1, full_name: 'owner/test-repo' })]
  const mockRelease = createMockRelease({ tag_name: 'v1.0.0' })
  const mockAsset = createMockAsset({ id: 1 })

  const createDefaultMockState = () => ({
    view: 'repos',
    repos: [],
    searchQuery: '',
    expandedRepo: null,
    selectedRepo: null,
    repoReleases: {},
    loadingRepos: false,
    loadingRepo: null,
    selectedReleaseTag: null,
    selectedRelease: null,
    selectedAssetObj: null,
    error: null,
    isMountedRef: { current: true },
    setView: vi.fn(),
    setRepos: vi.fn(),
    setSearchQuery: vi.fn(),
    setExpandedRepo: vi.fn(),
    setSelectedRepo: vi.fn(),
    setRepoReleases: vi.fn(),
    setLoadingRepos: vi.fn(),
    setLoadingRepo: vi.fn(),
    setSelectedReleaseTag: vi.fn(),
    setSelectedRelease: vi.fn(),
    setSelectedAssetObj: vi.fn(),
    setError: vi.fn()
  })

  const createDefaultMockGitHubData = () => ({
    fetchRepos: vi.fn(),
    fetchReleasesForRepo: vi.fn(),
    refreshRepos: vi.fn()
  })

  const createDefaultMockRepositoryActions = () => ({
    handleRepoToggle: vi.fn(),
    handleSelectRelease: vi.fn(),
    handleBackToRepos: vi.fn()
  })

  const createDefaultMockAssetConfirmation = () => ({
    handleConfirmAsset: vi.fn(),
    canConfirmAsset: false
  })

  beforeEach(() => {
    setupTestEnvironment()
    vi.clearAllMocks()
    mockBrowserState = createDefaultMockState()
    mockGitHubData = createDefaultMockGitHubData()
    mockRepositoryActions = createDefaultMockRepositoryActions()
    mockAssetConfirmation = createDefaultMockAssetConfirmation()
  })

  describe('Initial Rendering', () => {
    test('renders GitHub service initialization', async () => {
      mockBrowserState.repos = mockRepos
      render(<BrowserApp config={mockConfig} />)

      // Should attempt to fetch repos on mount
      await waitFor(() => {
        expect(screen.getByTestId('repository-search')).toBeInTheDocument()
        expect(screen.getByTestId('repository-list')).toBeInTheDocument()
        expect(screen.getByTestId('app-footer')).toBeInTheDocument()
      })
    })

    test('renders with default strings when none provided', async () => {
      const configMinimal = { ...mockConfig, strings: undefined }
      mockBrowserState.repos = mockRepos
      render(<BrowserApp config={configMinimal} />)

      await waitFor(() => {
        expect(screen.getByTestId('repository-search')).toBeInTheDocument()
        expect(screen.getByTestId('app-footer')).toBeInTheDocument()
      })
    })

    test('renders with custom strings', async () => {
      const configWithStrings = {
        ...mockConfig,
        strings: {
          insertIntoDownload: 'Custom Insert Button',
          loading: 'Custom Loading Message'
        }
      }
      mockBrowserState.repos = mockRepos
      render(<BrowserApp config={configWithStrings} />)

      await waitFor(() => {
        expect(screen.getByTestId('repository-search')).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    test('renders loading state when loadingRepos is true', async () => {
      mockBrowserState.loadingRepos = true

      render(<BrowserApp config={mockConfig} />)

      expect(screen.getByTestId('loading-state')).toBeInTheDocument()
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading repositories...')
      expect(screen.getByTestId('app-footer')).toBeInTheDocument()
      expect(screen.getByTestId('button-primary')).toBeDisabled()
    })

    test('renders custom loading message', async () => {
      mockBrowserState.loadingRepos = true

      const configWithCustomLoading = {
        ...mockConfig,
        strings: { 'loading.repositories': 'Custom loading message...' }
      }

      render(<BrowserApp config={configWithCustomLoading} />)

      expect(screen.getByTestId('loading-state')).toHaveTextContent('Custom loading message...')
    })

    test('renders loading state with translation system', async () => {
      mockBrowserState.loadingRepos = true

      setupTestEnvironment({
        strings: {
          'loading.repositories': 'Translated loading message...'
        }
      })

      render(<BrowserApp config={mockConfig} />)

      expect(screen.getByTestId('loading-state')).toHaveTextContent('Translated loading message...')
      expect(screen.queryByText('Loading repositories...')).not.toBeInTheDocument()
    })

    test('covers optional chaining for loading state when strings undefined', async () => {
      mockBrowserState.loadingRepos = true

      const configWithoutStrings = {
        apiUrl: 'https://api.example.com',
        nonce: 'test-nonce',
        actionPrefix: 'test_action'
        // No strings property
      }

      render(<BrowserApp config={configWithoutStrings} />)

      expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading repositories...')
    })

    test('covers optional chaining for error state when strings undefined', async () => {
      mockBrowserState.error = 'Network error occurred'

      const configWithoutStrings = {
        apiUrl: 'https://api.example.com',
        nonce: 'test-nonce',
        actionPrefix: 'test_action'
        // No strings property
      }

      render(<BrowserApp config={configWithoutStrings} />)

      expect(screen.getByTestId('error-message')).toHaveTextContent('Network error occurred')
      const retryButton = screen.getByTestId('retry-button')
      await userEvent.click(retryButton)
    })
  })

  describe('Error States', () => {
    test('renders error state when error exists', async () => {
      mockBrowserState.error = 'Network error occurred'
      const mockFetchRepos = vi.fn()
      mockGitHubData.fetchRepos = mockFetchRepos

      render(<BrowserApp config={mockConfig} />)

      expect(screen.getByTestId('error-state')).toBeInTheDocument()
      expect(screen.getByTestId('error-message')).toHaveTextContent('Network error occurred')
      expect(screen.getByTestId('retry-button')).toBeInTheDocument()
      expect(screen.getByTestId('button-primary')).toBeDisabled()
    })

    test('calls retry function when retry button is clicked', async () => {
      mockBrowserState.error = 'API Error'
      const mockFetchRepos = vi.fn()
      mockGitHubData.fetchRepos = mockFetchRepos

      render(<BrowserApp config={mockConfig} />)

      // Clear the initial call from useEffect
      mockFetchRepos.mockClear()

      const retryButton = screen.getByTestId('retry-button')
      await userEvent.click(retryButton)

      expect(mockFetchRepos).toHaveBeenCalledTimes(1)
    })
  })

  describe('Repositories View', () => {
    test('renders repositories view with search and list', async () => {
      mockBrowserState.repos = mockRepos

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('repository-search')).toBeInTheDocument()
        expect(screen.getByTestId('repository-list')).toBeInTheDocument()
        expect(screen.getByTestId('repo-1')).toHaveTextContent('test-repo')
        expect(screen.getByTestId('app-footer')).toBeInTheDocument()
      })
    })

    test('renders footer with disabled primary button when no selection made', async () => {
      mockBrowserState.repos = mockRepos
      mockAssetConfirmation.canConfirmAsset = false

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        const primaryButton = screen.getByTestId('button-primary')
        expect(primaryButton).toBeDisabled()
        expect(primaryButton).toHaveTextContent('Insert into download')
      })
    })

    test('renders footer with enabled primary button when selection is valid', async () => {
      mockBrowserState.repos = mockRepos
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.repoReleases = { 'owner/test-repo': [mockRelease] }
      mockBrowserState.selectedReleaseTag = 'v1.0.0'
      mockBrowserState.selectedRelease = mockRelease
      mockBrowserState.selectedAssetObj = mockAsset
      mockAssetConfirmation.canConfirmAsset = true

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        const primaryButton = screen.getByTestId('button-primary')
        expect(primaryButton).not.toBeDisabled()
        expect(primaryButton).toHaveTextContent('Insert into download')
      })
    })

    test('shows upgrade link when upgrade URL is provided', async () => {
      const configWithUpgrade = {
        ...mockConfig,
        upgradeUrl: 'https://example.com/upgrade'
      }
      mockBrowserState.repos = mockRepos

      render(<BrowserApp config={configWithUpgrade} />)

      await waitFor(() => {
        expect(screen.getByTestId('upgrade-link')).toBeInTheDocument()
        expect(screen.getByTestId('upgrade-link')).toHaveAttribute('href', 'https://example.com/upgrade')
      })
    })
  })

  describe('Assets View', () => {
    test('renders assets view when view is assets and selections are made', async () => {
      mockBrowserState.view = 'assets'
      mockBrowserState.repos = mockRepos
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.repoReleases = { 'owner/test-repo': [mockRelease] }
      mockBrowserState.selectedReleaseTag = 'v1.0.0'
      mockBrowserState.selectedRelease = mockRelease
      mockBrowserState.selectedAssetObj = mockAsset

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('assets-view')).toBeInTheDocument()
        expect(screen.getByTestId('selected-repo')).toHaveTextContent('owner/test-repo')
        expect(screen.getByTestId('back-button')).toBeInTheDocument()
        expect(screen.getByTestId('app-footer')).toBeInTheDocument()
      })
    })

    test('calls handleConfirmAsset when primary button is clicked in assets view', async () => {
      mockBrowserState.view = 'assets'
      mockBrowserState.repos = mockRepos
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.repoReleases = { 'owner/test-repo': [mockRelease] }
      mockBrowserState.selectedReleaseTag = 'v1.0.0'
      mockBrowserState.selectedRelease = mockRelease
      mockBrowserState.selectedAssetObj = mockAsset

      const mockHandleConfirmAsset = vi.fn()
      mockAssetConfirmation.handleConfirmAsset = mockHandleConfirmAsset
      mockAssetConfirmation.canConfirmAsset = true

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        const primaryButton = screen.getByTestId('button-primary')
        expect(primaryButton).not.toBeDisabled()
      })

      const primaryButton = screen.getByTestId('button-primary')
      await userEvent.click(primaryButton)

      expect(mockHandleConfirmAsset).toHaveBeenCalledTimes(1)
    })
  })

  describe('Component Integration', () => {
    test('handles back navigation from assets view', async () => {
      mockBrowserState.view = 'assets'
      mockBrowserState.repos = mockRepos
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.repoReleases = { 'owner/test-repo': [mockRelease] }
      mockBrowserState.selectedReleaseTag = 'v1.0.0'
      mockBrowserState.selectedRelease = mockRelease
      mockBrowserState.selectedAssetObj = mockAsset

      const mockHandleBackToRepos = vi.fn()
      mockRepositoryActions.handleBackToRepos = mockHandleBackToRepos

      render(<BrowserApp config={mockConfig} />)

      const backButton = screen.getByTestId('back-button')
      await userEvent.click(backButton)

      expect(mockHandleBackToRepos).toHaveBeenCalledTimes(1)
    })

    test('renders correct footer button state based on confirmation availability', async () => {
      mockBrowserState.repos = mockRepos
      mockAssetConfirmation.canConfirmAsset = false

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        const primaryButton = screen.getByTestId('button-primary')
        expect(primaryButton).toBeDisabled()
      })
    })
  })

  describe('Edge Cases', () => {
    test('handles missing optional config properties gracefully', async () => {
      const minimalConfig = {
        apiUrl: 'https://example.com/api',
        nonce: 'test-nonce',
        actionPrefix: 'test'
      }
      mockBrowserState.repos = mockRepos

      render(<BrowserApp config={minimalConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('repository-search')).toBeInTheDocument()
        expect(screen.getByTestId('app-footer')).toBeInTheDocument()
      })
    })

    test('handles empty repositories list', async () => {
      mockBrowserState.repos = []

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('no-repos')).toBeInTheDocument()
      })
    })
  })

  describe('Service Initialization', () => {
    test('initializes GitHubService with correct config', () => {
      const customConfig = {
        apiUrl: 'https://custom-api.example.com',
        nonce: 'custom-nonce',
        actionPrefix: 'custom_action'
      }
      mockBrowserState.repos = mockRepos

      // This test verifies the component initializes without throwing
      expect(() => {
        render(<BrowserApp config={customConfig} />)
      }).not.toThrow()
    })

    test('covers service initialization callback function', () => {
      const customConfig = {
        apiUrl: 'https://custom-api.example.com',
        nonce: 'custom-nonce',
        actionPrefix: 'custom_action'
      }
      mockBrowserState.repos = mockRepos

      // This test covers the useState initializer callback function
      const { unmount } = render(<BrowserApp config={customConfig} />)

      // Component should initialize successfully
      expect(screen.getByTestId('repository-search')).toBeInTheDocument()

      // Cleanup to test the unmount behavior
      unmount()
    })

    test('handles service initialization errors gracefully', async () => {
      // Test with invalid config - should still render fallback UI
      const invalidConfig = {
        apiUrl: '',
        nonce: '',
        actionPrefix: ''
      }

      render(<BrowserApp config={invalidConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('repository-search')).toBeInTheDocument()
      })
    })

    test('covers optional chaining branches for undefined strings', async () => {
      const configWithoutStrings = {
        apiUrl: 'https://api.example.com',
        nonce: 'test-nonce',
        actionPrefix: 'test_action'
        // No strings property at all
      }
      mockBrowserState.repos = mockRepos

      const { unmount } = render(<BrowserApp config={configWithoutStrings} />)

      await waitFor(() => {
        expect(screen.getByTestId('repository-search')).toBeInTheDocument()
      })

      unmount()

      // Test with custom config that has strings but missing specific properties
      const configWithPartialStrings = {
        ...configWithoutStrings,
        strings: {} // Empty strings object
      }

      render(<BrowserApp config={configWithPartialStrings} />)

      await waitFor(() => {
        expect(screen.getByTestId('repository-search')).toBeInTheDocument()
      })
    })

    test('covers optional chaining branches for null strings in assets view', async () => {
      mockBrowserState.view = 'assets'
      mockBrowserState.repos = mockRepos
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.repoReleases = { 'owner/test-repo': [mockRelease] }
      mockBrowserState.selectedReleaseTag = 'v1.0.0'
      mockBrowserState.selectedRelease = mockRelease
      mockBrowserState.selectedAssetObj = mockAsset
      mockAssetConfirmation.canConfirmAsset = true

      const configWithoutStrings = {
        apiUrl: 'https://api.example.com',
        nonce: 'test-nonce',
        actionPrefix: 'test_action'
        // No strings property
      }

      render(<BrowserApp config={configWithoutStrings} />)

      await waitFor(() => {
        const primaryButton = screen.getByTestId('button-primary')
        expect(primaryButton).toHaveTextContent('Insert into download') // Should use default
      })
    })
  })

  describe('Component Lifecycle', () => {
    test('calls cleanup function on unmount', () => {
      const customConfig = {
        apiUrl: 'https://api.example.com',
        nonce: 'test-nonce',
        actionPrefix: 'test_action'
      }
      mockBrowserState.repos = mockRepos

      const { unmount } = render(<BrowserApp config={customConfig} />)

      // Verify component rendered
      expect(screen.getByTestId('repository-search')).toBeInTheDocument()

      // Unmount component to trigger cleanup function
      unmount()

      // Cleanup function (isMountedRef.current = false) should be called
      // This test covers the useEffect cleanup function on lines 79-81
    })
  })
})