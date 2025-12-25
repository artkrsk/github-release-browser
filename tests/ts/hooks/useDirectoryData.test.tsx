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
  })
})
