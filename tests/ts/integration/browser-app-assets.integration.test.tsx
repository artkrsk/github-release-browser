import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserApp } from '@/components/BrowserApp'
import { createMockBrowserConfig, createMockRepo, createMockRelease, createMockAsset, render, setupTestEnvironment } from '@test-utils'
import {
  createDefaultMockState,
  createDefaultMockGitHubData,
  createDefaultMockRepositoryActions,
  createDefaultMockAssetConfirmation,
  createDefaultMockDirectoryData
} from './__helpers__/browser-app-factories'

// Mock GitHubService
const { mockClearReleasesCache, mockClearBranchesCache, mockGetReleases, mockGetBranches, mockGetContents, mockGetArchiveUrl } = vi.hoisted(() => ({
  mockClearReleasesCache: vi.fn(),
  mockClearBranchesCache: vi.fn(),
  mockGetReleases: vi.fn(),
  mockGetBranches: vi.fn(),
  mockGetContents: vi.fn(),
  mockGetArchiveUrl: vi.fn()
}))

vi.mock('@/services/GitHubService', () => ({
  GitHubService: class MockGitHubService {
    getUserRepos = vi.fn()
    getReleases = mockGetReleases
    clearCache = vi.fn()
    clearReleasesCache = mockClearReleasesCache
    clearBranchesCache = mockClearBranchesCache
    getBranches = mockGetBranches
    getContents = mockGetContents
    getArchiveUrl = mockGetArchiveUrl
    getRepoInfo = vi.fn()
  }
}))

// Import centralized WordPress component mocks
import { mockWordPressComponents } from '../../mocks/wordpress-components'
vi.mock('@wordpress/components', () => mockWordPressComponents)

