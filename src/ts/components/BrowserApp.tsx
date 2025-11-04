import React, { useState, useEffect } from 'react'
import { IBrowserAppProps } from '../interfaces'
import { GitHubService } from '../services/GitHubService'
import { useBrowserState } from '../hooks/useBrowserState'
import { useGitHubData } from '../hooks/useGitHubData'
import { useRepositoryActions } from '../hooks/useRepositoryActions'
import { useAssetConfirmation } from '../hooks/useAssetConfirmation'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'
import { RepositorySearch } from './RepositorySearch'
import { RepositoryList } from './RepositoryList'
import { AssetsView } from './AssetsView'
import { AppFooter } from './AppFooter'
import { getString } from '../utils/getString'

const { Button } = wp.components

/**
 * Complete GitHub Release Browser with repository browsing - refactored for better testability
 */
export const BrowserApp: React.FC<IBrowserAppProps> = ({ config }) => {
  // Initialize GitHub service
  const [service] = useState(() => new GitHubService({
    apiUrl: config.apiUrl,
    nonce: config.nonce,
    actionPrefix: config.actionPrefix
  }))

  // State management via custom hooks
  const browserState = useBrowserState()
  const {
    view, setView,
    repos, setRepos,
    searchQuery, setSearchQuery,
    expandedRepo, setExpandedRepo,
    repoReleases, setRepoReleases,
    releaseErrors, setReleaseErrors,
    loadingRepos, setLoadingRepos,
    loadingRepo, setLoadingRepo,
    selectedRepo, setSelectedRepo,
    selectedReleaseTag, setSelectedReleaseTag,
    selectedRelease, setSelectedRelease,
    selectedAssetObj, setSelectedAssetObj,
    error, setError,
    isMountedRef
  } = browserState

  // Data fetching via custom hook
  const { fetchRepos, fetchReleasesForRepo, refreshRepos } = useGitHubData(
    service,
    isMountedRef,
    setRepos,
    repoReleases,
    setRepoReleases,
    releaseErrors,
    setReleaseErrors,
    setLoadingRepos,
    setLoadingRepo,
    setError
  )

  // Repository actions via custom hook
  const { handleRepoToggle, handleSelectRelease, handleBackToRepos } = useRepositoryActions(
    setView,
    setExpandedRepo,
    setSelectedRepo,
    setSelectedRelease,
    setSelectedReleaseTag,
    fetchReleasesForRepo
  )

  // Asset confirmation via custom hook
  const { handleConfirmAsset, canConfirmAsset } = useAssetConfirmation(
    selectedRepo,
    selectedRelease,
    selectedAssetObj,
    config
  )

  useEffect(() => {
    isMountedRef.current = true
    fetchRepos()

    return () => {
      isMountedRef.current = false
    }
  }, [fetchRepos, isMountedRef])

  // Render loading state
  if (loadingRepos) {
    return (
      <>
        <LoadingState message={config.strings?.['loading.repositories'] || getString('loading.repositories')} />
        <AppFooter
          primaryButton={
            <Button variant="primary" disabled={true}>
              {config.strings?.insertIntoDownload || getString('actions.insertIntoDownload')}
            </Button>
          }
          config={config}
        />
      </>
    )
  }

  // Render error state
  if (error) {
    return (
      <>
        <ErrorState
          error={error}
          onRetry={fetchRepos}
        />
        <AppFooter
          primaryButton={
            <Button variant="primary" disabled={true}>
              {config.strings?.insertIntoDownload || getString('actions.insertIntoDownload')}
            </Button>
          }
          config={config}
        />
      </>
    )
  }

  // Render assets view
  if (view === 'assets' && selectedRepo && selectedRelease) {
    return (
      <>
        <AssetsView
          selectedRepo={selectedRepo}
          selectedRelease={selectedRelease}
          selectedAsset={selectedAssetObj}
          repoReleases={repoReleases}
          onSelectAsset={setSelectedAssetObj}
          onBack={handleBackToRepos}
          config={config}
        />
        <AppFooter
          primaryButton={
            <Button
              variant="primary"
              onClick={handleConfirmAsset}
              disabled={!canConfirmAsset}
            >
              {config.strings?.insertIntoDownload || getString('actions.insertIntoDownload')}
            </Button>
          }
          config={config}
        />
      </>
    )
  }

  // Render repositories view
  return (
    <>
      <div className="github-release-browser-browser__main">
        <RepositorySearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={refreshRepos}
          refreshDisabled={loadingRepos}
          strings={config.strings}
        />

        <RepositoryList
          repos={repos}
          searchQuery={searchQuery}
          expandedRepo={expandedRepo}
          selectedRepo={selectedRepo}
          repoReleases={repoReleases}
          releaseErrors={releaseErrors}
          loadingRepo={loadingRepo}
          selectedReleaseTag={selectedReleaseTag}
          onRepoToggle={handleRepoToggle}
          onSelectRelease={handleSelectRelease}
          fetchReleasesForRepo={fetchReleasesForRepo}
          config={config}
        />
      </div>

      <AppFooter
        primaryButton={
          <Button
            variant="primary"
            onClick={handleConfirmAsset}
            disabled={!canConfirmAsset}
          >
            {config.strings?.insertIntoDownload || getString('actions.insertIntoDownload')}
          </Button>
        }
        config={config}
      />
    </>
  )
}
