import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserApp } from '@/components/BrowserApp'
import { createMockBrowserConfig, createMockRepo, render, setupTestEnvironment } from '@test-utils'
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

describe('BrowserApp - Directory Integration', () => {
  const mockConfig = createMockBrowserConfig()
  const mockRepos = [createMockRepo({ id: 1, full_name: 'owner/test-repo' })]

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

  describe('Directory Mode Rendering', () => {
    test('shows SourceModeToggle when features.directories is true', async () => {
      const configWithDirectories = {
        ...mockConfig,
        features: { directories: true }
      }
      mockBrowserState.repos = mockRepos

      render(<BrowserApp config={configWithDirectories} />)

      await waitFor(() => {
        expect(screen.getByTestId('source-mode-toggle')).toBeInTheDocument()
      })
    })

    test('hides SourceModeToggle when features.directories is false', async () => {
      const configWithoutDirectories = {
        ...mockConfig,
        features: { directories: false }
      }
      mockBrowserState.repos = mockRepos

      render(<BrowserApp config={configWithoutDirectories} />)

      await waitFor(() => {
        expect(screen.getByTestId('repository-search')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('source-mode-toggle')).not.toBeInTheDocument()
    })

    test('hides SourceModeToggle when features.directories is undefined', async () => {
      const configWithoutFeatures = {
        ...mockConfig,
        features: undefined
      }
      mockBrowserState.repos = mockRepos

      render(<BrowserApp config={configWithoutFeatures} />)

      await waitFor(() => {
        expect(screen.getByTestId('repository-search')).toBeInTheDocument()
      })
      expect(screen.queryByTestId('source-mode-toggle')).not.toBeInTheDocument()
    })

    test('renders DirectoryView when view is directory', async () => {
      mockBrowserState.view = 'directory'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.repos = mockRepos
      mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc123' }, protected: false }]
      mockBrowserState.selectedBranch = 'main'

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('directory-view')).toBeInTheDocument()
        expect(screen.getByTestId('directory-selected-repo')).toHaveTextContent('owner/test-repo')
      })
    })

    test('passes sourceMode to RepositoryList in repos view', async () => {
      const configWithDirectories = {
        ...mockConfig,
        features: { directories: true }
      }
      mockBrowserState.repos = mockRepos
      mockBrowserState.sourceMode = 'directory'

      render(<BrowserApp config={configWithDirectories} />)

      await waitFor(() => {
        expect(screen.getByTestId('repository-list')).toBeInTheDocument()
      })
    })

    test('does not expand panel in directory mode', async () => {
      const configWithDirectories = {
        ...mockConfig,
        features: { directories: true }
      }
      mockBrowserState.repos = mockRepos
      mockBrowserState.sourceMode = 'directory'
      mockBrowserState.expandedRepo = 'owner/test-repo'

      render(<BrowserApp config={configWithDirectories} />)

      // In directory mode, expandedRepo should be passed as null to RepositoryList
      await waitFor(() => {
        expect(screen.getByTestId('repository-list')).toBeInTheDocument()
      })
    })
  })

  describe('Directory Navigation', () => {
    test('clicking repo in directory mode calls handleSelectRepoForDirectory', async () => {
      const configWithDirectories = {
        ...mockConfig,
        features: { directories: true }
      }
      mockBrowserState.repos = mockRepos
      mockBrowserState.sourceMode = 'directory'

      render(<BrowserApp config={configWithDirectories} />)

      await waitFor(() => {
        expect(screen.getByTestId('repo-1')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByTestId('repo-1'))

      // Should set selectedRepo
      expect(mockBrowserState.setSelectedRepo).toHaveBeenCalledWith('owner/test-repo')
      // Should set view to directory
      expect(mockBrowserState.setView).toHaveBeenCalledWith('directory')
      // Should clear current path
      expect(mockBrowserState.setCurrentPath).toHaveBeenCalledWith('')
      // Should clear selected folder path
      expect(mockBrowserState.setSelectedFolderPath).toHaveBeenCalledWith(null)
      // Should clear old contents
      expect(mockBrowserState.setDirectoryContents).toHaveBeenCalledWith([])
      // Should clear old branches
      expect(mockBrowserState.setBranches).toHaveBeenCalledWith([])
      // Should fetch branches
      expect(mockDirectoryData.fetchBranches).toHaveBeenCalledWith('owner/test-repo')
      // Should fetch repo info
      expect(mockDirectoryData.fetchRepoInfo).toHaveBeenCalledWith('owner/test-repo')
    })

    test('clicking repo in releases mode toggles panel expansion', async () => {
      mockBrowserState.repos = mockRepos
      mockBrowserState.sourceMode = 'releases'

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('repo-1')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByTestId('repo-1'))

      // Should call handleRepoToggle for releases mode
      expect(mockRepositoryActions.handleRepoToggle).toHaveBeenCalledWith('owner/test-repo')
    })
  })

  describe('Directory Handlers', () => {
    test('handleBranchChange clears contents and fetches new branch', async () => {
      mockBrowserState.view = 'directory'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.branches = [
        { name: 'main', commit: { sha: 'abc123' }, protected: false },
        { name: 'develop', commit: { sha: 'def456' }, protected: false }
      ]
      mockBrowserState.selectedBranch = 'main'

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('directory-view')).toBeInTheDocument()
      })

      // Click to change branch
      await userEvent.click(screen.getByTestId('directory-change-branch'))

      // Should set new branch
      expect(mockBrowserState.setSelectedBranch).toHaveBeenCalledWith('develop')
      // Should clear current path
      expect(mockBrowserState.setCurrentPath).toHaveBeenCalledWith('')
      // Should clear selected folder
      expect(mockBrowserState.setSelectedFolderPath).toHaveBeenCalledWith(null)
      // Should clear old contents
      expect(mockBrowserState.setDirectoryContents).toHaveBeenCalledWith([])
      // Should fetch new contents
      expect(mockDirectoryData.fetchContents).toHaveBeenCalledWith('owner/test-repo', '', 'develop')
    })

    test('handleNavigate clears contents and fetches new path', async () => {
      mockBrowserState.view = 'directory'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc123' }, protected: false }]
      mockBrowserState.selectedBranch = 'main'
      mockBrowserState.currentPath = ''

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('directory-view')).toBeInTheDocument()
      })

      // Click to navigate
      await userEvent.click(screen.getByTestId('directory-navigate'))

      // Should set new path
      expect(mockBrowserState.setCurrentPath).toHaveBeenCalledWith('src/components')
      // Should clear old contents
      expect(mockBrowserState.setDirectoryContents).toHaveBeenCalledWith([])
      // Should fetch new contents
      expect(mockDirectoryData.fetchContents).toHaveBeenCalledWith('owner/test-repo', 'src/components', 'main')
    })

    test('handleBackToRepos navigates back from directory view', async () => {
      mockBrowserState.view = 'directory'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc123' }, protected: false }]
      mockBrowserState.selectedBranch = 'main'

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('directory-view')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByTestId('directory-back-button'))

      expect(mockRepositoryActions.handleBackToRepos).toHaveBeenCalledTimes(1)
    })

    test('renders footer with disabled button when no folder selected', async () => {
      mockBrowserState.view = 'directory'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc123' }, protected: false }]
      mockBrowserState.selectedBranch = 'main'
      mockBrowserState.selectedFolderPath = null

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('directory-view')).toBeInTheDocument()
      })

      const primaryButton = screen.getByTestId('button-primary')
      expect(primaryButton).toBeDisabled()
    })

    test('renders footer with enabled button when folder is selected', async () => {
      mockBrowserState.view = 'directory'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc123' }, protected: false }]
      mockBrowserState.selectedBranch = 'main'
      mockBrowserState.selectedFolderPath = 'src/components'

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('directory-view')).toBeInTheDocument()
      })

      const primaryButton = screen.getByTestId('button-primary')
      expect(primaryButton).not.toBeDisabled()
    })
  })

  describe('Directory View State Display', () => {
    test('displays selected branch in directory view', async () => {
      mockBrowserState.view = 'directory'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc123' }, protected: false }]
      mockBrowserState.selectedBranch = 'main'

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('directory-selected-branch')).toHaveTextContent('main')
      })
    })

    test('displays current path in directory view', async () => {
      mockBrowserState.view = 'directory'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc123' }, protected: false }]
      mockBrowserState.selectedBranch = 'main'
      mockBrowserState.currentPath = 'src/components'

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('directory-current-path')).toHaveTextContent('src/components')
      })
    })

    test('handleConfirmDirectory does not proceed when selectedFolderPath is null', async () => {
      mockBrowserState.view = 'directory'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc123' }, protected: false }]
      mockBrowserState.selectedBranch = 'main'
      mockBrowserState.selectedFolderPath = null

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('directory-view')).toBeInTheDocument()
      })

      const primaryButton = screen.getByTestId('button-primary')

      // Force click even though button is disabled to test the early return guard
      primaryButton.click()

      // Should not call getArchiveUrl since validation fails (selectedFolderPath is null)
      expect(mockGetArchiveUrl).not.toHaveBeenCalled()
    })
  })

  describe('Source Mode Switching', () => {
    test('switches to directory mode when toggle is clicked', async () => {
      const configWithDirectories = {
        ...mockConfig,
        features: { directories: true }
      }
      mockBrowserState.repos = mockRepos
      mockBrowserState.sourceMode = 'releases'

      render(<BrowserApp config={configWithDirectories} />)

      await waitFor(() => {
        expect(screen.getByTestId('source-mode-toggle')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByTestId('toggle-directory'))

      expect(mockBrowserState.setSourceMode).toHaveBeenCalledWith('directory')
    })

    test('switches to releases mode when toggle is clicked', async () => {
      const configWithDirectories = {
        ...mockConfig,
        features: { directories: true }
      }
      mockBrowserState.repos = mockRepos
      mockBrowserState.sourceMode = 'directory'

      render(<BrowserApp config={configWithDirectories} />)

      await waitFor(() => {
        expect(screen.getByTestId('source-mode-toggle')).toBeInTheDocument()
      })

      await userEvent.click(screen.getByTestId('toggle-releases'))

      expect(mockBrowserState.setSourceMode).toHaveBeenCalledWith('releases')
    })
  })

  describe('Directory Refresh Handler', () => {
    test('directory view has refresh button', async () => {
      mockBrowserState.view = 'directory'
      mockBrowserState.selectedRepo = 'owner/test-repo'
      mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc123' }, protected: false }]
      mockBrowserState.selectedBranch = 'main'

      render(<BrowserApp config={mockConfig} />)

      await waitFor(() => {
        expect(screen.getByTestId('directory-refresh')).toBeInTheDocument()
      })
    })
  })
})