// Mock child components
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
  AssetsView: ({ selectedRepo, onBack, onRefresh }: any) => (
    <div data-testid="assets-view">
      <div data-testid="selected-repo">{selectedRepo}</div>
      <button onClick={onBack} data-testid="back-button">Back</button>
      {onRefresh && <button onClick={onRefresh} data-testid="assets-refresh">Refresh</button>}
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

vi.mock('@/components/SourceModeToggle', () => ({
  SourceModeToggle: ({ mode, onModeChange, disabled }: any) => (
    <div data-testid="source-mode-toggle">
      <button
        data-testid="toggle-releases"
        onClick={() => onModeChange('releases')}
        disabled={disabled}
        data-active={mode === 'releases'}
      >
        Releases
      </button>
      <button
        data-testid="toggle-directory"
        onClick={() => onModeChange('directory')}
        disabled={disabled}
        data-active={mode === 'directory'}
      >
        Directory
      </button>
    </div>
  )
}))

vi.mock('@/components/DirectoryView', () => ({
  DirectoryView: ({ selectedRepo, selectedBranch, currentPath, onBack, onSelectBranch, onNavigate, onRefresh }: any) => (
    <div data-testid="directory-view">
      <div data-testid="directory-selected-repo">{selectedRepo}</div>
      <div data-testid="directory-selected-branch">{selectedBranch}</div>
      <div data-testid="directory-current-path">{currentPath}</div>
      <button onClick={onBack} data-testid="directory-back-button">Back</button>
      <button onClick={() => onSelectBranch('develop')} data-testid="directory-change-branch">Change Branch</button>
      <button onClick={() => onNavigate('src/components')} data-testid="directory-navigate">Navigate</button>
      {onRefresh && <button onClick={onRefresh} data-testid="directory-refresh">Refresh</button>}
    </div>
  )
}))

// Mock hooks
let mockBrowserState: any = {}
let mockGitHubData: any = {}
let mockDirectoryData: any = {}
let mockRepositoryActions: any = {}
let mockAssetConfirmation: any = {}

vi.mock('@/hooks/useBrowserState', () => ({
  useBrowserState: () => mockBrowserState
}))

vi.mock('@/hooks/useGitHubData', () => ({
  useGitHubData: () => mockGitHubData
}))

vi.mock('@/hooks/useDirectoryData', () => ({
  useDirectoryData: () => mockDirectoryData
}))

vi.mock('@/hooks/useRepositoryActions', () => ({
  useRepositoryActions: () => mockRepositoryActions
}))

vi.mock('@/hooks/useAssetConfirmation', () => ({
  useAssetConfirmation: () => mockAssetConfirmation
}))

describe('BrowserApp - Assets Integration', () => {
  const mockConfig = createMockBrowserConfig()
  const mockRepos = [createMockRepo({ id: 1, full_name: 'owner/test-repo' })]
  const mockRelease = createMockRelease({ tag_name: 'v1.0.0' })
  const mockAsset = createMockAsset({ id: 1, name: 'test-asset.zip' })

  beforeEach(() => {
    setupTestEnvironment()
    vi.clearAllMocks()
    mockBrowserState = createDefaultMockState()
    mockGitHubData = createDefaultMockGitHubData()
    mockDirectoryData = createDefaultMockDirectoryData()
    mockRepositoryActions = createDefaultMockRepositoryActions()
    mockAssetConfirmation = createDefaultMockAssetConfirmation()
    // Reset service mocks
    mockClearReleasesCache.mockReset()
    mockClearBranchesCache.mockReset()
    mockGetReleases.mockReset()
    mockGetBranches.mockReset()
    mockGetContents.mockReset()
    mockGetArchiveUrl.mockReset()
  })

  describe('Assets View Rendering', () => {
    test('renders assets view when view is assets', async () => {
      mockBrowserState.view = 'assets'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.selectedRelease = mockRelease
      mockBrowserState.repos = mockRepos

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('assets-view')).toBeInTheDocument()
      })
    })

    test('displays selected repository in assets view', async () => {
      mockBrowserState.view = 'assets'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.selectedRelease = mockRelease
      mockBrowserState.repos = mockRepos

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('selected-repo')).toHaveTextContent('owner/test-repo')
      })
    })

    test('shows back button in assets view', async () => {
      mockBrowserState.view = 'assets'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.selectedRelease = mockRelease
      mockBrowserState.repos = mockRepos

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('back-button')).toBeInTheDocument()
      })
    })

    test('shows refresh button in assets view', async () => {
      mockBrowserState.view = 'assets'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.selectedRelease = mockRelease
      mockBrowserState.repos = mockRepos

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('assets-refresh')).toBeInTheDocument()
      })
    })
  })

  describe('Assets View Navigation', () => {
    test('clicking back button calls handleBackToRepos', async () => {
      mockBrowserState.view = 'assets'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.selectedRelease = mockRelease
      mockBrowserState.repos = mockRepos

      const mockHandleBackToRepos = vi.fn()
      mockRepositoryActions.handleBackToRepos = mockHandleBackToRepos

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('back-button')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByTestId('back-button'))

      expect(mockHandleBackToRepos).toHaveBeenCalledTimes(1)
    })

    test('navigating back clears selection state', async () => {
      mockBrowserState.view = 'assets'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.selectedReleaseTag = 'v1.0.0'
      mockBrowserState.selectedRelease = mockRelease
      mockBrowserState.selectedAssetObj = mockAsset
      mockBrowserState.repos = mockRepos

      const mockHandleBackToRepos = vi.fn()
      mockRepositoryActions.handleBackToRepos = mockHandleBackToRepos

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('back-button')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByTestId('back-button'))

      expect(mockHandleBackToRepos).toHaveBeenCalled()
    })
  })

  describe('Assets View with Selection', () => {
    test('renders with release selection', async () => {
      mockBrowserState.view = 'assets'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.repoReleases = { 'owner/test-repo': [mockRelease] }
      mockBrowserState.selectedReleaseTag = 'v1.0.0'
      mockBrowserState.selectedRelease = mockRelease
      mockBrowserState.repos = mockRepos

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('assets-view')).toBeInTheDocument()
      })
    })

    test('renders with asset selection', async () => {
      mockBrowserState.view = 'assets'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.repoReleases = { 'owner/test-repo': [mockRelease] }
      mockBrowserState.selectedReleaseTag = 'v1.0.0'
      mockBrowserState.selectedRelease = mockRelease
      mockBrowserState.selectedAssetObj = mockAsset
      mockBrowserState.repos = mockRepos

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('assets-view')).toBeInTheDocument()
      })
    })

    test('primary button is disabled when no asset selected', async () => {
      mockBrowserState.view = 'assets'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.selectedReleaseTag = 'v1.0.0'
      mockBrowserState.selectedRelease = mockRelease
      mockBrowserState.selectedAssetObj = null
      mockBrowserState.repos = mockRepos
      mockAssetConfirmation.canConfirmAsset = false

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        const primaryButton = screen.getByTestId('button-primary')
        expect(primaryButton).toBeDisabled()
      })
    })

    test('primary button is enabled when asset is selected', async () => {
      mockBrowserState.view = 'assets'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.repoReleases = { 'owner/test-repo': [mockRelease] }
      mockBrowserState.selectedReleaseTag = 'v1.0.0'
      mockBrowserState.selectedRelease = mockRelease
      mockBrowserState.selectedAssetObj = mockAsset
      mockBrowserState.repos = mockRepos
      mockAssetConfirmation.canConfirmAsset = true

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        const primaryButton = screen.getByTestId('button-primary')
        expect(primaryButton).not.toBeDisabled()
      })
    })
  })

  describe('Asset Confirmation', () => {
    test('clicking primary button calls handleConfirmAsset', async () => {
      mockBrowserState.view = 'assets'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.repoReleases = { 'owner/test-repo': [mockRelease] }
      mockBrowserState.selectedReleaseTag = 'v1.0.0'
      mockBrowserState.selectedRelease = mockRelease
      mockBrowserState.selectedAssetObj = mockAsset
      mockBrowserState.repos = mockRepos

      const mockHandleConfirmAsset = vi.fn()
      mockAssetConfirmation.handleConfirmAsset = mockHandleConfirmAsset
      mockAssetConfirmation.canConfirmAsset = true

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        const primaryButton = screen.getByTestId('button-primary')
        expect(primaryButton).not.toBeDisabled()
      })

      await userEvent.click(screen.getByTestId('button-primary'))

      expect(mockHandleConfirmAsset).toHaveBeenCalledTimes(1)
    })

    test('confirmation is only enabled when canConfirmAsset is true', async () => {
      mockBrowserState.view = 'assets'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.repoReleases = { 'owner/test-repo': [mockRelease] }
      mockBrowserState.selectedReleaseTag = 'v1.0.0'
      mockBrowserState.selectedRelease = mockRelease
      mockBrowserState.selectedAssetObj = mockAsset
      mockBrowserState.repos = mockRepos
      mockAssetConfirmation.canConfirmAsset = false

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        const primaryButton = screen.getByTestId('button-primary')
        expect(primaryButton).toBeDisabled()
      })
    })
  })

  describe('Assets View Footer', () => {
    test('footer is displayed in assets view', async () => {
      mockBrowserState.view = 'assets'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.repos = mockRepos

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('app-footer')).toBeInTheDocument()
      })
    })

    test('primary button shows correct text', async () => {
      mockBrowserState.view = 'assets'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.repos = mockRepos

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        const primaryButton = screen.getByTestId('button-primary')
        expect(primaryButton).toHaveTextContent('Insert into download')
      })
    })

    test('primary button uses custom string when provided', async () => {
      const configWithCustomString = {
        ...mockConfig,
        strings: { insertIntoDownload: 'Custom Insert Text' }
      }

      mockBrowserState.view = 'assets'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.repos = mockRepos

      render(<BrowserApp config={configWithCustomString} />)

      await waitFor(() => {
        const primaryButton = screen.getByTestId('button-primary')
        expect(primaryButton).toHaveTextContent('Custom Insert Text')
      })
    })
  })

  describe('Assets View State Transitions', () => {
    test('transitions from repos view to assets view', async () => {
      mockBrowserState.view = 'repos'
      mockBrowserState.repos = mockRepos

      const { rerender } = render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('repository-list')).toBeInTheDocument()
      })

      // Transition to assets view
      mockBrowserState.view = 'assets'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.selectedRelease = mockRelease
      rerender(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.queryByTestId('repository-list')).not.toBeInTheDocument()
        expect(screen.getByTestId('assets-view')).toBeInTheDocument()
      })
    })

    test('transitions from assets view back to repos view', async () => {
      mockBrowserState.view = 'assets'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.selectedRelease = mockRelease
      mockBrowserState.repos = mockRepos

      const { rerender } = render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('assets-view')).toBeInTheDocument()
      })

      // Transition back to repos
      mockBrowserState.view = 'repos'
      mockBrowserState.selectedRepo = null
      mockBrowserState.selectedRelease = null
      rerender(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.queryByTestId('assets-view')).not.toBeInTheDocument()
        expect(screen.getByTestId('repository-list')).toBeInTheDocument()
      })
    })
  })
})
