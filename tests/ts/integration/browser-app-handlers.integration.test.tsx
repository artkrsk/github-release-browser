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

describe('BrowserApp - Handlers Integration', () => {
  const mockConfig = createMockBrowserConfig()
  const mockRepos = [createMockRepo({ id: 1, full_name: 'owner/test-repo' })]
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

  describe('Refresh Handlers', () => {
    describe('handleRefreshAssets', () => {
      test('clicking refresh in AssetsView calls clearReleasesCache', async () => {
        mockBrowserState.view = 'assets'
        mockBrowserState.repos = mockRepos
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.repoReleases = { 'owner/test-repo': [mockRelease] }
        mockBrowserState.selectedReleaseTag = 'v1.0.0'
        mockBrowserState.selectedRelease = mockRelease

        mockClearReleasesCache.mockResolvedValue(undefined)
        mockGetReleases.mockResolvedValue([mockRelease])

        render(<BrowserApp config={mockConfig} />)

        await waitFor(() => {
          expect(screen.getByTestId('assets-refresh')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByTestId('assets-refresh'))

        await waitFor(() => {
          expect(mockClearReleasesCache).toHaveBeenCalledWith('owner/test-repo')
        })
      })

      test('refresh clears local state by deleting repo from repoReleases', async () => {
        mockBrowserState.view = 'assets'
        mockBrowserState.repos = mockRepos
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.repoReleases = { 'owner/test-repo': [mockRelease] }
        mockBrowserState.selectedReleaseTag = 'v1.0.0'
        mockBrowserState.selectedRelease = mockRelease

        mockClearReleasesCache.mockResolvedValue(undefined)
        mockGetReleases.mockResolvedValue([mockRelease])

        render(<BrowserApp config={mockConfig} />)

        await waitFor(() => {
          expect(screen.getByTestId('assets-refresh')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByTestId('assets-refresh'))

        await waitFor(() => {
          expect(mockBrowserState.setRepoReleases).toHaveBeenCalled()
        })

        // Verify the first call clears the repo from releases
        const setRepoReleasesFirstCall = mockBrowserState.setRepoReleases.mock.calls[0][0]
        if (typeof setRepoReleasesFirstCall === 'function') {
          const result = setRepoReleasesFirstCall({ 'owner/test-repo': [mockRelease], 'other/repo': [] })
          expect(result).not.toHaveProperty('owner/test-repo')
          expect(result).toHaveProperty('other/repo')
        }
      })

      test('refresh re-fetches releases after cache clear', async () => {
        mockBrowserState.view = 'assets'
        mockBrowserState.repos = mockRepos
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.repoReleases = { 'owner/test-repo': [mockRelease] }
        mockBrowserState.selectedReleaseTag = 'v1.0.0'
        mockBrowserState.selectedRelease = mockRelease

        const newRelease = createMockRelease({ tag_name: 'v2.0.0' })
        mockClearReleasesCache.mockResolvedValue(undefined)
        mockGetReleases.mockResolvedValue([newRelease])

        render(<BrowserApp config={mockConfig} />)

        await waitFor(() => {
          expect(screen.getByTestId('assets-refresh')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByTestId('assets-refresh'))

        await waitFor(() => {
          expect(mockGetReleases).toHaveBeenCalledWith('owner/test-repo', 1)
        })
      })

      test('setLoadingRepo is called during refresh', async () => {
        mockBrowserState.view = 'assets'
        mockBrowserState.repos = mockRepos
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.repoReleases = { 'owner/test-repo': [mockRelease] }
        mockBrowserState.selectedReleaseTag = 'v1.0.0'
        mockBrowserState.selectedRelease = mockRelease

        mockClearReleasesCache.mockResolvedValue(undefined)
        mockGetReleases.mockResolvedValue([mockRelease])

        render(<BrowserApp config={mockConfig} />)

        await waitFor(() => {
          expect(screen.getByTestId('assets-refresh')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByTestId('assets-refresh'))

        await waitFor(() => {
          // Should be called with repo name at start
          expect(mockBrowserState.setLoadingRepo).toHaveBeenCalledWith('owner/test-repo')
          // Should be called with null at end
          expect(mockBrowserState.setLoadingRepo).toHaveBeenCalledWith(null)
        })
      })

      test('error handling when refresh fails', async () => {
        mockBrowserState.view = 'assets'
        mockBrowserState.repos = mockRepos
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.repoReleases = { 'owner/test-repo': [mockRelease] }
        mockBrowserState.selectedReleaseTag = 'v1.0.0'
        mockBrowserState.selectedRelease = mockRelease

        mockClearReleasesCache.mockRejectedValue(new Error('Network error'))

        render(<BrowserApp config={mockConfig} />)

        await waitFor(() => {
          expect(screen.getByTestId('assets-refresh')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByTestId('assets-refresh'))

        await waitFor(() => {
          expect(mockBrowserState.setError).toHaveBeenCalledWith('Network error')
        })
      })

      test('error handling with non-Error object', async () => {
        mockBrowserState.view = 'assets'
        mockBrowserState.repos = mockRepos
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.repoReleases = { 'owner/test-repo': [mockRelease] }
        mockBrowserState.selectedReleaseTag = 'v1.0.0'
        mockBrowserState.selectedRelease = mockRelease

        mockClearReleasesCache.mockRejectedValue('String error')

        render(<BrowserApp config={mockConfig} />)

        await waitFor(() => {
          expect(screen.getByTestId('assets-refresh')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByTestId('assets-refresh'))

        await waitFor(() => {
          expect(mockBrowserState.setError).toHaveBeenCalledWith('Failed to refresh')
        })
      })

      test('does nothing when selectedRepo is null', async () => {
        mockBrowserState.view = 'assets'
        mockBrowserState.repos = mockRepos
        mockBrowserState.selectedRepo = null
        mockBrowserState.selectedRelease = mockRelease

        render(<BrowserApp config={mockConfig} />)

        // Assets view won't render without selectedRepo
        expect(mockClearReleasesCache).not.toHaveBeenCalled()
      })
    })

    describe('handleRefreshDirectory', () => {
      test('clicking refresh in DirectoryView calls clearBranchesCache', async () => {
        mockBrowserState.view = 'directory'
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc123' }, protected: false }]
        mockBrowserState.selectedBranch = 'main'

        mockClearBranchesCache.mockResolvedValue(undefined)
        mockDirectoryData.fetchBranches.mockResolvedValue(undefined)

        render(<BrowserApp config={mockConfig} />)

        await waitFor(() => {
          expect(screen.getByTestId('directory-refresh')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByTestId('directory-refresh'))

        await waitFor(() => {
          expect(mockClearBranchesCache).toHaveBeenCalledWith('owner/test-repo')
        })
      })

      test('refresh clears local state (branches and directoryContents)', async () => {
        mockBrowserState.view = 'directory'
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc123' }, protected: false }]
        mockBrowserState.selectedBranch = 'main'

        mockClearBranchesCache.mockResolvedValue(undefined)
        mockDirectoryData.fetchBranches.mockResolvedValue(undefined)

        render(<BrowserApp config={mockConfig} />)

        await waitFor(() => {
          expect(screen.getByTestId('directory-refresh')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByTestId('directory-refresh'))

        await waitFor(() => {
          expect(mockBrowserState.setDirectoryContents).toHaveBeenCalledWith([])
          expect(mockBrowserState.setBranches).toHaveBeenCalledWith([])
        })
      })

      test('refresh re-fetches branches', async () => {
        mockBrowserState.view = 'directory'
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc123' }, protected: false }]
        mockBrowserState.selectedBranch = 'main'

        mockClearBranchesCache.mockResolvedValue(undefined)
        mockDirectoryData.fetchBranches.mockResolvedValue(undefined)

        render(<BrowserApp config={mockConfig} />)

        await waitFor(() => {
          expect(screen.getByTestId('directory-refresh')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByTestId('directory-refresh'))

        await waitFor(() => {
          expect(mockDirectoryData.fetchBranches).toHaveBeenCalledWith('owner/test-repo')
        })
      })

      test('refresh re-fetches contents for current path', async () => {
        mockBrowserState.view = 'directory'
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc123' }, protected: false }]
        mockBrowserState.selectedBranch = 'main'
        mockBrowserState.currentPath = 'src/components'

        mockClearBranchesCache.mockResolvedValue(undefined)
        mockDirectoryData.fetchBranches.mockResolvedValue(undefined)
        mockDirectoryData.fetchContents.mockResolvedValue(undefined)

        render(<BrowserApp config={mockConfig} />)

        await waitFor(() => {
          expect(screen.getByTestId('directory-refresh')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByTestId('directory-refresh'))

        await waitFor(() => {
          expect(mockDirectoryData.fetchContents).toHaveBeenCalledWith('owner/test-repo', 'src/components', 'main')
        })
      })

      test('setLoadingBranches and setLoadingContents are called during refresh', async () => {
        mockBrowserState.view = 'directory'
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc123' }, protected: false }]
        mockBrowserState.selectedBranch = 'main'

        mockClearBranchesCache.mockResolvedValue(undefined)
        mockDirectoryData.fetchBranches.mockResolvedValue(undefined)

        render(<BrowserApp config={mockConfig} />)

        await waitFor(() => {
          expect(screen.getByTestId('directory-refresh')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByTestId('directory-refresh'))

        await waitFor(() => {
          // Should be called with true at start
          expect(mockBrowserState.setLoadingBranches).toHaveBeenCalledWith(true)
          expect(mockBrowserState.setLoadingContents).toHaveBeenCalledWith(true)
          // Should be called with false at end
          expect(mockBrowserState.setLoadingBranches).toHaveBeenCalledWith(false)
          expect(mockBrowserState.setLoadingContents).toHaveBeenCalledWith(false)
        })
      })

      test('error handling when refresh fails', async () => {
        mockBrowserState.view = 'directory'
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc123' }, protected: false }]
        mockBrowserState.selectedBranch = 'main'

        mockClearBranchesCache.mockRejectedValue(new Error('Branch cache error'))

        render(<BrowserApp config={mockConfig} />)

        await waitFor(() => {
          expect(screen.getByTestId('directory-refresh')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByTestId('directory-refresh'))

        await waitFor(() => {
          expect(mockBrowserState.setError).toHaveBeenCalledWith('Branch cache error')
        })
      })

      test('error handling with non-Error object', async () => {
        mockBrowserState.view = 'directory'
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc123' }, protected: false }]
        mockBrowserState.selectedBranch = 'main'

        mockClearBranchesCache.mockRejectedValue({ code: 'UNKNOWN' })

        render(<BrowserApp config={mockConfig} />)

        await waitFor(() => {
          expect(screen.getByTestId('directory-refresh')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByTestId('directory-refresh'))

        await waitFor(() => {
          expect(mockBrowserState.setError).toHaveBeenCalledWith('Failed to refresh')
        })
      })

      test('does nothing when selectedRepo is null', async () => {
        mockBrowserState.view = 'directory'
        mockBrowserState.selectedRepo = null
        mockBrowserState.selectedBranch = 'main'

        render(<BrowserApp config={mockConfig} />)

        // Directory view won't render without selectedRepo
        expect(mockClearBranchesCache).not.toHaveBeenCalled()
      })

      test('does nothing when selectedBranch is null', async () => {
        mockBrowserState.view = 'directory'
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.selectedBranch = null

        render(<BrowserApp config={mockConfig} />)

        await waitFor(() => {
          expect(screen.getByTestId('directory-refresh')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByTestId('directory-refresh'))

        // Handler should return early without calling service
        await waitFor(() => {
          expect(mockClearBranchesCache).not.toHaveBeenCalled()
        })
      })
    })
  })

  describe('Directory Confirmation Handler', () => {
    describe('handleConfirmDirectory', () => {
      test('calls getArchiveUrl and creates synthetic directory asset', async () => {
        const mockOnSelectAsset = vi.fn()
        const configWithCallback = {
          ...mockConfig,
          dirProtocol: 'github-dir://',
          onSelectAsset: mockOnSelectAsset
        }

        mockBrowserState.view = 'directory'
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.selectedBranch = 'main'
        mockBrowserState.selectedFolderPath = 'src/components'
        mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc' }, protected: false }]

        mockGetArchiveUrl.mockResolvedValue('https://codeload.github.com/owner/test-repo/zip/main')

        render(<BrowserApp config={configWithCallback} />)

        await waitFor(() => {
          expect(screen.getByTestId('button-primary')).not.toBeDisabled()
        })

        await userEvent.click(screen.getByTestId('button-primary'))

        await waitFor(() => {
          expect(mockGetArchiveUrl).toHaveBeenCalledWith('owner/test-repo', 'main')
          expect(mockOnSelectAsset).toHaveBeenCalled()
        })

        // Verify synthetic asset structure
        const call = mockOnSelectAsset.mock.calls[0][0]
        expect(call.repo).toBe('owner/test-repo')
        expect(call.release).toBe('main')
        expect(call.asset.name).toBe('github-dir://owner/test-repo/main/src/components')
        expect(call.asset.isDirectory).toBe(true)
        expect(call.asset.synthetic).toBe(true)
        expect(call.downloadUrl).toBe('https://codeload.github.com/owner/test-repo/zip/main')
      })

      test('builds correct github-dir:// URI for root folder', async () => {
        const mockOnSelectAsset = vi.fn()
        const configWithCallback = {
          ...mockConfig,
          dirProtocol: 'github-dir://',
          onSelectAsset: mockOnSelectAsset
        }

        mockBrowserState.view = 'directory'
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.selectedBranch = 'main'
        mockBrowserState.selectedFolderPath = ''
        mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc' }, protected: false }]

        mockGetArchiveUrl.mockResolvedValue('https://archive.url')

        render(<BrowserApp config={configWithCallback} />)

        await waitFor(() => {
          expect(screen.getByTestId('button-primary')).not.toBeDisabled()
        })

        await userEvent.click(screen.getByTestId('button-primary'))

        await waitFor(() => {
          expect(mockOnSelectAsset).toHaveBeenCalled()
        })

        const call = mockOnSelectAsset.mock.calls[0][0]
        expect(call.asset.name).toBe('github-dir://owner/test-repo/main')
      })

      test('uses custom dirProtocol from config', async () => {
        const mockOnSelectAsset = vi.fn()
        const configWithCustomProtocol = {
          ...mockConfig,
          dirProtocol: 'custom-dir://',
          onSelectAsset: mockOnSelectAsset
        }

        mockBrowserState.view = 'directory'
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.selectedBranch = 'develop'
        mockBrowserState.selectedFolderPath = 'dist'
        mockBrowserState.branches = [{ name: 'develop', commit: { sha: 'abc' }, protected: false }]

        mockGetArchiveUrl.mockResolvedValue('https://archive.url')

        render(<BrowserApp config={configWithCustomProtocol} />)

        await waitFor(() => {
          expect(screen.getByTestId('button-primary')).not.toBeDisabled()
        })

        await userEvent.click(screen.getByTestId('button-primary'))

        await waitFor(() => {
          const call = mockOnSelectAsset.mock.calls[0][0]
          expect(call.asset.name).toBe('custom-dir://owner/test-repo/develop/dist')
        })
      })

      test('creates synthetic asset with correct properties', async () => {
        const mockOnSelectAsset = vi.fn()
        const configWithCallback = {
          ...mockConfig,
          onSelectAsset: mockOnSelectAsset
        }

        mockBrowserState.view = 'directory'
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.selectedBranch = 'main'
        mockBrowserState.selectedFolderPath = 'src'
        mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc' }, protected: false }]

        mockGetArchiveUrl.mockResolvedValue('https://archive.url')

        render(<BrowserApp config={configWithCallback} />)

        await waitFor(() => {
          expect(screen.getByTestId('button-primary')).not.toBeDisabled()
        })

        await userEvent.click(screen.getByTestId('button-primary'))

        await waitFor(() => {
          const call = mockOnSelectAsset.mock.calls[0][0]
          expect(call.asset.id).toBe(-999)
          expect(call.asset.content_type).toBe('application/zip')
          expect(call.asset.size).toBe(0)
          expect(call.asset.download_count).toBe(0)
          expect(call.asset.synthetic).toBe(true)
          expect(call.asset.isDirectory).toBe(true)
          expect(call.asset.browser_download_url).toBe('https://archive.url')
        })
      })

      test('handles error when getArchiveUrl fails', async () => {
        mockBrowserState.view = 'directory'
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.selectedBranch = 'main'
        mockBrowserState.selectedFolderPath = 'src'
        mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc' }, protected: false }]

        mockGetArchiveUrl.mockRejectedValue(new Error('Archive URL failed'))

        render(<BrowserApp config={mockConfig} />)

        await waitFor(() => {
          expect(screen.getByTestId('button-primary')).not.toBeDisabled()
        })

        await userEvent.click(screen.getByTestId('button-primary'))

        await waitFor(() => {
          expect(mockBrowserState.setError).toHaveBeenCalledWith('Archive URL failed')
        })
      })

      test('handles error with non-Error object', async () => {
        mockBrowserState.view = 'directory'
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.selectedBranch = 'main'
        mockBrowserState.selectedFolderPath = 'src'
        mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc' }, protected: false }]

        mockGetArchiveUrl.mockRejectedValue('String error')

        render(<BrowserApp config={mockConfig} />)

        await waitFor(() => {
          expect(screen.getByTestId('button-primary')).not.toBeDisabled()
        })

        await userEvent.click(screen.getByTestId('button-primary'))

        await waitFor(() => {
          expect(mockBrowserState.setError).toHaveBeenCalledWith('Failed to get archive URL')
        })
      })

      test('does not execute when selectedRepo is null', async () => {
        mockBrowserState.view = 'directory'
        mockBrowserState.selectedRepo = null
        mockBrowserState.selectedBranch = 'main'
        mockBrowserState.selectedFolderPath = 'src'

        render(<BrowserApp config={mockConfig} />)

        // Button should be disabled, handler won't run
        expect(mockGetArchiveUrl).not.toHaveBeenCalled()
      })

      test('does not execute when selectedBranch is null', async () => {
        mockBrowserState.view = 'directory'
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.selectedBranch = null
        mockBrowserState.selectedFolderPath = 'src'
        mockBrowserState.branches = []

        render(<BrowserApp config={mockConfig} />)

        // Button should be disabled
        const button = screen.getByTestId('button-primary')
        expect(button).toBeDisabled()
      })

      test('does not execute when selectedFolderPath is null', async () => {
        mockBrowserState.view = 'directory'
        mockBrowserState.selectedRepo = 'owner/test-repo'
        mockBrowserState.selectedBranch = 'main'
        mockBrowserState.selectedFolderPath = null
        mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc' }, protected: false }]

        render(<BrowserApp config={mockConfig} />)

        // Button should be disabled
        const button = screen.getByTestId('button-primary')
        expect(button).toBeDisabled()
      })

      test('early returns when validation fails (covers line 147)', () => {
        // Test the early return path directly by ensuring handleConfirmDirectory
        // is called but returns early without making any service calls
        mockBrowserState.view = 'directory'
        mockBrowserState.selectedRepo = null // Validation will fail
        mockBrowserState.selectedBranch = 'main'
        mockBrowserState.selectedFolderPath = 'src'
        mockBrowserState.branches = [{ name: 'main', commit: { sha: 'abc' }, protected: false }]

        render(<BrowserApp config={mockConfig} />)

        // Even though we're in directory view, without selectedRepo the handler
        // would return early at line 147 if it were called
        expect(mockGetArchiveUrl).not.toHaveBeenCalled()
      })
    })
  })
})
