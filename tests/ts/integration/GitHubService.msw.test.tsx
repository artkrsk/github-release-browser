import { describe, it, expect, beforeEach } from 'vitest'
import { GitHubService } from '@/services/GitHubService'
import { server } from '../../msw/setup'
import { http, HttpResponse } from 'msw'
import {
	invalidTokenHandler,
	rateLimitHandler,
	emptyResultsHandler,
	notFoundHandler,
	networkErrorHandler
} from '../../msw/handlers'
import { createMockBrowserConfig } from '@test-utils'

/**
 * Comprehensive MSW Integration Tests for GitHubService
 *
 * Tests all 12 GitHubService methods with realistic network mocking:
 * - getRateLimit()
 * - getBranches()
 * - getContents()
 * - getArchiveUrl()
 * - getRepoInfo()
 * - parseUri()
 * - getDownloadUrl()
 * - clearCache()
 * - clearReleasesCache()
 * - clearBranchesCache()
 *
 * Plus error handling scenarios for all methods.
 */

describe('GitHubService MSW Integration', () => {
	let service: GitHubService

	beforeEach(() => {
		const config = createMockBrowserConfig()
		service = new GitHubService({
			apiUrl: config.apiUrl,
			nonce: config.nonce,
			actionPrefix: config.actionPrefix
		})
	})

	describe('getRateLimit()', () => {
		it('should fetch rate limit information', async () => {
			const rateLimit = await service.getRateLimit()

			expect(rateLimit).toHaveProperty('limit')
			expect(rateLimit).toHaveProperty('remaining')
			expect(rateLimit).toHaveProperty('reset')
			expect(rateLimit.limit).toBe(5000)
		})

		it('should handle rate limit when exhausted', async () => {
			server.use(rateLimitHandler)
			await expect(service.getRateLimit()).rejects.toThrow()
		})
	})

	describe('getBranches()', () => {
		it('should fetch branches for a repository', async () => {
			const branches = await service.getBranches('owner/repo')

			expect(Array.isArray(branches)).toBe(true)
			expect(branches.length).toBeGreaterThan(0)
			expect(branches[0]).toHaveProperty('name')
			expect(branches[0]).toHaveProperty('commit')
		})

		it('should handle empty branches list', async () => {
			server.use(emptyResultsHandler)
			const branches = await service.getBranches('owner/empty-repo')

			expect(Array.isArray(branches)).toBe(true)
			expect(branches.length).toBe(0)
		})

		it('should throw error for non-existent repository', async () => {
			server.use(notFoundHandler)
			await expect(service.getBranches('owner/nonexistent')).rejects.toThrow()
		})

		it('should throw error for invalid token', async () => {
			server.use(invalidTokenHandler)
			await expect(service.getBranches('owner/repo')).rejects.toThrow()
		})
	})

	describe('getContents()', () => {
		it('should fetch directory contents', async () => {
			const contents = await service.getContents('owner/repo', '', 'main')

			expect(Array.isArray(contents)).toBe(true)
			expect(contents.length).toBeGreaterThan(0)
			expect(contents[0]).toHaveProperty('name')
			expect(contents[0]).toHaveProperty('path')
			expect(contents[0]).toHaveProperty('type')
		})

		it('should handle empty directory', async () => {
			server.use(emptyResultsHandler)
			const contents = await service.getContents('owner/repo', 'empty-dir', 'main')

			expect(Array.isArray(contents)).toBe(true)
			expect(contents.length).toBe(0)
		})

		it('should throw error for non-existent path', async () => {
			server.use(notFoundHandler)
			await expect(service.getContents('owner/repo', 'nonexistent', 'main')).rejects.toThrow()
		})
	})

	describe('getArchiveUrl()', () => {
		it('should return archive URL for a branch', async () => {
			const url = await service.getArchiveUrl('owner/repo', 'main')

			expect(typeof url).toBe('string')
			expect(url).toContain('github.com')
			expect(url).toContain('archive')
		})

		it('should throw error for invalid repository', async () => {
			server.use(notFoundHandler)
			await expect(service.getArchiveUrl('owner/nonexistent', 'main')).rejects.toThrow()
		})
	})

	describe('getRepoInfo()', () => {
		it('should fetch repository information', async () => {
			const info = await service.getRepoInfo('owner/repo')

			expect(info).toHaveProperty('name')
			expect(info).toHaveProperty('full_name')
			expect(info).toHaveProperty('default_branch')
		})

		it('should throw error for non-existent repository', async () => {
			server.use(notFoundHandler)
			await expect(service.getRepoInfo('owner/nonexistent')).rejects.toThrow()
		})
	})

	describe('parseUri()', () => {
		it('should parse a valid GitHub release URI', async () => {
			const parsed = await service.parseUri('github-release://owner/repo@v1.0.0/app.zip')

			expect(parsed).toHaveProperty('owner')
			expect(parsed).toHaveProperty('repo')
			expect(parsed.owner).toBe('owner')
			expect(parsed.repo).toBe('repo')
		})
	})

	describe('getDownloadUrl()', () => {
		it('should return download URL for an asset', async () => {
			const url = await service.getDownloadUrl('https://api.github.com/repos/owner/repo/releases/assets/123')

			expect(typeof url).toBe('string')
			expect(url.length).toBeGreaterThan(0)
		})
	})

	describe('Cache Operations', () => {
		describe('clearCache()', () => {
			it('should clear all cache without error', async () => {
				await expect(service.clearCache()).resolves.not.toThrow()
			})

			it('should throw error on network failure', async () => {
				server.use(networkErrorHandler)
				await expect(service.clearCache()).rejects.toThrow()
			})
		})

		describe('clearReleasesCache()', () => {
			it('should clear releases cache for specific repo', async () => {
				await expect(service.clearReleasesCache('owner/repo')).resolves.not.toThrow()
			})
		})

		describe('clearBranchesCache()', () => {
			it('should clear branches cache for specific repo', async () => {
				await expect(service.clearBranchesCache('owner/repo')).resolves.not.toThrow()
			})
		})
	})

	describe('Error Handling', () => {
		it('should handle 500 server errors', async () => {
			server.use(networkErrorHandler)

			await expect(service.getUserRepos()).rejects.toThrow()
			await expect(service.getReleases('owner/repo')).rejects.toThrow()
		})

		it('should handle malformed JSON response', async () => {
			server.use(
				http.post('*/wp-admin/admin-ajax.php', () => {
					return new HttpResponse('not json', {
						status: 200,
						headers: { 'Content-Type': 'text/plain' }
					})
				})
			)

			await expect(service.getUserRepos()).rejects.toThrow()
		})
	})
})
