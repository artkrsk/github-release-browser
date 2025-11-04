import { IRepo, IRelease, IAsset } from '../interfaces'
import { TBrowserView } from './TBrowserView'

/**
 * Return types for custom hooks
 */

/** Return type for useBrowserState hook */
export type TUseBrowserStateReturn = {
  // View state
  view: TBrowserView
  setView: React.Dispatch<React.SetStateAction<TBrowserView>>

  // Repository state
  repos: IRepo[]
  setRepos: React.Dispatch<React.SetStateAction<IRepo[]>>
  searchQuery: string
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>
  expandedRepo: string | null
  setExpandedRepo: React.Dispatch<React.SetStateAction<string | null>>
  repoReleases: { [key: string]: IRelease[] }
  setRepoReleases: React.Dispatch<React.SetStateAction<{ [key: string]: IRelease[] }>>
  releaseErrors: { [key: string]: string | null }
  setReleaseErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string | null }>>
  loadingRepos: boolean
  setLoadingRepos: React.Dispatch<React.SetStateAction<boolean>>
  loadingRepo: string | null
  setLoadingRepo: React.Dispatch<React.SetStateAction<string | null>>

  // Selection state
  selectedRepo: string | null
  setSelectedRepo: React.Dispatch<React.SetStateAction<string | null>>
  selectedReleaseTag: string | null
  setSelectedReleaseTag: React.Dispatch<React.SetStateAction<string | null>>
  selectedRelease: IRelease | 'latest' | null
  setSelectedRelease: React.Dispatch<React.SetStateAction<IRelease | 'latest' | null>>
  selectedAssetObj: IAsset | null
  setSelectedAssetObj: React.Dispatch<React.SetStateAction<IAsset | null>>

  // Error state
  error: string | null
  setError: React.Dispatch<React.SetStateAction<string | null>>

  // Refs
  isMountedRef: React.MutableRefObject<boolean>
}

/** Return type for useGitHubData hook */
export type TUseGitHubDataReturn = {
  fetchRepos: () => Promise<void>
  fetchReleasesForRepo: (repoFullName: string) => Promise<void>
  refreshRepos: () => Promise<void>
}

/** Return type for useRepositoryActions hook */
export type TUseRepositoryActionsReturn = {
  handleRepoToggle: (repoFullName: string) => void
  handleSelectRelease: (repo: string, release: IRelease | 'latest') => void
  handleBackToRepos: () => void
}

/** Return type for useAssetConfirmation hook */
export type TUseAssetConfirmationReturn = {
  handleConfirmAsset: () => void
  canConfirmAsset: boolean
}