import { vi } from 'vitest'

/** Create default mock browser state */
export const createDefaultMockState = () => ({
  view: 'repos',
  repos: [],
  searchQuery: '',
  expandedRepo: null,
  selectedRepo: null,
  repoReleases: {},
  releaseErrors: {},
  loadingRepos: false,
  loadingRepo: null,
  selectedReleaseTag: null,
  selectedRelease: null,
  selectedAssetObj: null,
  error: null,
  // Directory state
  sourceMode: 'releases' as 'releases' | 'directory',
  branches: [],
  selectedBranch: null,
  currentPath: '',
  selectedFolderPath: null,
  directoryContents: [],
  loadingBranches: false,
  loadingContents: false,
  isMountedRef: { current: true },
  setView: vi.fn(),
  setRepos: vi.fn(),
  setSearchQuery: vi.fn(),
  setExpandedRepo: vi.fn(),
  setSelectedRepo: vi.fn(),
  setRepoReleases: vi.fn(),
  setReleaseErrors: vi.fn(),
  setLoadingRepos: vi.fn(),
  setLoadingRepo: vi.fn(),
  setSelectedReleaseTag: vi.fn(),
  setSelectedRelease: vi.fn(),
  setSelectedAssetObj: vi.fn(),
  setError: vi.fn(),
  // Directory setters
  setSourceMode: vi.fn(),
  setBranches: vi.fn(),
  setSelectedBranch: vi.fn(),
  setCurrentPath: vi.fn(),
  setSelectedFolderPath: vi.fn(),
  setDirectoryContents: vi.fn(),
  setLoadingBranches: vi.fn(),
  setLoadingContents: vi.fn()
})

/** Create default mock GitHub data */
export const createDefaultMockGitHubData = () => ({
  fetchRepos: vi.fn(),
  fetchReleasesForRepo: vi.fn(),
  refreshRepos: vi.fn()
})

/** Create default mock repository actions */
export const createDefaultMockRepositoryActions = () => ({
  handleRepoToggle: vi.fn(),
  handleSelectRelease: vi.fn(),
  handleBackToRepos: vi.fn()
})

/** Create default mock asset confirmation */
export const createDefaultMockAssetConfirmation = () => ({
  handleConfirmAsset: vi.fn(),
  canConfirmAsset: false
})

/** Create default mock directory data */
export const createDefaultMockDirectoryData = () => ({
  fetchBranches: vi.fn(),
  fetchContents: vi.fn(),
  fetchRepoInfo: vi.fn()
})
