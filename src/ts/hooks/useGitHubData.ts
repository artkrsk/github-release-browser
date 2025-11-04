import { useCallback } from 'react'
import { GitHubService } from '../services/GitHubService'
import { IRepo, IRelease } from '../interfaces'
import { TUseGitHubDataReturn } from '../types'
import { getString } from '../utils/getString'

/**
 * Hook to handle GitHub data fetching operations
 * Manages API calls, loading states, and error handling
 */
export const useGitHubData = (
  service: GitHubService,
  isMountedRef: React.MutableRefObject<boolean>,
  setRepos: (repos: IRepo[]) => void,
  repoReleases: { [key: string]: IRelease[] },
  setRepoReleases: React.Dispatch<React.SetStateAction<{ [key: string]: IRelease[] }>>,
  releaseErrors: { [key: string]: string | null },
  setReleaseErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string | null }>>,
  setLoadingRepos: (loading: boolean) => void,
  setLoadingRepo: (loading: string | null) => void,
  setError: (error: string | null) => void
) => {
  const fetchRepos = useCallback(async () => {
    setLoadingRepos(true)
    setError(null)

    try {
      const repos = await service.getUserRepos()

      if (isMountedRef.current) {
        setRepos(repos)
      }
    } catch (error) {
      if (isMountedRef.current) {
        setError(
          error instanceof Error
            ? error.message
            : 'Network error occurred'
        )
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingRepos(false)
      }
    }
  }, [service, isMountedRef, setRepos, setLoadingRepos, setError])

  const fetchReleasesForRepo = useCallback(async (repoFullName: string) => {
    if (!repoFullName || repoReleases[repoFullName]) {
      return
    }

    setLoadingRepo(repoFullName)

    try {
      const releases = await service.getReleases(repoFullName, 1)
      if (isMountedRef.current) {
        setRepoReleases((prev) => ({
          ...prev,
          [repoFullName]: releases
        }))
        setReleaseErrors((prev) => ({
          ...prev,
          [repoFullName]: null
        }))
      }
    } catch (error) {
      if (isMountedRef.current) {
        setReleaseErrors((prev) => ({
          ...prev,
          [repoFullName]: error instanceof Error ? error.message : getString('error.failedToFetchReleases')
        }))
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingRepo(null)
      }
    }
  }, [service, isMountedRef, repoReleases, setRepoReleases, releaseErrors, setReleaseErrors, setLoadingRepo])

  const refreshRepos = useCallback(async () => {
    try {
      await service.clearCache()
    } catch (e) {
      // Continue anyway
    }

    await fetchRepos()
  }, [service, fetchRepos])

  return {
    fetchRepos,
    fetchReleasesForRepo,
    refreshRepos
  } as TUseGitHubDataReturn
}