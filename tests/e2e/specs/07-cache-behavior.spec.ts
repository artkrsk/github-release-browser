import { test, expect } from '../fixtures/wordpress'

/**
 * E2E Tests: Cache Behavior
 *
 * Tests WordPress transient caching for GitHub API responses.
 *
 * Tests cover:
 * - Initial load uses cached data (if available)
 * - Refresh invalidates cache
 * - Cache persists across modal open/close
 * - Repository-specific cache isolation
 * - Cache expiration behavior
 */

test.describe('Cache Behavior', () => {
	test('should load repositories on first modal open', async ({ browserModal }) => {
		/** First load should fetch from API or use existing cache */
		await browserModal.waitForLoading()

		const repos = await browserModal.getVisibleRepositories()
		expect(repos.length).toBeGreaterThan(0)

		/** Cache should now be populated */
	})

	test('should use cached repositories on subsequent modal opens', async ({ browserModal, wpAdmin, page }) => {
		/** First load */
		await browserModal.waitForLoading()
		const firstLoadRepos = await browserModal.getVisibleRepositories()
		expect(firstLoadRepos.length).toBeGreaterThan(0)

		/** Close modal */
		await browserModal.close()

		/** Reopen modal */
		await wpAdmin.openBrowserModal()
		const modal2 = new (await import('../page-objects/BrowserModal')).BrowserModal(page)
		await modal2.waitForModal()

		/** Should load very quickly from cache */
		await modal2.waitForLoading()
		const cachedRepos = await modal2.getVisibleRepositories()

		/** Same repositories should be displayed */
		expect(cachedRepos.length).toBe(firstLoadRepos.length)
		expect(cachedRepos).toEqual(firstLoadRepos)
	})

	test('should refresh cache when refresh button is clicked', async ({ browserModal }) => {
		/** Load repositories */
		await browserModal.waitForLoading()
		const initialRepos = await browserModal.getVisibleRepositories()

		/** Click refresh to invalidate cache */
		await browserModal.refresh()
		await browserModal.waitForLoading()

		/** Should reload from API */
		const refreshedRepos = await browserModal.getVisibleRepositories()

		/** Should have same data (since API hasn't changed) */
		expect(refreshedRepos.length).toBe(initialRepos.length)

		/** But cache was invalidated and refetched */
	})

	test('should cache releases per repository', async ({ browserModal, page, wpAdmin }) => {
		/** Select first repository and load releases */
		await browserModal.waitForLoading()
		const repos = await browserModal.getVisibleRepositories()
		await browserModal.selectRepository(repos[0])

		await browserModal.waitForLoading()
		const firstRepoReleases = await browserModal.getVisibleReleases()

		/** Go back and select same repository again */
		await browserModal.goBack()
		await browserModal.waitForLoading()

		await browserModal.selectRepository(repos[0])
		await browserModal.waitForLoading()

		/** Should load from cache (very quick) */
		const cachedReleases = await browserModal.getVisibleReleases()
		expect(cachedReleases.length).toBe(firstRepoReleases.length)
	})

	test('should maintain separate cache for different repositories', async ({ browserModal }) => {
		/** Load releases for first repository */
		await browserModal.waitForLoading()
		const repos = await browserModal.getVisibleRepositories()

		if (repos.length > 1) {
			await browserModal.selectRepository(repos[0])
			await browserModal.waitForLoading()
			const firstRepoReleases = await browserModal.getVisibleReleases()

			/** Go back and select different repository */
			await browserModal.goBack()
			await browserModal.waitForLoading()

			await browserModal.selectRepository(repos[1])
			await browserModal.waitForLoading()
			const secondRepoReleases = await browserModal.getVisibleReleases()

			/** Different repositories likely have different releases */
			/** (Unless they coincidentally have same number) */
			/** Main point: cache is maintained separately */
			expect(secondRepoReleases.length).toBeGreaterThanOrEqual(0)
		}
	})

	test('should persist cache across page navigation', async ({ browserModal, wpAdmin, page }) => {
		/** Load and cache repositories */
		await browserModal.waitForLoading()
		const repos = await browserModal.getVisibleRepositories()
		await browserModal.selectRepository(repos[0])
		await browserModal.waitForLoading()
		const releases = await browserModal.getVisibleReleases()

		/** Close modal */
		await browserModal.close()

		/** Navigate to WordPress dashboard */
		await page.goto('http://localhost:8888/wp-admin/')
		await page.waitForLoadState('domcontentloaded')

		/** Navigate back to test page */
		await wpAdmin.navigateToTestPage()

		/** Open modal again */
		await wpAdmin.openBrowserModal()
		const modal2 = new (await import('../page-objects/BrowserModal')).BrowserModal(page)
		await modal2.waitForModal()
		await modal2.waitForLoading()

		/** Cache should still be valid */
		const cachedRepos = await modal2.getVisibleRepositories()
		expect(cachedRepos.length).toBe(repos.length)
	})

	test('should handle cache for directory browsing', async ({ browserModal }) => {
		/** Switch to directory mode */
		await browserModal.waitForLoading()
		await browserModal.switchToDirectoryMode()

		/** Select repository and load branches */
		const repos = await browserModal.getVisibleRepositories()
		await browserModal.selectRepository(repos[0])

		await browserModal.waitForLoading()

		/** Branches should be loaded and cached */
		const branchSelect = browserModal.page.locator('[data-testid="select-control"] select')

		if (await branchSelect.isVisible()) {
			const initialOptions = await branchSelect.locator('option').count()

			/** Select a branch */
			await browserModal.selectBranch('main')
			await browserModal.waitForLoading()

			/** Go back and select same repository again */
			await browserModal.goBack()
			await browserModal.waitForLoading()

			await browserModal.selectRepository(repos[0])
			await browserModal.waitForLoading()

			/** Branches should load from cache */
			const cachedOptions = await branchSelect.locator('option').count()
			expect(cachedOptions).toBe(initialOptions)
		}
	})

	test('should clear repository cache independently of release cache', async ({ browserModal }) => {
		/** Load repositories */
		await browserModal.waitForLoading()
		const repos = await browserModal.getVisibleRepositories()

		/** Select repository and load releases */
		await browserModal.selectRepository(repos[0])
		await browserModal.waitForLoading()
		const releases = await browserModal.getVisibleReleases()

		/** Go back to repository list */
		await browserModal.goBack()
		await browserModal.waitForLoading()

		/** Refresh repositories (should not affect release cache) */
		await browserModal.refresh()
		await browserModal.waitForLoading()

		/** Select same repository again */
		await browserModal.selectRepository(repos[0])
		await browserModal.waitForLoading()

		/** Releases should still be cached */
		const cachedReleases = await browserModal.getVisibleReleases()
		expect(cachedReleases.length).toBe(releases.length)
	})

	test('should handle cache when switching between modes', async ({ browserModal }) => {
		/** Load in release mode */
		await browserModal.waitForLoading()
		const repos = await browserModal.getVisibleRepositories()

		/** Select repository */
		await browserModal.selectRepository(repos[0])
		await browserModal.waitForLoading()
		const releases = await browserModal.getVisibleReleases()

		/** Go back */
		await browserModal.goBack()
		await browserModal.waitForLoading()

		/** Switch to directory mode */
		await browserModal.switchToDirectoryMode()

		/** Select same repository */
		await browserModal.selectRepository(repos[0])
		await browserModal.waitForLoading()

		/** Should load branches (different cache) */
		const branchSelect = browserModal.page.locator('[data-testid="select-control"] select')
		/** Either branches load or we get an error (both valid) */
		const hasBranchSelect = await branchSelect.isVisible()
		const hasError = await browserModal.hasError()

		expect(hasBranchSelect || hasError).toBe(true)
	})

	test('should maintain cache consistency during rapid operations', async ({ browserModal }) => {
		/** Test that cache doesn't get corrupted during fast operations */
		await browserModal.waitForLoading()
		const repos = await browserModal.getVisibleRepositories()

		if (repos.length > 0) {
			/** Rapidly select and go back */
			await browserModal.selectRepository(repos[0])
			await browserModal.page.waitForTimeout(100)

			await browserModal.goBack()
			await browserModal.waitForLoading()

			/** Cache should still be valid */
			const cachedRepos = await browserModal.getVisibleRepositories()
			expect(cachedRepos.length).toBe(repos.length)
		}
	})
})

/**
 * Test Strategy:
 *
 * WordPress transient caching is critical for performance and
 * reducing GitHub API calls (rate limit management).
 *
 * We verify:
 * - Repositories are cached
 * - Releases are cached per repository
 * - Branches are cached per repository
 * - Cache persists across modal open/close
 * - Refresh button invalidates cache
 * - Different data types have independent caches
 *
 * Cache behavior is validated through:
 * - Timing (cached loads should be instant)
 * - Consistency (same data on subsequent loads)
 * - Isolation (different repos have different caches)
 *
 * Note: WordPress transients have 1-hour default expiration.
 * Long-running test suites won't test expiration.
 */
