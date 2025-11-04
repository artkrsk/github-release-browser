import { describe, test, expect, vi, beforeEach } from 'vitest'
import { GitHubService } from '@/services/GitHubService'

// Mock FormData
const mockFormData = {
  append: vi.fn()
}

global.FormData = vi.fn(() => mockFormData) as any

describe('GitHubService', () => {
  let service: GitHubService
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Reset fetch mock before each test
    mockFetch = vi.fn()
    global.fetch = mockFetch

    // Create service instance
    service = new GitHubService({
      apiUrl: 'https://example.com/wp-admin/admin-ajax.php',
      nonce: 'test-nonce',
      actionPrefix: 'github_release'
    })
  })

  describe('constructor', () => {
    test('initializes with provided config', () => {
      const config = {
        apiUrl: 'https://test.com/ajax.php',
        nonce: 'test-nonce-123',
        actionPrefix: 'my_prefix'
      }

      const testService = new GitHubService(config)

      expect(testService).toBeInstanceOf(GitHubService)
    })
  })

  describe('getReleases', () => {
    test('successfully retrieves releases for a repository', async () => {
      const mockReleases = [
        {
          id: 1,
          tag_name: 'v1.0.0',
          name: 'First Release',
          assets: [{ id: 1, name: 'file.zip' }]
        },
        {
          id: 2,
          tag_name: 'v1.1.0',
          name: 'Second Release',
          assets: [{ id: 2, name: 'file2.zip' }]
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            releases: mockReleases
          }
        })
      })

      const result = await service.getReleases('owner/repo')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/wp-admin/admin-ajax.php',
        expect.objectContaining({
          method: 'POST',
          body: mockFormData,
          credentials: 'same-origin'
        })
      )
      expect(result).toEqual(mockReleases)
    })

    test('returns empty array when no releases found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {}
        })
      })

      const result = await service.getReleases('owner/repo')

      expect(result).toEqual([])
    })

    test('uses default page parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { releases: [] }
        })
      })

      await service.getReleases('owner/repo')

      const formData = mockFetch.mock.calls[0][1].body
      expect(formData.append).toHaveBeenCalledWith('repo', 'owner/repo')
      expect(formData.append).toHaveBeenCalledWith('page', '1')
    })

    test('uses custom page parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { releases: [] }
        })
      })

      await service.getReleases('owner/repo', 3)

      const formData = mockFetch.mock.calls[0][1].body
      expect(formData.append).toHaveBeenCalledWith('page', '3')
    })

    test('throws error when API returns failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          data: {
            message: 'Repository not found'
          }
        })
      })

      await expect(service.getReleases('owner/repo')).rejects.toThrow('Repository not found')
    })

    test('throws error when HTTP request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      await expect(service.getReleases('owner/repo')).rejects.toThrow('HTTP error! status: 500')
    })

    test('handles network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(service.getReleases('owner/repo')).rejects.toThrow('Network error')
    })
  })

  describe('getRateLimit', () => {
    test('successfully retrieves rate limit information', async () => {
      const mockRateLimit = {
        limit: 5000,
        remaining: 4999,
        reset: 1234567890
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            rate_limit: mockRateLimit
          }
        })
      })

      const result = await service.getRateLimit()

      expect(result).toEqual(mockRateLimit)
    })

    test('throws error when rate limit API fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          data: {
            message: 'Rate limit API error'
          }
        })
      })

      await expect(service.getRateLimit()).rejects.toThrow('Rate limit API error')
    })
  })

  describe('parseUri', () => {
    test('successfully parses a URI', async () => {
      const mockParsedData = {
        owner: 'test-owner',
        repo: 'test-repo',
        release: 'v1.0.0',
        filename: 'test.zip'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockParsedData
        })
      })

      const result = await service.parseUri('github-release://owner/repo/release/file')

      expect(result).toEqual(mockParsedData)
    })

    test('throws error when URI parsing fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          data: {
            message: 'Invalid URI format'
          }
        })
      })

      await expect(service.parseUri('invalid-uri')).rejects.toThrow('Invalid URI format')
    })
  })

  describe('getDownloadUrl', () => {
    test('successfully retrieves download URL', async () => {
      const mockDownloadUrl = 'https://github.com/owner/repo/releases/download/v1.0.0/file.zip'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            download_url: mockDownloadUrl
          }
        })
      })

      const result = await service.getDownloadUrl('https://api.github.com/repos/owner/repo/releases/assets/123')

      expect(result).toBe(mockDownloadUrl)
    })

    test('throws error when download URL retrieval fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          data: {
            message: 'Asset not found'
          }
        })
      })

      await expect(service.getDownloadUrl('invalid-asset-url')).rejects.toThrow('Asset not found')
    })
  })

  describe('getUserRepos', () => {
    test('successfully retrieves user repositories', async () => {
      const mockRepos = [
        {
          id: 1,
          name: 'repo1',
          full_name: 'user/repo1',
          private: false
        },
        {
          id: 2,
          name: 'repo2',
          full_name: 'user/repo2',
          private: true
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            repos: mockRepos  // Changed from 'releases' to 'repos' to match API
          }
        })
      })

      const result = await service.getUserRepos()

      expect(result).toEqual(mockRepos)
    })

    test('returns empty array when no repositories found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {}
        })
      })

      const result = await service.getUserRepos()

      expect(result).toEqual([])
    })

    test('throws error when user repos API fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          data: {
            message: 'Authentication required'
          }
        })
      })

      await expect(service.getUserRepos()).rejects.toThrow('Authentication required')
    })

    test('throws custom error for token missing error code', async () => {
      // Mock getString to return specific messages
      vi.mock('@/utils/getString', () => ({
        getString: vi.fn()
      }))

      const { getString } = await import('@/utils/getString')
      vi.mocked(getString)
        .mockReturnValueOnce('Welcome to Release Browser')
        .mockReturnValueOnce('Invalid GitHub Token')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            repos: {
              error: true,
              error_code: 'token_missing',
              message: 'GitHub token is not configured'
            }
          }
        })
      })

      await expect(service.getUserRepos()).rejects.toThrow('Welcome to Release Browser')
      expect(getString).toHaveBeenCalledWith('error.welcome.description')
    })

    test('throws custom error for token invalid error code', async () => {
      // Mock getString to return specific messages
      vi.mock('@/utils/getString', () => ({
        getString: vi.fn()
      }))

      const { getString } = await import('@/utils/getString')
      vi.mocked(getString)
        .mockReturnValueOnce('Welcome to Release Browser')
        .mockReturnValueOnce('Invalid GitHub Token')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            repos: {
              error: true,
              error_code: 'token_invalid',
              message: 'Invalid GitHub token'
            }
          }
        })
      })

      await expect(service.getUserRepos()).rejects.toThrow('Invalid GitHub Token')
      expect(getString).toHaveBeenCalledWith('error.desc.invalidToken')
    })

    test('throws error message from backend for unknown error codes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            repos: {
              error: true,
              error_code: 'unknown_error',
              message: 'Some unknown error occurred'
            }
          }
        })
      })

      await expect(service.getUserRepos()).rejects.toThrow('Some unknown error occurred')
    })

    test('throws unknown error when error message is missing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            repos: {
              error: true,
              error_code: 'missing_message'
              // No message property
            }
          }
        })
      })

      await expect(service.getUserRepos()).rejects.toThrow('Unknown error occurred')
    })
  })

  describe('clearCache', () => {
    test('successfully clears cache', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { message: 'Cache cleared' }
        })
      })

      await expect(service.clearCache()).resolves.not.toThrow()

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/wp-admin/admin-ajax.php',
        expect.objectContaining({
          method: 'POST',
          body: mockFormData,
          credentials: 'same-origin'
        })
      )
    })

    test('throws error when cache clearing fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          data: {
            message: 'Failed to clear cache'
          }
        })
      })

      await expect(service.clearCache()).rejects.toThrow('Failed to clear cache')
    })
  })

  describe('private method behavior', () => {
    test('uses correct action prefix for all requests', async () => {
      // Test getReleases
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { releases: [] } })
      })

      await service.getReleases('owner/repo')
      const formData1 = mockFetch.mock.calls[0][1].body
      expect(formData1.append).toHaveBeenCalledWith('action', 'github_release_get_releases')

      // Clear mock and test getRateLimit
      mockFetch.mockClear()
      await service.getRateLimit()
      const formData2 = mockFetch.mock.calls[0][1].body
      expect(formData2.append).toHaveBeenCalledWith('action', 'github_release_get_rate_limit')
    })

    test('always includes nonce in requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { releases: [] } })
      })

      await service.getReleases('owner/repo')

      const formData = mockFetch.mock.calls[0][1].body
      expect(formData.append).toHaveBeenCalledWith('nonce', 'test-nonce')
    })

    test('always includes correct request options', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { releases: [] } })
      })

      await service.getReleases('owner/repo')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/wp-admin/admin-ajax.php',
        {
          method: 'POST',
          body: mockFormData,
          credentials: 'same-origin'
        }
      )
    })

    test('handles unknown error in API response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          data: {}
        })
      })

      await expect(service.getReleases('owner/repo')).rejects.toThrow('Unknown error occurred')
    })
  })

  describe('error handling', () => {
    test('handles JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        }
      })

      await expect(service.getReleases('owner/repo')).rejects.toThrow('Invalid JSON')
    })

    test('handles malformed API response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          // Missing success field
          data: { releases: [] }
        })
      })

      await expect(service.getReleases('owner/repo')).rejects.toThrow('Unknown error occurred')
    })

    test('handles timeout errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Request timeout'))

      await expect(service.getReleases('owner/repo')).rejects.toThrow('Request timeout')
    })
  })
})