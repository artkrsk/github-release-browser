import { useCallback } from 'react'
import { GitHubService } from '../services/GitHubService'
import { IBranch, IContentItem } from '../interfaces'
import { TUseDirectoryDataReturn } from '../types'

/**
 * Hook to handle directory data fetching operations
 * Manages API calls for branches, contents, and repo info
 */
export const useDirectoryData = (
  service: GitHubService,
  isMountedRef: React.MutableRefObject<boolean>,
  setBranches: React.Dispatch<React.SetStateAction<IBranch[]>>,
  setSelectedBranch: React.Dispatch<React.SetStateAction<string | null>>,
  setDirectoryContents: React.Dispatch<React.SetStateAction<IContentItem[]>>,
  setLoadingBranches: React.Dispatch<React.SetStateAction<boolean>>,
  setLoadingContents: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
): TUseDirectoryDataReturn => {
  const fetchBranches = useCallback(async (repo: string) => {
    setLoadingBranches(true)

    try {
      const branches = await service.getBranches(repo)

      if (isMountedRef.current) {
        setBranches(branches)

        // Auto-select default branch if available
        if (branches.length > 0 && !branches.find(b => b.name === 'main')) {
          // If no 'main', try to get repo info for default branch
          try {
            const repoInfo = await service.getRepoInfo(repo)
            if (isMountedRef.current) {
              setSelectedBranch(repoInfo.default_branch)
            }
          } catch {
            // Fallback to first branch
            if (isMountedRef.current) {
              setSelectedBranch(branches[0].name)
            }
          }
        } else {
          setSelectedBranch('main')
        }
      }
    } catch (error) {
      if (isMountedRef.current) {
        setError(error instanceof Error ? error.message : 'Failed to fetch branches')
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingBranches(false)
      }
    }
  }, [service, isMountedRef, setBranches, setSelectedBranch, setLoadingBranches, setError])

  const fetchContents = useCallback(async (repo: string, path: string, ref: string) => {
    setLoadingContents(true)

    try {
      const contents = await service.getContents(repo, path, ref)

      if (isMountedRef.current) {
        setDirectoryContents(contents)
      }
    } catch (error) {
      if (isMountedRef.current) {
        setDirectoryContents([])
        setError(error instanceof Error ? error.message : 'Failed to fetch directory contents')
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingContents(false)
      }
    }
  }, [service, isMountedRef, setDirectoryContents, setLoadingContents, setError])

  const fetchRepoInfo = useCallback(async (repo: string) => {
    try {
      const repoInfo = await service.getRepoInfo(repo)

      if (isMountedRef.current) {
        setSelectedBranch(repoInfo.default_branch)
      }
    } catch (error) {
      if (isMountedRef.current) {
        setSelectedBranch('main')
      }
    }
  }, [service, isMountedRef, setSelectedBranch])

  return {
    fetchBranches,
    fetchContents,
    fetchRepoInfo
  }
}
