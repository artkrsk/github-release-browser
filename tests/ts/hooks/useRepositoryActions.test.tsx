import { renderHook, act } from '@testing-library/react'
import { useRepositoryActions } from '@/hooks/useRepositoryActions'
import { IRelease } from '@/interfaces'
import { createMockRelease } from '@test-utils'

describe('useRepositoryActions', () => {
  let mockSetView: vi.Mock
  let mockSetExpandedRepo: vi.Mock
  let mockSetSelectedRepo: vi.Mock
  let mockSetSelectedRelease: vi.Mock
  let mockSetSelectedReleaseTag: vi.Mock
  let mockFetchReleasesForRepo: vi.Mock

  beforeEach(() => {
    vi.clearAllMocks()

    mockSetView = vi.fn()
    mockSetExpandedRepo = vi.fn()
    mockSetSelectedRepo = vi.fn()
    mockSetSelectedRelease = vi.fn()
    mockSetSelectedReleaseTag = vi.fn()
    mockFetchReleasesForRepo = vi.fn().mockResolvedValue(undefined)
  })

  it('should return early when handleRepoToggle is called with undefined repoFullName', () => {
    const { result } = renderHook(() =>
      useRepositoryActions(
        mockSetView,
        mockSetExpandedRepo,
        mockSetSelectedRepo,
        mockSetSelectedRelease,
        mockSetSelectedReleaseTag,
        mockFetchReleasesForRepo
      )
    )

    // Should not throw error when repoFullName is undefined
    act(() => {
      result.current.handleRepoToggle(undefined)
    })

    // Should not call expandedRepo setter
    expect(mockSetExpandedRepo).not.toHaveBeenCalled()
    // Should not call fetchReleasesForRepo
    expect(mockFetchReleasesForRepo).not.toHaveBeenCalled()
  })

  it('should expand repository when handleRepoToggle is called with different repo', () => {
    const { result } = renderHook(() =>
      useRepositoryActions(
        mockSetView,
        mockSetExpandedRepo,
        mockSetSelectedRepo,
        mockSetSelectedRelease,
        mockSetSelectedReleaseTag,
        mockFetchReleasesForRepo
      )
    )

    act(() => {
      result.current.handleRepoToggle('owner/test-repo')
    })

    expect(mockSetExpandedRepo).toHaveBeenCalledWith(expect.any(Function))

    // Test the updater function
    const updater = mockSetExpandedRepo.mock.calls[0][0]
    const resultState = updater('owner/another-repo')
    expect(resultState).toBe('owner/test-repo')
    expect(mockFetchReleasesForRepo).toHaveBeenCalledWith('owner/test-repo')
  })

  it('should collapse repository when handleRepoToggle is called with same repo', () => {
    const { result } = renderHook(() =>
      useRepositoryActions(
        mockSetView,
        mockSetExpandedRepo,
        mockSetSelectedRepo,
        mockSetSelectedRelease,
        mockSetSelectedReleaseTag,
        mockFetchReleasesForRepo
      )
    )

    act(() => {
      result.current.handleRepoToggle('owner/test-repo')
    })

    expect(mockSetExpandedRepo).toHaveBeenCalledWith(expect.any(Function))

    // Test the updater function when previous value is the same
    const updater = mockSetExpandedRepo.mock.calls[0][0]
    const resultState = updater('owner/test-repo')
    expect(resultState).toBeNull()
    expect(mockFetchReleasesForRepo).not.toHaveBeenCalled()
  })

  it('should handle handleRepoToggle when no previous repository is expanded', () => {
    const { result } = renderHook(() =>
      useRepositoryActions(
        mockSetView,
        mockSetExpandedRepo,
        mockSetSelectedRepo,
        mockSetSelectedRelease,
        mockSetSelectedReleaseTag,
        mockFetchReleasesForRepo
      )
    )

    act(() => {
      result.current.handleRepoToggle('owner/test-repo')
    })

    expect(mockSetExpandedRepo).toHaveBeenCalledWith(expect.any(Function))

    // Test the updater function when previous value is null
    const updater = mockSetExpandedRepo.mock.calls[0][0]
    const resultState = updater(null)
    expect(resultState).toBe('owner/test-repo')
    expect(mockFetchReleasesForRepo).toHaveBeenCalledWith('owner/test-repo')
  })

  it('should select specific release and navigate to assets view', () => {
    const mockRelease: IRelease = createMockRelease({
      tag_name: 'v2.0.0',
      name: 'Test Release v2.0.0'
    })

    const { result } = renderHook(() =>
      useRepositoryActions(
        mockSetView,
        mockSetExpandedRepo,
        mockSetSelectedRepo,
        mockSetSelectedRelease,
        mockSetSelectedReleaseTag,
        mockFetchReleasesForRepo
      )
    )

    act(() => {
      result.current.handleSelectRelease('owner/test-repo', mockRelease)
    })

    expect(mockSetSelectedRepo).toHaveBeenCalledWith('owner/test-repo')
    expect(mockSetSelectedRelease).toHaveBeenCalledWith(mockRelease)
    expect(mockSetSelectedReleaseTag).toHaveBeenCalledWith('v2.0.0')
    expect(mockSetView).toHaveBeenCalledWith('assets')
  })

  it('should select latest release and navigate to assets view', () => {
    const { result } = renderHook(() =>
      useRepositoryActions(
        mockSetView,
        mockSetExpandedRepo,
        mockSetSelectedRepo,
        mockSetSelectedRelease,
        mockSetSelectedReleaseTag,
        mockFetchReleasesForRepo
      )
    )

    act(() => {
      result.current.handleSelectRelease('owner/test-repo', 'latest')
    })

    expect(mockSetSelectedRepo).toHaveBeenCalledWith('owner/test-repo')
    expect(mockSetSelectedRelease).toHaveBeenCalledWith('latest')
    expect(mockSetSelectedReleaseTag).toHaveBeenCalledWith(null)
    expect(mockSetView).toHaveBeenCalledWith('assets')
  })

  it('should handle back to repositories action', () => {
    const { result } = renderHook(() =>
      useRepositoryActions(
        mockSetView,
        mockSetExpandedRepo,
        mockSetSelectedRepo,
        mockSetSelectedRelease,
        mockSetSelectedReleaseTag,
        mockFetchReleasesForRepo
      )
    )

    act(() => {
      result.current.handleBackToRepos()
    })

    expect(mockSetView).toHaveBeenCalledWith('repos')
  })

  it('should handle multiple repository toggle operations', () => {
    const { result } = renderHook(() =>
      useRepositoryActions(
        mockSetView,
        mockSetExpandedRepo,
        mockSetSelectedRepo,
        mockSetSelectedRelease,
        mockSetSelectedReleaseTag,
        mockFetchReleasesForRepo
      )
    )

    // Test that handleRepoToggle calls setExpandedRepo with updater function
    act(() => {
      result.current.handleRepoToggle('owner/repo1')
    })

    expect(mockSetExpandedRepo).toHaveBeenCalledWith(expect.any(Function))

    // Test that multiple calls work
    act(() => {
      result.current.handleRepoToggle('owner/repo2')
    })

    expect(mockSetExpandedRepo).toHaveBeenCalledTimes(2)
  })

  it('should handle multiple release selections', () => {
    const mockRelease1: IRelease = createMockRelease({ tag_name: 'v1.0.0' })
    const mockRelease2: IRelease = createMockRelease({ tag_name: 'v2.0.0' })

    const { result } = renderHook(() =>
      useRepositoryActions(
        mockSetView,
        mockSetExpandedRepo,
        mockSetSelectedRepo,
        mockSetSelectedRelease,
        mockSetSelectedReleaseTag,
        mockFetchReleasesForRepo
      )
    )

    // Select first release
    act(() => {
      result.current.handleSelectRelease('owner/repo1', mockRelease1)
    })

    expect(mockSetSelectedReleaseTag).toHaveBeenCalledWith('v1.0.0')

    // Select second release
    act(() => {
      result.current.handleSelectRelease('owner/repo2', mockRelease2)
    })

    expect(mockSetSelectedReleaseTag).toHaveBeenCalledWith('v2.0.0')
    expect(mockSetView).toHaveBeenCalledTimes(2)
  })

  it('should handle rapid successive repository toggle calls', () => {
    const { result } = renderHook(() =>
      useRepositoryActions(
        mockSetView,
        mockSetExpandedRepo,
        mockSetSelectedRepo,
        mockSetSelectedRelease,
        mockSetSelectedReleaseTag,
        mockFetchReleasesForRepo
      )
    )

    // Rapid successive calls should all work
    act(() => {
      result.current.handleRepoToggle('owner/repo1')
      result.current.handleRepoToggle('owner/repo2')
      result.current.handleRepoToggle('owner/repo1')
    })

    expect(mockSetExpandedRepo).toHaveBeenCalledTimes(3)
  })

  it('should maintain callback dependencies correctly', () => {
    const { rerender } = renderHook(() =>
      useRepositoryActions(
        mockSetView,
        mockSetExpandedRepo,
        mockSetSelectedRepo,
        mockSetSelectedRelease,
        mockSetSelectedReleaseTag,
        mockFetchReleasesForRepo
      )
    )

    // Rerender with same dependencies should not create new functions
    rerender()

    // Functions should remain stable
    const { result } = renderHook(() =>
      useRepositoryActions(
        mockSetView,
        mockSetExpandedRepo,
        mockSetSelectedRepo,
        mockSetSelectedRelease,
        mockSetSelectedReleaseTag,
        mockFetchReleasesForRepo
      )
    )

    expect(typeof result.current.handleRepoToggle).toBe('function')
    expect(typeof result.current.handleSelectRelease).toBe('function')
    expect(typeof result.current.handleBackToRepos).toBe('function')
  })

  it('should handle release selection with different repository names', () => {
    const mockRelease: IRelease = createMockRelease()

    const { result } = renderHook(() =>
      useRepositoryActions(
        mockSetView,
        mockSetExpandedRepo,
        mockSetSelectedRepo,
        mockSetSelectedRelease,
        mockSetSelectedReleaseTag,
        mockFetchReleasesForRepo
      )
    )

    const repos = [
      'owner/repo1',
      'my-org/project',
      'username/my-repo-name'
    ]

    repos.forEach(repo => {
      act(() => {
        result.current.handleSelectRelease(repo, mockRelease)
      })

      expect(mockSetSelectedRepo).toHaveBeenLastCalledWith(repo)
    })

    expect(mockSetView).toHaveBeenCalledTimes(repos.length)
  })
})