import { renderHook, act } from '@testing-library/react'
import { useBrowserState } from '@/hooks/useBrowserState'
import { TBrowserView } from '@/types'
import { IRepo, IRelease, IAsset } from '@/interfaces'

describe('useBrowserState', () => {
  beforeEach(() => {
    // Reset any global state before each test
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useBrowserState())

    // View state defaults
    expect(result.current.view).toBe('repos')
    expect(result.current.repos).toEqual([])
    expect(result.current.searchQuery).toBe('')
    expect(result.current.expandedRepo).toBeNull()
    expect(result.current.repoReleases).toEqual({})
    expect(result.current.releaseErrors).toEqual({})
    expect(result.current.loadingRepos).toBe(true)
    expect(result.current.loadingRepo).toBeNull()

    // Selection state defaults
    expect(result.current.selectedRepo).toBeNull()
    expect(result.current.selectedReleaseTag).toBeNull()
    expect(result.current.selectedRelease).toBeNull()
    expect(result.current.selectedAssetObj).toBeNull()

    // Error state defaults
    expect(result.current.error).toBeNull()

    // Ref should be true on mount
    expect(result.current.isMountedRef.current).toBe(true)
  })

  it('should update view state correctly', () => {
    const { result } = renderHook(() => useBrowserState())

    act(() => {
      result.current.setView('assets')
    })

    expect(result.current.view).toBe('assets')

    act(() => {
      result.current.setView('repos')
    })

    expect(result.current.view).toBe('repos')
  })

  it('should manage repository state correctly', () => {
    const { result } = renderHook(() => useBrowserState())

    const mockRepos: IRepo[] = [
      {
        id: 1,
        name: 'test-repo',
        full_name: 'owner/test-repo',
        description: 'Test repo',
        html_url: 'https://github.com/owner/test-repo',
        private: false,
        stargazers_count: 10,
        watchers_count: 10,
        forks_count: 5,
        language: 'TypeScript',
        updated_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        pushed_at: '2024-01-01T00:00:00Z',
        default_branch: 'main',
        owner: {
          login: 'owner',
          id: 1,
          avatar_url: 'https://github.com/owner.png',
          gravatar_id: '',
          url: 'https://api.github.com/users/owner',
          html_url: 'https://github.com/owner',
          followers_url: 'https://api.github.com/users/owner/followers',
          following_url: 'https://api.github.com/users/owner/following{/other_user}',
          gists_url: 'https://api.github.com/users/owner/gists{/gist_id}',
          starred_url: 'https://api.github.com/users/owner/starred{/owner}{/repo}',
          subscriptions_url: 'https://api.github.com/users/owner/subscriptions',
          organizations_url: 'https://api.github.com/users/owner/orgs',
          repos_url: 'https://api.github.com/users/owner/repos',
          events_url: 'https://api.github.com/users/owner/events{/privacy}',
          received_events_url: 'https://api.github.com/users/owner/received_events',
          type: 'User',
          site_admin: false
        }
      }
    ]

    act(() => {
      result.current.setRepos(mockRepos)
    })

    expect(result.current.repos).toEqual(mockRepos)

    act(() => {
      result.current.setSearchQuery('test-query')
    })

    expect(result.current.searchQuery).toBe('test-query')

    act(() => {
      result.current.setExpandedRepo('owner/test-repo')
    })

    expect(result.current.expandedRepo).toBe('owner/test-repo')

    act(() => {
      result.current.setRepoReleases({ 'owner/test-repo': [] })
    })

    expect(result.current.repoReleases).toEqual({ 'owner/test-repo': [] })

    act(() => {
      result.current.setLoadingRepos(false)
    })

    expect(result.current.loadingRepos).toBe(false)

    act(() => {
      result.current.setLoadingRepo('owner/test-repo')
    })

    expect(result.current.loadingRepo).toBe('owner/test-repo')
  })

  it('should manage selection state correctly', () => {
    const { result } = renderHook(() => useBrowserState())

    const mockRelease: IRelease = {
      url: 'https://api.github.com/repos/owner/repo/releases/1',
      html_url: 'https://github.com/owner/repo/releases/tag/v1.0.0',
      assets_url: 'https://api.github.com/repos/owner/repo/releases/1/assets',
      upload_url: 'https://uploads.github.com/repos/owner/repo/releases/1/assets',
      tarball_url: 'https://api.github.com/repos/owner/repo/tarball/v1.0.0',
      zipball_url: 'https://api.github.com/repos/owner/repo/zipball/v1.0.0',
      id: 1,
      tag_name: 'v1.0.0',
      target_commitish: 'main',
      name: 'Test Release',
      body: 'Test release notes',
      draft: false,
      prerelease: false,
      created_at: '2024-01-01T00:00:00Z',
      published_at: '2024-01-15T00:00:00Z',
      assets: []
    }

    const mockAsset: IAsset = {
      url: 'https://api.github.com/repos/owner/repo/releases/assets/1',
      id: 1,
      name: 'test-file.zip',
      label: null,
      content_type: 'application/zip',
      state: 'uploaded',
      size: 1024,
      download_count: 10,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    act(() => {
      result.current.setSelectedRepo('owner/test-repo')
    })

    expect(result.current.selectedRepo).toBe('owner/test-repo')

    act(() => {
      result.current.setSelectedReleaseTag('v1.0.0')
    })

    expect(result.current.selectedReleaseTag).toBe('v1.0.0')

    act(() => {
      result.current.setSelectedRelease(mockRelease)
    })

    expect(result.current.selectedRelease).toEqual(mockRelease)

    act(() => {
      result.current.setSelectedRelease('latest')
    })

    expect(result.current.selectedRelease).toBe('latest')

    act(() => {
      result.current.setSelectedAssetObj(mockAsset)
    })

    expect(result.current.selectedAssetObj).toEqual(mockAsset)
  })

  it('should manage error state correctly', () => {
    const { result } = renderHook(() => useBrowserState())

    act(() => {
      result.current.setError('Test error message')
    })

    expect(result.current.error).toBe('Test error message')

    act(() => {
      result.current.setError(null)
    })

    expect(result.current.error).toBeNull()
  })

  it('should maintain isMountedRef across re-renders', () => {
    const { result, rerender } = renderHook(() => useBrowserState())

    expect(result.current.isMountedRef.current).toBe(true)

    rerender()

    expect(result.current.isMountedRef.current).toBe(true)
  })

  it('should handle state updates independently', () => {
    const { result } = renderHook(() => useBrowserState())

    // Update multiple states in sequence
    act(() => {
      result.current.setView('assets')
      result.current.setError('Some error')
      result.current.setLoadingRepos(false)
      result.current.setSelectedRepo('test/repo')
    })

    expect(result.current.view).toBe('assets')
    expect(result.current.error).toBe('Some error')
    expect(result.current.loadingRepos).toBe(false)
    expect(result.current.selectedRepo).toBe('test/repo')

    // Verify other states remain unchanged
    expect(result.current.searchQuery).toBe('')
    expect(result.current.expandedRepo).toBeNull()
    expect(result.current.selectedRelease).toBeNull()
  })

  it('should handle complex repo releases state updates', () => {
    const { result } = renderHook(() => useBrowserState())

    const mockReleases: IRelease[] = [
      {
        url: 'https://api.github.com/repos/owner/repo/releases/1',
        html_url: 'https://github.com/owner/repo/releases/tag/v1.0.0',
        assets_url: 'https://api.github.com/repos/owner/repo/releases/1/assets',
        upload_url: 'https://uploads.github.com/repos/owner/repo/releases/1/assets',
        tarball_url: 'https://api.github.com/repos/owner/repo/tarball/v1.0.0',
        zipball_url: 'https://api.github.com/repos/owner/repo/zipball/v1.0.0',
        id: 1,
        tag_name: 'v1.0.0',
        target_commitish: 'main',
        name: 'Test Release 1',
        body: 'Test release notes 1',
        draft: false,
        prerelease: false,
        created_at: '2024-01-01T00:00:00Z',
        published_at: '2024-01-15T00:00:00Z',
        assets: []
      },
      {
        url: 'https://api.github.com/repos/owner/repo/releases/2',
        html_url: 'https://github.com/owner/repo/releases/tag/v2.0.0',
        assets_url: 'https://api.github.com/repos/owner/repo/releases/2/assets',
        upload_url: 'https://uploads.github.com/repos/owner/repo/releases/2/assets',
        tarball_url: 'https://api.github.com/repos/owner/repo/tarball/v2.0.0',
        zipball_url: 'https://api.github.com/repos/owner/repo/zipball/v2.0.0',
        id: 2,
        tag_name: 'v2.0.0',
        target_commitish: 'main',
        name: 'Test Release 2',
        body: 'Test release notes 2',
        draft: false,
        prerelease: false,
        created_at: '2024-01-02T00:00:00Z',
        published_at: '2024-01-16T00:00:00Z',
        assets: []
      }
    ]

    act(() => {
      result.current.setRepoReleases({
        'owner/test-repo': mockReleases,
        'owner/another-repo': []
      })
    })

    expect(result.current.repoReleases).toEqual({
      'owner/test-repo': mockReleases,
      'owner/another-repo': []
    })

    // Update one repo's releases
    act(() => {
      result.current.setRepoReleases(prev => ({
        ...prev,
        'owner/test-repo': [mockReleases[0]]
      }))
    })

    expect(result.current.repoReleases['owner/test-repo']).toHaveLength(1)
    expect(result.current.repoReleases['owner/another-repo']).toHaveLength(0)
  })
})