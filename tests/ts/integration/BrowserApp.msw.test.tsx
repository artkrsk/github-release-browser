import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GitHubService } from '@/services/GitHubService'
import { server } from '../../msw/setup'
import { invalidTokenHandler, rateLimitHandler, emptyResultsHandler } from '../../msw/handlers'
import { createMockBrowserConfig } from '@test-utils'

/**
 * MSW Integration Tests for GitHub API Interactions
 *
 * These tests validate that MSW (Mock Service Worker) properly intercepts
 * network requests and returns mocked GitHub API responses.
 *
 * Focus: API-level integration, not UI testing
 * These tests validate the network layer with realistic HTTP mocking.
 */

describe('GitHub API with MSW', () => {
	let service: GitHubService

	beforeEach(() => {
		const config = createMockBrowserConfig()
		service = new GitHubService({
			apiUrl: config.apiUrl,
			nonce: config.nonce,
			actionPrefix: config.actionPrefix
		})
	})

	describe('Repository API', () => {
		it('should fetch repositories from mocked API', async () => {
			/** MSW handlers will intercept this request */
			const repos = await service.getUserRepos()

			/** Verify MSW returned mock data */
			expect(Array.isArray(repos)).toBe(true)
			expect(repos.length).toBeGreaterThan(0)

			/** Verify mock repository structure */
			expect(repos[0]).toHaveProperty('name')
			expect(repos[0]).toHaveProperty('full_name')
		})

		it('should handle empty repository response', async () => {
			/** Override with empty results handler */
			server.use(emptyResultsHandler)

			const repos = await service.getUserRepos()

			/** Should return empty array */
			expect(Array.isArray(repos)).toBe(true)
			expect(repos.length).toBe(0)
		})

		it('should throw error for invalid token (401)', async () => {
			/** Override with invalid token handler */
			server.use(invalidTokenHandler)

			/** Should throw error */
			await expect(service.getUserRepos()).rejects.toThrow()
		})

		it('should throw error for rate limit (403)', async () => {
			/** Override with rate limit handler */
			server.use(rateLimitHandler)

			/** Should throw error */
			await expect(service.getUserRepos()).rejects.toThrow()
		})
	})

	describe('Release API', () => {
		it('should fetch releases from mocked API', async () => {
			/** MSW will return mocked releases */
			const releases = await service.getReleases('owner/repo')

			/** Verify mock data */
			expect(Array.isArray(releases)).toBe(true)
			expect(releases.length).toBeGreaterThan(0)

			/** Verify release structure */
			expect(releases[0]).toHaveProperty('tag_name')
			expect(releases[0]).toHaveProperty('assets')
		})

		it('should handle repository with no releases', async () => {
			/** Override with empty results */
			server.use(emptyResultsHandler)

			const releases = await service.getReleases('owner/empty-repo')

			/** Should return empty array */
			expect(Array.isArray(releases)).toBe(true)
			expect(releases.length).toBe(0)
		})
	})

	describe('Error Scenarios', () => {
		it('should propagate network errors', async () => {
			/** Override with invalid token (simulates error) */
			server.use(invalidTokenHandler)

			/** All API calls should fail */
			await expect(service.getUserRepos()).rejects.toThrow()
			await expect(service.getReleases('owner/repo')).rejects.toThrow()
		})

		it('should handle rate limit errors', async () => {
			/** Override with rate limit handler */
			server.use(rateLimitHandler)

			/** Should throw for all endpoints */
			await expect(service.getUserRepos()).rejects.toThrow()
		})
	})
})

/**
 * Test Philosophy:
 *
 * These MSW tests validate the API integration layer, not UI.
 * Benefits:
 * - Fast execution (no React rendering)
 * - Network-level validation
 * - Realistic HTTP mocking
 * - Error scenario testing
 *
 * Complementary to:
 * - Unit tests: Test components in isolation
 * - E2E tests: Test complete user flows in real browser
 *
 * MSW Integration tests bridge the gap, validating:
 * - API contract adherence
 * - Error handling at network layer
 * - Request/response format
 */
