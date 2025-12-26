import { renderHook, act, waitFor } from '@testing-library/react'
import { useDirectoryData } from '@/hooks/useDirectoryData'
import { GitHubService } from '@/services/GitHubService'
import { IBranch, IContentItem } from '@/interfaces'

describe('useDirectoryData', () => {
  let mockService: GitHubService
  let mockIsMountedRef: React.MutableRefObject<boolean>
  let mockSetBranches: vi.Mock
  let mockSetSelectedBranch: vi.Mock
  let mockSetDirectoryContents: vi.Mock
  let mockSetLoadingBranches: vi.Mock
  let mockSetLoadingContents: vi.Mock
  let mockSetError: vi.Mock

  const mockBranches: IBranch[] = [
    { name: 'main', commit: { sha: 'abc123', url: 'https://...' }, protected: false },
    { name: 'develop', commit: { sha: 'def456', url: 'https://...' }, protected: false }
  ]

  const mockContents: IContentItem[] = [
    { name: 'src', path: 'src', sha: '111', size: 0, type: 'dir', download_url: null, html_url: 'https://...' },
    { name: 'README.md', path: 'README.md', sha: '222', size: 100, type: 'file', download_url: 'https://...', html_url: 'https://...' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    mockIsMountedRef = { current: true }
    mockSetBranches = vi.fn()
    mockSetSelectedBranch = vi.fn()
    mockSetDirectoryContents = vi.fn()
    mockSetLoadingBranches = vi.fn()
    mockSetLoadingContents = vi.fn()
    mockSetError = vi.fn()

    mockService = {
      getBranches: vi.fn().mockResolvedValue(mockBranches),
      getContents: vi.fn().mockResolvedValue(mockContents),
      getRepoInfo: vi.fn().mockResolvedValue({ default_branch: 'main', full_name: 'owner/repo', private: false })
    } as any
  })

  describe('fetchBranches', () => {
    test('fetches branches and auto-selects main branch', async () => {
      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      await act(async () => {
        await result.current.fetchBranches('owner/repo')
      })

      expect(mockService.getBranches).toHaveBeenCalledWith('owner/repo')
      expect(mockSetBranches).toHaveBeenCalledWith(mockBranches)
      expect(mockSetSelectedBranch).toHaveBeenCalledWith('main')
    })

    test('fetches default branch when main not found', async () => {
      const branchesWithoutMain: IBranch[] = [
        { name: 'master', commit: { sha: 'abc', url: 'https://...' }, protected: false }
      ]
      mockService.getBranches = vi.fn().mockResolvedValue(branchesWithoutMain)

      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      await act(async () => {
        await result.current.fetchBranches('owner/repo')
      })

      expect(mockService.getRepoInfo).toHaveBeenCalledWith('owner/repo')
      expect(mockSetSelectedBranch).toHaveBeenCalledWith('main')
    })

    test('sets error when branch fetch fails', async () => {
      mockService.getBranches = vi.fn().mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      await act(async () => {
        await result.current.fetchBranches('owner/repo')
      })

      expect(mockSetError).toHaveBeenCalledWith('API Error')
    })

    test('sets generic error message when branch fetch throws non-Error', async () => {
      mockService.getBranches = vi.fn().mockRejectedValue('string error')

      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      await act(async () => {
        await result.current.fetchBranches('owner/repo')
      })

      expect(mockSetError).toHaveBeenCalledWith('Failed to fetch branches')
    })

    test('does not set branch if unmounted after branches but before selectedBranch', async () => {
      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      // Unmount after branches are set
      mockService.getBranches = vi.fn().mockImplementation(async () => {
        const branches = mockBranches
        if (mockIsMountedRef.current) {
          mockSetBranches(branches)
        }
        mockIsMountedRef.current = false // Unmount here
        return branches
      })

      await act(async () => {
        await result.current.fetchBranches('owner/repo')
      })

      // Should not set selectedBranch or contents since unmounted
      expect(mockSetSelectedBranch).not.toHaveBeenCalled()
      expect(mockSetDirectoryContents).not.toHaveBeenCalled()
    })

    test('sets loading states correctly', async () => {
      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      const fetchPromise = act(async () => {
        await result.current.fetchBranches('owner/repo')
      })

      // Should set loading true before fetch
      expect(mockSetLoadingBranches).toHaveBeenCalledWith(true)

      await fetchPromise

      // Should set loading false after fetch
      expect(mockSetLoadingBranches).toHaveBeenCalledWith(false)
    })

    test('falls back to first branch when no main and getRepoInfo fails', async () => {
      const branchesWithoutMain: IBranch[] = [
        { name: 'develop', commit: { sha: 'abc', url: 'https://...' }, protected: false },
        { name: 'feature', commit: { sha: 'def', url: 'https://...' }, protected: false }
      ]
      mockService.getBranches = vi.fn().mockResolvedValue(branchesWithoutMain)
      mockService.getRepoInfo = vi.fn().mockRejectedValue(new Error('Repo info failed'))

      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      await act(async () => {
        await result.current.fetchBranches('owner/repo')
      })

      expect(mockService.getRepoInfo).toHaveBeenCalledWith('owner/repo')
      expect(mockSetSelectedBranch).toHaveBeenCalledWith('develop')
    })

    test('sets error when initial contents fetch fails during fetchBranches', async () => {
      mockService.getBranches = vi.fn().mockResolvedValue(mockBranches)
      mockService.getContents = vi.fn().mockRejectedValue(new Error('Contents fetch failed'))

      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      await act(async () => {
        await result.current.fetchBranches('owner/repo')
      })

      expect(mockService.getContents).toHaveBeenCalledWith('owner/repo', '', 'main')
      expect(mockSetError).toHaveBeenCalledWith('Contents fetch failed')
    })

    test('sets generic error message when initial contents fetch throws non-Error', async () => {
      mockService.getBranches = vi.fn().mockResolvedValue(mockBranches)
      mockService.getContents = vi.fn().mockRejectedValue('string error')

      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      await act(async () => {
        await result.current.fetchBranches('owner/repo')
      })

      expect(mockSetError).toHaveBeenCalledWith('Failed to fetch directory contents')
    })

    test('does not set error if unmounted during initial contents fetch failure', async () => {
      mockService.getBranches = vi.fn().mockResolvedValue(mockBranches)
      mockService.getContents = vi.fn().mockImplementation(async () => {
        mockIsMountedRef.current = false
        throw new Error('Contents fetch failed')
      })

      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      await act(async () => {
        await result.current.fetchBranches('owner/repo')
      })

      expect(mockSetError).not.toHaveBeenCalled()
    })
  })

  describe('fetchContents', () => {
    test('fetches directory contents successfully', async () => {
      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      await act(async () => {
        await result.current.fetchContents('owner/repo', 'src', 'main')
      })

      expect(mockService.getContents).toHaveBeenCalledWith('owner/repo', 'src', 'main')
      expect(mockSetDirectoryContents).toHaveBeenCalledWith(mockContents)
    })

    test('sets error when contents fetch fails', async () => {
      mockService.getContents = vi.fn().mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      await act(async () => {
        await result.current.fetchContents('owner/repo', 'src', 'main')
      })

      expect(mockSetDirectoryContents).toHaveBeenCalledWith([])
      expect(mockSetError).toHaveBeenCalledWith('Not found')
    })

    test('sets generic error message when contents fetch throws non-Error', async () => {
      mockService.getContents = vi.fn().mockRejectedValue('string error')

      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      await act(async () => {
        await result.current.fetchContents('owner/repo', 'src', 'main')
      })

      expect(mockSetDirectoryContents).toHaveBeenCalledWith([])
      expect(mockSetError).toHaveBeenCalledWith('Failed to fetch directory contents')
    })
  })

  describe('fetchRepoInfo', () => {
    test('fetches repo info and sets default branch', async () => {
      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      await act(async () => {
        await result.current.fetchRepoInfo('owner/repo')
      })

      expect(mockService.getRepoInfo).toHaveBeenCalledWith('owner/repo')
      expect(mockSetSelectedBranch).toHaveBeenCalledWith('main')
    })

    test('falls back to main when repo info fetch fails', async () => {
      mockService.getRepoInfo = vi.fn().mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      await act(async () => {
        await result.current.fetchRepoInfo('owner/repo')
      })

      expect(mockSetSelectedBranch).toHaveBeenCalledWith('main')
    })

    test('does not set branch if unmounted during success', async () => {
      mockIsMountedRef.current = false

      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      await act(async () => {
        await result.current.fetchRepoInfo('owner/repo')
      })

      expect(mockSetSelectedBranch).not.toHaveBeenCalled()
    })

    test('does not set branch if unmounted during error', async () => {
      mockService.getRepoInfo = vi.fn().mockRejectedValue(new Error('Not found'))
      mockIsMountedRef.current = false

      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      await act(async () => {
        await result.current.fetchRepoInfo('owner/repo')
      })

      expect(mockSetSelectedBranch).not.toHaveBeenCalled()
    })
  })

  describe('Unmounted state handling', () => {
    test('does not update state if unmounted before fetchBranches completes', async () => {
      mockIsMountedRef.current = false

      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      await act(async () => {
        await result.current.fetchBranches('owner/repo')
      })

      expect(mockSetBranches).not.toHaveBeenCalled()
      expect(mockSetLoadingBranches).not.toHaveBeenCalledWith(false)
    })

    test('does not update state if unmounted before fetchContents completes', async () => {
      mockIsMountedRef.current = false

      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      await act(async () => {
        await result.current.fetchContents('owner/repo', 'src', 'main')
      })

      expect(mockSetDirectoryContents).not.toHaveBeenCalled()
      expect(mockSetLoadingContents).not.toHaveBeenCalledWith(false)
    })

    test('does not set error if unmounted during fetchBranches error', async () => {
      mockService.getBranches = vi.fn().mockRejectedValue(new Error('API Error'))
      mockIsMountedRef.current = false

      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      await act(async () => {
        await result.current.fetchBranches('owner/repo')
      })

      expect(mockSetError).not.toHaveBeenCalled()
      expect(mockSetLoadingBranches).not.toHaveBeenCalledWith(false)
    })

    test('does not set error if unmounted during fetchContents error', async () => {
      mockService.getContents = vi.fn().mockRejectedValue(new Error('Not found'))
      mockIsMountedRef.current = false

      const { result } = renderHook(() =>
        useDirectoryData(
          mockService,
          mockIsMountedRef,
          mockSetBranches,
          mockSetSelectedBranch,
          mockSetDirectoryContents,
          mockSetLoadingBranches,
          mockSetLoadingContents,
          mockSetError
        )
      )

      await act(async () => {
        await result.current.fetchContents('owner/repo', 'src', 'main')
      })

      expect(mockSetDirectoryContents).not.toHaveBeenCalledWith([])
      expect(mockSetError).not.toHaveBeenCalled()
      expect(mockSetLoadingContents).not.toHaveBeenCalledWith(false)
    })
  })
})
