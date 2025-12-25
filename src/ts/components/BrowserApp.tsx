import React, { useState, useEffect } from 'react'
import { IBrowserAppProps } from '../interfaces'
import { GitHubService } from '../services/GitHubService'
import { useBrowserState } from '../hooks/useBrowserState'
import { useGitHubData } from '../hooks/useGitHubData'
import { useDirectoryData } from '../hooks/useDirectoryData'
import { useRepositoryActions } from '../hooks/useRepositoryActions'
import { useAssetConfirmation } from '../hooks/useAssetConfirmation'
import { LoadingState } from './LoadingState'
import { ErrorState } from './ErrorState'
import { RepositorySearch } from './RepositorySearch'
import { RepositoryList } from './RepositoryList'
import { AssetsView } from './AssetsView'
import { DirectoryView } from './DirectoryView'
import { SourceModeToggle } from './SourceModeToggle'
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
    sourceMode, setSourceMode,
    branches, setBranches,
    selectedBranch, setSelectedBranch,
    currentPath, setCurrentPath,
    selectedFolderPath, setSelectedFolderPath,
    directoryContents, setDirectoryContents,
    loadingBranches, setLoadingBranches,
    loadingContents, setLoadingContents,
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

  // Directory data fetching via custom hook
  const { fetchBranches, fetchContents, fetchRepoInfo } = useDirectoryData(
    service,
    isMountedRef,
    setBranches,
    setSelectedBranch,
    setDirectoryContents,
    setLoadingBranches,
    setLoadingContents,
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

  // Directory-specific handlers
  const handleSelectRepoForDirectory = (repoFullName: string) => {
    setSelectedRepo(repoFullName)
    setView('directory')
    setCurrentPath('')
    setSelectedFolderPath(null)
    fetchBranches(repoFullName)
    fetchRepoInfo(repoFullName)
  }

  const handleRepoClick = (repoFullName: string) => {
    if (sourceMode === 'directory') {
      handleSelectRepoForDirectory(repoFullName)
    } else {
      handleRepoToggle(repoFullName)
    }
  }

  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch)
    setCurrentPath('')
    setSelectedFolderPath(null)
    if (selectedRepo) {
      fetchContents(selectedRepo, '', branch)
    }
  }

  const handleNavigate = (path: string) => {
    setCurrentPath(path)
    if (selectedRepo && selectedBranch) {
      fetchContents(selectedRepo, path, selectedBranch)
    }
  }

  const handleConfirmDirectory = async () => {
    if (!selectedRepo || !selectedBranch || selectedFolderPath === null) {
      return
    }

    try {
      const archiveUrl = await service.getArchiveUrl(selectedRepo, selectedBranch)

      // Create synthetic asset for directory
      const directoryAsset = {
        id: -999,
        name: `${selectedRepo}/${selectedBranch}${selectedFolderPath ? `/${selectedFolderPath}` : ''}`,
        content_type: 'application/zip',
        size: 0,
        download_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        browser_download_url: archiveUrl,
        synthetic: true
      }

      config.onSelectAsset({
        repo: selectedRepo,
        release: selectedBranch,
        asset: directoryAsset,
        downloadUrl: archiveUrl
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to get archive URL')
    }
  }

  const canConfirmDirectory = selectedRepo !== null && selectedBranch !== null && selectedFolderPath !== null

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

  // Render directory view
  if (view === 'directory' && selectedRepo) {
    return (
      <>
        <DirectoryView
          selectedRepo={selectedRepo}
          branches={branches}
          selectedBranch={selectedBranch}
          currentPath={currentPath}
          selectedFolderPath={selectedFolderPath}
          directoryContents={directoryContents}
          loadingBranches={loadingBranches}
          loadingContents={loadingContents}
          onSelectBranch={handleBranchChange}
          onNavigate={handleNavigate}
          onSelectFolder={setSelectedFolderPath}
          onBack={handleBackToRepos}
        />
        <AppFooter
          primaryButton={
            <Button
              variant="primary"
              onClick={handleConfirmDirectory}
              disabled={!canConfirmDirectory}
            >
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
  const isDirectoriesEnabled = config.features?.directories === true

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

        {isDirectoriesEnabled && (
          <SourceModeToggle
            mode={sourceMode}
            onModeChange={setSourceMode}
            disabled={loadingRepos}
          />
        )}

        <RepositoryList
          repos={repos}
          searchQuery={searchQuery}
          expandedRepo={sourceMode === 'releases' ? expandedRepo : null}
          selectedRepo={selectedRepo}
          repoReleases={repoReleases}
          releaseErrors={releaseErrors}
          loadingRepo={loadingRepo}
          selectedReleaseTag={selectedReleaseTag}
          onRepoToggle={handleRepoClick}
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
