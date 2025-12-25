import { useCallback } from 'react'
import { GitHubService } from '../services/GitHubService'
import { IBranch, IContentItem } from '../interfaces'
import { TUseDirectoryDataReturn } from '../types'
import { getString } from '../utils/getString'

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

        // Auto-select default branch and fetch its contents
        const defaultBranchName = getString('common.defaultBranch')
        let defaultBranch = defaultBranchName
        if (branches.length > 0 && !branches.find(b => b.name === defaultBranchName)) {
          // If no default branch, try to get repo info for default branch
          try {
            const repoInfo = await service.getRepoInfo(repo)
            defaultBranch = repoInfo.default_branch
          } catch {
            // Fallback to first branch
            defaultBranch = branches[0].name
          }
        }

        if (isMountedRef.current) {
          setSelectedBranch(defaultBranch)

          // Fetch initial directory contents for the default branch
          try {
            const contents = await service.getContents(repo, '', defaultBranch)
            if (isMountedRef.current) {
              setDirectoryContents(contents)
            }
          } catch (error) {
            if (isMountedRef.current) {
              setError(error instanceof Error ? error.message : getString('error.failedToFetchContents'))
            }
          }
        }
      }
    } catch (error) {
      if (isMountedRef.current) {
        setError(error instanceof Error ? error.message : getString('error.failedToFetchBranches'))
      }
    } finally {
      if (isMountedRef.current) {
        setLoadingBranches(false)
      }
    }
  }, [service, isMountedRef, setBranches, setSelectedBranch, setDirectoryContents, setLoadingBranches, setError])

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
        setError(error instanceof Error ? error.message : getString('error.failedToFetchContents'))
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
        setSelectedBranch(getString('common.defaultBranch'))
      }
    }
  }, [service, isMountedRef, setSelectedBranch])

  return {
    fetchBranches,
    fetchContents,
    fetchRepoInfo
  }
}
