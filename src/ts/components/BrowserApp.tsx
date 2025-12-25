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
    setSearchQuery,
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
    setDirectoryContents([])  // Clear old contents to prevent flash of previous repo
    setBranches([])           // Clear old branches
    fetchBranches(repoFullName)
    fetchRepoInfo(repoFullName)
  }

  const handleRepoClick = (repoFullName: string) => {
    console.log('[DEBUG] handleRepoClick called:', { repoFullName, sourceMode })
    if (sourceMode === 'directory') {
      console.log('[DEBUG] Navigating to directory view for:', repoFullName)
      handleSelectRepoForDirectory(repoFullName)
    } else {
      console.log('[DEBUG] Toggling releases for:', repoFullName)
      handleRepoToggle(repoFullName)
    }
  }

  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch)
    setCurrentPath('')
    setSelectedFolderPath(null)
    setDirectoryContents([])  // Clear old contents before fetching new branch
    if (selectedRepo) {
      fetchContents(selectedRepo, '', branch)
    }
  }

  const handleNavigate = (path: string) => {
    setCurrentPath(path)
    setDirectoryContents([])  // Clear old contents before navigating
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

      // Build complete github-dir:// URI
      const dirProtocol = config.dirProtocol || 'github-dir://'
      const folderPath = selectedFolderPath || ''
      const directoryUri = `${dirProtocol}${selectedRepo}/${selectedBranch}${folderPath ? `/${folderPath}` : ''}`

      // Create synthetic asset for directory
      // asset.name contains the full github-dir:// URI for easy consumer usage
      const directoryAsset = {
        id: -999,
        name: directoryUri,
        content_type: 'application/zip',
        size: 0,
        download_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        browser_download_url: archiveUrl,
        synthetic: true,
        isDirectory: true
      }

      config.onSelectAsset({
        repo: selectedRepo,
        release: selectedBranch,
        asset: directoryAsset,
        downloadUrl: archiveUrl
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : getString('error.archiveUrlFailed'))
    }
  }

  const canConfirmDirectory = selectedRepo !== null && selectedBranch !== null && selectedFolderPath !== null

  // Refresh handlers for cache busting
  const handleRefreshAssets = async () => {
    if (!selectedRepo) return

    setLoadingRepo(selectedRepo)
    setError(null)

    try {
      // Clear specific releases cache for this repo
      await service.clearReleasesCache(selectedRepo)

      // Clear local state to force UI refresh
      setRepoReleases((prev) => {
        const updated = { ...prev }
        delete updated[selectedRepo]
        return updated
      })

      // Re-fetch releases (cache is now cleared on backend)
      const releases = await service.getReleases(selectedRepo, 1)
      if (isMountedRef.current) {
        setRepoReleases((prev) => ({
          ...prev,
          [selectedRepo]: releases
        }))
      }
    } catch (error) {
      if (isMountedRef.current) {
        setError(error instanceof Error ? error.message : getString('error.refreshFailed'))
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingRepo(null)
      }
    }
  }

  const handleRefreshDirectory = async () => {
    if (!selectedRepo || !selectedBranch) return

    setLoadingBranches(true)
    setLoadingContents(true)
    setError(null)

    try {
      // Clear specific branches cache for this repo
      await service.clearBranchesCache(selectedRepo)

      // Clear local state
      setDirectoryContents([])
      setBranches([])

      // Re-fetch branches and contents (cache is now cleared on backend)
      await fetchBranches(selectedRepo)

      // fetchBranches will auto-fetch contents, but if we have a current path, ensure it's refreshed
      if (currentPath && selectedBranch) {
        await fetchContents(selectedRepo, currentPath, selectedBranch)
      }
    } catch (error) {
      if (isMountedRef.current) {
        setError(error instanceof Error ? error.message : getString('error.refreshFailed'))
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingBranches(false)
        setLoadingContents(false)
      }
    }
  }

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
          onRefresh={handleRefreshDirectory}
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
          onRefresh={handleRefreshAssets}
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
          sourceMode={sourceMode}
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
