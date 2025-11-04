import { renderHook, act, waitFor } from '@testing-library/react'
import { useGitHubData } from '@/hooks/useGitHubData'
import { GitHubService } from '@/services/GitHubService'
import { IRepo, IRelease } from '@/interfaces'
import { TUseGitHubDataReturn } from '@/types'
import { createMockRepo, createMockRelease } from '@test-utils'

// Mock GitHubService
vi.mock('@/services/GitHubService')

describe('useGitHubData', () => {
  let mockService: jest.Mocked<GitHubService>
  let mockSetRepos: vi.Mock
  let mockSetRepoReleases: vi.Mock
  let mockSetReleaseErrors: vi.Mock
  let mockSetLoadingRepos: vi.Mock
  let mockSetLoadingRepo: vi.Mock
  let mockSetError: vi.Mock
  let isMountedRef: React.MutableRefObject<boolean>

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()

    // Setup mock service
    mockService = new GitHubService({
      apiUrl: 'https://example.com/api',
      nonce: 'test-nonce',
      actionPrefix: 'github'
    }) as jest.Mocked<GitHubService>

    // Setup mock functions
    mockSetRepos = vi.fn()
    mockSetRepoReleases = vi.fn()
    mockSetReleaseErrors = vi.fn()
    mockSetLoadingRepos = vi.fn()
    mockSetLoadingRepo = vi.fn()
    mockSetError = vi.fn()

    // Setup mounted ref
    isMountedRef = { current: true }
  })

  it('should fetch repos successfully', async () => {
    const mockRepos: IRepo[] = [createMockRepo()]
    mockService.getUserRepos.mockResolvedValue(mockRepos)

    const { result } = renderHook(() =>
      useGitHubData(
        mockService,
        isMountedRef,
        mockSetRepos,
        {},
        mockSetRepoReleases,
        {},
        mockSetReleaseErrors,
        mockSetLoadingRepos,
        mockSetLoadingRepo,
        mockSetError
      )
    )

    act(() => {
      result.current.fetchRepos()
    })

    // Should set loading to true
    expect(mockSetLoadingRepos).toHaveBeenCalledWith(true)
    expect(mockSetError).toHaveBeenCalledWith(null)

    // Wait for async operation
    await waitFor(() => {
      expect(mockService.getUserRepos).toHaveBeenCalledTimes(1)
    })

    // Should update repos and set loading to false
    expect(mockSetRepos).toHaveBeenCalledWith(mockRepos)
    expect(mockSetLoadingRepos).toHaveBeenCalledWith(false)
  })

  it('should handle fetch repos error', async () => {
    const errorMessage = 'Network error'
    mockService.getUserRepos.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() =>
      useGitHubData(
        mockService,
        isMountedRef,
        mockSetRepos,
        {},
        mockSetRepoReleases,
        {},
        mockSetReleaseErrors,
        mockSetLoadingRepos,
        mockSetLoadingRepo,
        mockSetError
      )
    )

    act(() => {
      result.current.fetchRepos()
    })

    await waitFor(() => {
      expect(mockService.getUserRepos).toHaveBeenCalledTimes(1)
    })

    expect(mockSetError).toHaveBeenCalledWith(errorMessage)
    expect(mockSetLoadingRepos).toHaveBeenCalledWith(false)
  })

  it('should handle fetch repos error with non-Error object', async () => {
    mockService.getUserRepos.mockRejectedValue('String error')

    const { result } = renderHook(() =>
      useGitHubData(
        mockService,
        isMountedRef,
        mockSetRepos,
        {},
        mockSetRepoReleases,
        {},
        mockSetReleaseErrors,
        mockSetLoadingRepos,
        mockSetLoadingRepo,
        mockSetError
      )
    )

    act(() => {
      result.current.fetchRepos()
    })

    await waitFor(() => {
      expect(mockService.getUserRepos).toHaveBeenCalledTimes(1)
    })

    expect(mockSetError).toHaveBeenCalledWith('Network error occurred')
    expect(mockSetLoadingRepos).toHaveBeenCalledWith(false)
  })

  it('should not update state if component is unmounted during fetchRepos', async () => {
    const mockRepos: IRepo[] = [createMockRepo()]
    mockService.getUserRepos.mockResolvedValue(mockRepos)

    // Simulate component unmounted
    isMountedRef.current = false

    const { result } = renderHook(() =>
      useGitHubData(
        mockService,
        isMountedRef,
        mockSetRepos,
        {},
        mockSetRepoReleases,
        {},
        mockSetReleaseErrors,
        mockSetLoadingRepos,
        mockSetLoadingRepo,
        mockSetError
      )
    )

    act(() => {
      result.current.fetchRepos()
    })

    await waitFor(() => {
      expect(mockService.getUserRepos).toHaveBeenCalledTimes(1)
    })

    // Should not update state if unmounted
    expect(mockSetRepos).not.toHaveBeenCalled()
    expect(mockSetLoadingRepos).not.toHaveBeenCalledWith(false)
  })

  it('should fetch releases for repo successfully', async () => {
    const repoFullName = 'owner/test-repo'
    const mockReleases: IRelease[] = [createMockRelease()]
    const currentRepoReleases = {}

    mockService.getReleases.mockResolvedValue(mockReleases)

    const { result } = renderHook(() =>
      useGitHubData(
        mockService,
        isMountedRef,
        mockSetRepos,
        currentRepoReleases,
        mockSetRepoReleases,
        {},
        mockSetReleaseErrors,
        mockSetLoadingRepos,
        mockSetLoadingRepo,
        mockSetError
      )
    )

    act(() => {
      result.current.fetchReleasesForRepo(repoFullName)
    })

    expect(mockSetLoadingRepo).toHaveBeenCalledWith(repoFullName)

    await waitFor(() => {
      expect(mockService.getReleases).toHaveBeenCalledWith(repoFullName, 1)
    })

    expect(mockSetRepoReleases).toHaveBeenCalledWith(
      expect.any(Function)
    )

    // Test that the updater function works correctly
    const updater = mockSetRepoReleases.mock.calls[0][0]
    const resultState = updater(currentRepoReleases)
    expect(resultState).toEqual({
      [repoFullName]: mockReleases
    })

    // Should also clear any errors for this repo
    expect(mockSetReleaseErrors).toHaveBeenCalledWith(expect.any(Function))
    const errorSetter = mockSetReleaseErrors.mock.calls[0][0]
    const errorState = errorSetter({})
    expect(errorState[repoFullName]).toBeNull()
  })

  it('should not fetch releases if already cached', async () => {
    const repoFullName = 'owner/test-repo'
    const mockReleases: IRelease[] = [createMockRelease()]
    const currentRepoReleases = { [repoFullName]: mockReleases }

    const { result } = renderHook(() =>
      useGitHubData(
        mockService,
        isMountedRef,
        mockSetRepos,
        currentRepoReleases,
        mockSetRepoReleases,
        {},
        mockSetReleaseErrors,
        mockSetLoadingRepos,
        mockSetLoadingRepo,
        mockSetError
      )
    )

    act(() => {
      result.current.fetchReleasesForRepo(repoFullName)
    })

    // Should not make API call if already cached
    expect(mockService.getReleases).not.toHaveBeenCalled()
    expect(mockSetLoadingRepo).not.toHaveBeenCalled()
  })

  it('should handle fetch releases error gracefully', async () => {
    const repoFullName = 'owner/test-repo'
    const currentRepoReleases = {}

    mockService.getReleases.mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() =>
      useGitHubData(
        mockService,
        isMountedRef,
        mockSetRepos,
        currentRepoReleases,
        mockSetRepoReleases,
        {},
        mockSetReleaseErrors,
        mockSetLoadingRepos,
        mockSetLoadingRepo,
        mockSetError
      )
    )

    act(() => {
      result.current.fetchReleasesForRepo(repoFullName)
    })

    await waitFor(() => {
      expect(mockService.getReleases).toHaveBeenCalledTimes(1)
    })

    expect(mockSetReleaseErrors).toHaveBeenCalledWith(expect.any(Function))
    expect(mockSetLoadingRepo).toHaveBeenCalledWith(null)

    // Test that the error setter function works correctly
    const errorSetter = mockSetReleaseErrors.mock.calls[0][0]
    const resultState = errorSetter({})
    expect(resultState[repoFullName]).toBe('API Error')
  })

  it('should handle non-Error exceptions with fallback message', async () => {
    const repoFullName = 'owner/test-repo'
    const currentRepoReleases = {}

    mockService.getReleases.mockRejectedValue('String error')

    const { result } = renderHook(() =>
      useGitHubData(
        mockService,
        isMountedRef,
        mockSetRepos,
        currentRepoReleases,
        mockSetRepoReleases,
        {},
        mockSetReleaseErrors,
        mockSetLoadingRepos,
        mockSetLoadingRepo,
        mockSetError
      )
    )

    act(() => {
      result.current.fetchReleasesForRepo(repoFullName)
    })

    await waitFor(() => {
      expect(mockService.getReleases).toHaveBeenCalledTimes(1)
    })

    expect(mockSetReleaseErrors).toHaveBeenCalledWith(expect.any(Function))

    // Test that the error setter function uses fallback for non-Error exceptions
    const errorSetter = mockSetReleaseErrors.mock.calls[0][0]
    const resultState = errorSetter({})
    expect(resultState[repoFullName]).toBe('Failed to fetch releases.')
  })

  it('should not update releases state if component is unmounted during fetchReleases', async () => {
    const repoFullName = 'owner/test-repo'
    const currentRepoReleases = {}

    mockService.getReleases.mockResolvedValue([createMockRelease()])

    // Simulate component unmounted
    isMountedRef.current = false

    const { result } = renderHook(() =>
      useGitHubData(
        mockService,
        isMountedRef,
        mockSetRepos,
        currentRepoReleases,
        mockSetRepoReleases,
        {},
        mockSetReleaseErrors,
        mockSetLoadingRepos,
        mockSetLoadingRepo,
        mockSetError
      )
    )

    act(() => {
      result.current.fetchReleasesForRepo(repoFullName)
    })

    await waitFor(() => {
      expect(mockService.getReleases).toHaveBeenCalledTimes(1)
    })

    // Should not update state if unmounted
    expect(mockSetRepoReleases).not.toHaveBeenCalled()
    expect(mockSetLoadingRepo).not.toHaveBeenCalledWith(null)
  })

  it('should refresh repos successfully', async () => {
    const mockRepos: IRepo[] = [createMockRepo()]
    mockService.getUserRepos.mockResolvedValue(mockRepos)
    mockService.clearCache.mockResolvedValue(undefined)

    const { result } = renderHook(() =>
      useGitHubData(
        mockService,
        isMountedRef,
        mockSetRepos,
        {},
        mockSetRepoReleases,
        {},
        mockSetReleaseErrors,
        mockSetLoadingRepos,
        mockSetLoadingRepo,
        mockSetError
      )
    )

    act(() => {
      result.current.refreshRepos()
    })

    await waitFor(() => {
      expect(mockService.clearCache).toHaveBeenCalledTimes(1)
      expect(mockService.getUserRepos).toHaveBeenCalledTimes(1)
    })

    expect(mockSetLoadingRepos).toHaveBeenCalledWith(true)
    expect(mockSetRepos).toHaveBeenCalledWith(mockRepos)
    expect(mockSetLoadingRepos).toHaveBeenCalledWith(false)
  })

  it('should handle refresh repos error in clearCache gracefully', async () => {
    const mockRepos: IRepo[] = [createMockRepo()]
    mockService.getUserRepos.mockResolvedValue(mockRepos)
    mockService.clearCache.mockRejectedValue(new Error('Cache clear failed'))

    const { result } = renderHook(() =>
      useGitHubData(
        mockService,
        isMountedRef,
        mockSetRepos,
        {},
        mockSetRepoReleases,
        {},
        mockSetReleaseErrors,
        mockSetLoadingRepos,
        mockSetLoadingRepo,
        mockSetError
      )
    )

    act(() => {
      result.current.refreshRepos()
    })

    await waitFor(() => {
      expect(mockService.clearCache).toHaveBeenCalledTimes(1)
      expect(mockService.getUserRepos).toHaveBeenCalledTimes(1)
    })

    // Should continue despite cache clear error
    expect(mockSetRepos).toHaveBeenCalledWith(mockRepos)
  })

  it('should handle multiple concurrent fetchReleasesForRepo calls', async () => {
    const repo1 = 'owner/repo1'
    const repo2 = 'owner/repo2'
    const mockReleases: IRelease[] = [createMockRelease()]

    mockService.getReleases.mockResolvedValue(mockReleases)

    const { result } = renderHook(() =>
      useGitHubData(
        mockService,
        isMountedRef,
        mockSetRepos,
        {},
        mockSetRepoReleases,
        {},
        mockSetReleaseErrors,
        mockSetLoadingRepos,
        mockSetLoadingRepo,
        mockSetError
      )
    )

    // Make concurrent calls
    act(() => {
      result.current.fetchReleasesForRepo(repo1)
      result.current.fetchReleasesForRepo(repo2)
    })

    // Should handle both
    await waitFor(() => {
      expect(mockService.getReleases).toHaveBeenCalledTimes(2)
      expect(mockService.getReleases).toHaveBeenCalledWith(repo1, 1)
      expect(mockService.getReleases).toHaveBeenCalledWith(repo2, 1)
    })

    expect(mockSetLoadingRepo).toHaveBeenCalledWith(repo1)
    expect(mockSetLoadingRepo).toHaveBeenCalledWith(repo2)
  })

  it('should return correct type', () => {
    const { result } = renderHook(() =>
      useGitHubData(
        mockService,
        isMountedRef,
        mockSetRepos,
        {},
        mockSetRepoReleases,
        {},
        mockSetReleaseErrors,
        mockSetLoadingRepos,
        mockSetLoadingRepo,
        mockSetError
      )
    )

    expect(typeof result.current.fetchRepos).toBe('function')
    expect(typeof result.current.fetchReleasesForRepo).toBe('function')
    expect(typeof result.current.refreshRepos).toBe('function')
  })
})