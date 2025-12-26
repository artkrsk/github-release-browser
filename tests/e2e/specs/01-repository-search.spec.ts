import { test, expect } from '../fixtures/wordpress'

/**
 * E2E Tests: Repository Search and Selection
 *
 * Tests cover:
 * - Initial repository list loading
 * - Client-side search filtering
 * - Repository selection
 * - Refresh functionality
 * - Empty state handling
 */

test.describe('Repository Search', () => {
	test('should load and display repository list on modal open', async ({ browserModal }) => {
		/** Modal is already open via fixture */
		await browserModal.expectModalOpen()

		/** Wait for initial load */
		await browserModal.waitForLoading()

		/** Verify repositories are displayed */
		const repos = await browserModal.getVisibleRepositories()
		expect(repos.length).toBeGreaterThan(0)

		/** Verify no error state */
		expect(await browserModal.hasError()).toBe(false)
	})

	test('should filter repositories when searching', async ({ browserModal }) => {
		/** Wait for repositories to load */
		await browserModal.waitForLoading()
		const allRepos = await browserModal.getVisibleRepositories()
		expect(allRepos.length).toBeGreaterThan(0)

		/** Search for specific repository */
		const searchTerm = allRepos[0].substring(0, 5) // Use first 5 chars of first repo
		await browserModal.searchRepository(searchTerm)

		/** Verify filtered results */
		const filteredRepos = await browserModal.getVisibleRepositories()
		expect(filteredRepos.length).toBeLessThanOrEqual(allRepos.length)

		/** All visible repos should match search term */
		for (const repo of filteredRepos) {
			expect(repo.toLowerCase()).toContain(searchTerm.toLowerCase())
		}
	})

	test('should show no results message when search has no matches', async ({ browserModal }) => {
		/** Wait for repositories to load */
		await browserModal.waitForLoading()

		/** Search for something that definitely won't match */
		await browserModal.searchRepository('xyzabc123notfound')

		/** Verify no repositories are visible or empty state is shown */
		const repos = await browserModal.getVisibleRepositories()
		/** Either no repos shown, or an empty state message */
		expect(repos.length === 0 || await browserModal.hasError()).toBe(true)
	})

	test('should clear search when input is cleared', async ({ browserModal }) => {
		/** Wait for repositories to load */
		await browserModal.waitForLoading()
		const allRepos = await browserModal.getVisibleRepositories()

		/** Search for something */
		await browserModal.searchRepository('test')
		const filteredRepos = await browserModal.getVisibleRepositories()
		expect(filteredRepos.length).toBeLessThanOrEqual(allRepos.length)

		/** Clear search */
		await browserModal.searchRepository('')

		/** Verify all repositories are visible again */
		const clearedRepos = await browserModal.getVisibleRepositories()
		expect(clearedRepos.length).toBe(allRepos.length)
	})

	test('should refresh repository list when refresh button is clicked', async ({ browserModal }) => {
		/** Wait for initial load */
		await browserModal.waitForLoading()
		const initialRepos = await browserModal.getVisibleRepositories()
		expect(initialRepos.length).toBeGreaterThan(0)

		/** Click refresh button */
		await browserModal.refresh()

		/** Wait for refresh to complete */
		await browserModal.waitForLoading()

		/** Verify repositories are still displayed */
		const refreshedRepos = await browserModal.getVisibleRepositories()
		expect(refreshedRepos.length).toBe(initialRepos.length)
	})

	test('should select repository and navigate to assets view', async ({ browserModal }) => {
		/** Wait for repositories to load */
		await browserModal.waitForLoading()
		const repos = await browserModal.getVisibleRepositories()
		expect(repos.length).toBeGreaterThan(0)

		/** Find a repository that has releases (some repos may have none) */
		const repoWithReleases = await browserModal.findRepositoryWithReleases()
		expect(repoWithReleases).not.toBeNull()

		/** Select "Use Latest Release" to navigate to assets view */
		await browserModal.selectLatestRelease()

		/** Verify navigation to assets view - back button should be visible */
		const backButton = browserModal.backButton
		await expect(backButton).toBeVisible({ timeout: 10000 })
	})

	test('should navigate back from assets view to repositories', async ({ browserModal }) => {
		/** Wait for repositories to load */
		await browserModal.waitForLoading()
		const allRepos = await browserModal.getVisibleRepositories()
		expect(allRepos.length).toBeGreaterThan(0)

		/** Find a repository that has releases and navigate to assets view */
		const repoWithReleases = await browserModal.findRepositoryWithReleases()
		expect(repoWithReleases).not.toBeNull()
		await browserModal.selectLatestRelease()

		/** Verify we're in assets view */
		await expect(browserModal.backButton).toBeVisible({ timeout: 10000 })

		/** Navigate back to repositories */
		await browserModal.goBack()

		/** Verify we're back in repositories view */
		await browserModal.waitForLoading()
		const reposAfterBack = await browserModal.getVisibleRepositories()

		/** Should see repositories again */
		expect(reposAfterBack.length).toBeGreaterThan(0)
	})
})

/**
 * Test Philosophy:
 *
 * Repository search is the entry point for all user flows.
 * These tests ensure:
 * - Users can find their repositories
 * - Search filtering works correctly
 * - Empty states are handled gracefully
 * - Navigation between views preserves state
 *
 * We use REAL GitHub API to test with actual user data.
 * This provides confidence that the search works with
 * diverse repository names and quantities.
 */
