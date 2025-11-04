import { useCallback } from 'react'
import { IRelease } from '../interfaces'
import { TBrowserView, TUseRepositoryActionsReturn } from '../types'

/**
 * Hook to handle repository-related actions and view transitions
 * Manages repository selection, release selection, and view state changes
 */
export const useRepositoryActions = (
  setView: (view: TBrowserView) => void,
  setExpandedRepo: React.Dispatch<React.SetStateAction<string | null>>,
  setSelectedRepo: (repo: string | null) => void,
  setSelectedRelease: (release: IRelease | 'latest' | null) => void,
  setSelectedReleaseTag: (tag: string | null) => void,
  fetchReleasesForRepo: (repoFullName: string) => Promise<void>
) => {
  const handleRepoToggle = useCallback((repoFullName: string) => {
    if (!repoFullName) return // Early return for undefined values
    setExpandedRepo((prev) => {
      if (prev === repoFullName) {
        return null
      } else {
        fetchReleasesForRepo(repoFullName)
        return repoFullName
      }
    })
  }, [setExpandedRepo, fetchReleasesForRepo])

  const handleSelectRelease = useCallback((repo: string, release: IRelease | 'latest') => {
    setSelectedRepo(repo)
    setSelectedRelease(release)
    if (release !== 'latest') {
      setSelectedReleaseTag(release.tag_name)
    } else {
      setSelectedReleaseTag(null)
    }
    setView('assets')
  }, [setSelectedRepo, setSelectedRelease, setSelectedReleaseTag, setView])

  const handleBackToRepos = useCallback(() => {
    setView('repos')
  }, [setView])

  return {
    handleRepoToggle,
    handleSelectRelease,
    handleBackToRepos
  } as TUseRepositoryActionsReturn
}