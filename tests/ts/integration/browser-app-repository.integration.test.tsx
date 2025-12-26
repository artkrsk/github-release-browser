import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserApp } from '@/components/BrowserApp'
import { createMockBrowserConfig, createMockRepo, createMockRelease, render, setupTestEnvironment } from '@test-utils'
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

describe('BrowserApp - Repository Integration', () => {
  const mockConfig = createMockBrowserConfig()
  const mockRepos = [
    createMockRepo({ id: 1, full_name: 'owner/repo-1', name: 'repo-1' }),
    createMockRepo({ id: 2, full_name: 'owner/repo-2', name: 'repo-2' }),
    createMockRepo({ id: 3, full_name: 'owner/repo-3', name: 'repo-3' })
  ]
  const mockRelease = createMockRelease({ tag_name: 'v1.0.0' })

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

  describe('Repository List Display', () => {
    test('renders all repositories in the list', async () => {
      mockBrowserState.repos = mockRepos

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('repo-1')).toBeInTheDocument()
        expect(screen.getByTestId('repo-2')).toBeInTheDocument()
        expect(screen.getByTestId('repo-3')).toBeInTheDocument()
      })
    })

    test('displays repository names correctly', async () => {
      mockBrowserState.repos = mockRepos

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('repo-1')).toHaveTextContent('repo-1')
        expect(screen.getByTestId('repo-2')).toHaveTextContent('repo-2')
        expect(screen.getByTestId('repo-3')).toHaveTextContent('repo-3')
      })
    })

    test('displays empty state when no repositories', async () => {
      mockBrowserState.repos = []

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('no-repos')).toBeInTheDocument()
      })
    })
  })

  describe('Repository Interaction', () => {
    test('clicking repository in releases mode toggles expansion', async () => {
      mockBrowserState.repos = mockRepos
      mockBrowserState.sourceMode = 'releases'

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('repo-1')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByTestId('repo-1'))

      expect(mockRepositoryActions.handleRepoToggle).toHaveBeenCalledWith('owner/repo-1')
    })

    test('clicking multiple repositories calls toggle for each', async () => {
      mockBrowserState.repos = mockRepos
      mockBrowserState.sourceMode = 'releases'

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('repo-1')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByTestId('repo-1'))
      await userEvent.click(screen.getByTestId('repo-2'))

      expect(mockRepositoryActions.handleRepoToggle).toHaveBeenCalledWith('owner/repo-1')
      expect(mockRepositoryActions.handleRepoToggle).toHaveBeenCalledWith('owner/repo-2')
    })
  })

  describe('Repository Search', () => {
    test('renders search input', async () => {
      mockBrowserState.repos = mockRepos

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument()
      })
    })

    test('search input reflects current search query', async () => {
      mockBrowserState.repos = mockRepos
      mockBrowserState.searchQuery = 'test query'

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        const searchInput = screen.getByTestId('search-input')
        expect(searchInput).toHaveValue('test query')
      })
    })

    test('typing in search updates query', async () => {
      mockBrowserState.repos = mockRepos

      render(<BrowserApp config={mockConfig} />)

      const searchInput = screen.getByTestId('search-input')
      await userEvent.type(searchInput, 'new search')

      // Should call setSearchQuery for each character
      expect(mockBrowserState.setSearchQuery).toHaveBeenCalled()
    })
  })

  describe('Repository Refresh', () => {
    test('renders refresh button in search component', async () => {
      mockBrowserState.repos = mockRepos

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('refresh-button')).toBeInTheDocument()
      })
    })

    test('clicking refresh button calls refreshRepos', async () => {
      mockBrowserState.repos = mockRepos
      const mockRefreshRepos = vi.fn()
      mockGitHubData.refreshRepos = mockRefreshRepos

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('refresh-button')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByTestId('refresh-button'))

      expect(mockRefreshRepos).toHaveBeenCalled()
    })

    test('shows loading state when loading repos', async () => {
      mockBrowserState.repos = mockRepos
      mockBrowserState.loadingRepos = true

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toBeInTheDocument()
        // Refresh button is not visible during loading, component shows loading state
        expect(screen.queryByTestId('refresh-button')).not.toBeInTheDocument()
      })
    })
  })

  describe('Repository Selection State', () => {
    test('tracks expanded repository', async () => {
      mockBrowserState.repos = mockRepos
      mockBrowserState.expandedRepo = 'owner/repo-1'

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('repository-list')).toBeInTheDocument()
      })
    })

    test('tracks selected repository', async () => {
      mockBrowserState.repos = mockRepos
      mockBrowserState.selectedRepo = 'owner/repo-2'

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('repository-list')).toBeInTheDocument()
      })
    })

    test('can have both expanded and selected repository', async () => {
      mockBrowserState.repos = mockRepos
      mockBrowserState.expandedRepo = 'owner/repo-1'
      mockBrowserState.selectedRepo = 'owner/repo-2'

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('repository-list')).toBeInTheDocument()
      })
    })
  })

  describe('Repository Loading States', () => {
    test('shows loading state while fetching repositories', async () => {
      mockBrowserState.loadingRepos = true

      render(<BrowserApp config={mockConfig} />)

      expect(screen.getByTestId('loading-state')).toBeInTheDocument()
    })

    test('tracks individual repository loading state', async () => {
      mockBrowserState.repos = mockRepos
      mockBrowserState.loadingRepo = 'owner/repo-1'

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('repository-list')).toBeInTheDocument()
      })
    })

    test('transitions from loading to loaded state', async () => {
      mockBrowserState.loadingRepos = true

      const { rerender } = render(<BrowserApp config={mockConfig} />)

      expect(screen.getByTestId('loading-state')).toBeInTheDocument()

      // Update to loaded state
      mockBrowserState.loadingRepos = false
      mockBrowserState.repos = mockRepos
      rerender(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument()
        expect(screen.getByTestId('repository-list')).toBeInTheDocument()
      })
    })
  })
})
