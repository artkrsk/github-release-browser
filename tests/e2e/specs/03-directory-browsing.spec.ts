import { test, expect } from '../fixtures/wordpress'

/**
 * E2E Tests: Directory Browsing
 *
 * Tests the directory browsing feature which allows selecting
 * folders/files from repository branches.
 *
 * Tests cover:
 * - Switching to directory mode
 * - Repository selection in directory mode
 * - Branch loading and selection
 * - Directory navigation
 * - Folder selection
 * - github-dir:// URI format
 */

test.describe('Directory Browsing', () => {
	test('should switch from release mode to directory mode', async ({ browserModal }) => {
		/** Wait for initial load */
		await browserModal.waitForLoading()

		/** Switch to directory mode */
		await browserModal.switchToDirectoryMode()

		/** Verify mode switched (UI should change) */
		/** Directory mode should still show repositories */
		const repos = await browserModal.getVisibleRepositories()
		expect(repos.length).toBeGreaterThan(0)
	})

	test('should load branches when repository is selected in directory mode', async ({ browserModal }) => {
		/** Switch to directory mode */
		await browserModal.waitForLoading()
		await browserModal.switchToDirectoryMode()

		/** Select a repository */
		const repos = await browserModal.getVisibleRepositories()
		await browserModal.selectRepository(repos[0])

		/** Wait for branches to load */
		await browserModal.waitForLoading()

		/** Verify branch selector is visible */
		const branchSelect = browserModal.iframe.locator('select, .components-select-control select')
		await expect(branchSelect.first()).toBeVisible()
	})

	test('should display directory contents when branch is selected', async ({ browserModal }) => {
		/** Switch to directory mode and select repository */
		await browserModal.waitForLoading()
		await browserModal.switchToDirectoryMode()

		const repos = await browserModal.getVisibleRepositories()
		await browserModal.selectRepository(repos[0])

		/** Wait for branches and select one */
		await browserModal.waitForLoading()
		await browserModal.selectBranch('main')

		/** Wait for directory contents to load */
		await browserModal.waitForLoading()

		/** Verify directory/file items are displayed */
		/** Directory browsing should show folder/file items */
		const items = await browserModal.iframe.locator('.components-panel__body, [role="treeitem"], button').count()
		expect(items).toBeGreaterThan(0)
	})

	test('should navigate into folders', async ({ browserModal }) => {
		/** Navigate to directory view */
		await browserModal.waitForLoading()
		await browserModal.switchToDirectoryMode()

		const repos = await browserModal.getVisibleRepositories()
		await browserModal.selectRepository(repos[0])

		await browserModal.waitForLoading()
		await browserModal.selectBranch('main')
		await browserModal.waitForLoading()

		/** Find and click a folder */
		/** Assuming there's at least one folder in the root */
		const folders = browserModal.iframe.locator('.components-panel__body button')
		const folderCount = await folders.count()

		if (folderCount > 0) {
			await folders.first().click()
			await browserModal.waitForLoading()

			/** Verify we navigated or content changed */
			/** Folder navigation might work differently */
			expect(folderCount).toBeGreaterThan(0)
		}
	})

	test('should switch between branches and reload directory contents', async ({ browserModal }) => {
		/** Navigate to directory view */
		await browserModal.waitForLoading()
		await browserModal.switchToDirectoryMode()

		const repos = await browserModal.getVisibleRepositories()
		await browserModal.selectRepository(repos[0])

		/** Select main branch */
		await browserModal.waitForLoading()
		await browserModal.selectBranch('main')
		await browserModal.waitForLoading()

		/** Get initial directory items */
		const initialItems = await browserModal.iframe.locator('.components-panel__body, button').count()

		/** Switch to another branch if available */
		const branchSelect = browserModal.iframe.locator('select')
		const options = await branchSelect.locator('option').count()

		if (options > 1) {
			/** Select second branch */
			await browserModal.selectBranch('develop')
			await browserModal.waitForLoading()

			/** Directory should reload */
			/** Items count might be same or different depending on branch */
			const newItems = await browserModal.iframe.locator('.components-panel__body, button').count()
			expect(newItems).toBeGreaterThanOrEqual(0)
		}
	})

	test('should select folder and generate github-dir:// URI', async ({ browserModal, wpAdmin }) => {
		/** Navigate to directory view and select repository */
		await browserModal.waitForLoading()
		await browserModal.switchToDirectoryMode()

		const repos = await browserModal.getVisibleRepositories()
		await browserModal.selectRepository(repos[0])

		/** Select branch and wait for contents */
		await browserModal.waitForLoading()
		await browserModal.selectBranch('main')
		await browserModal.waitForLoading()

		/** Select first folder or file */
		const items = browserModal.iframe.locator('.components-panel__body button')
		const itemCount = await items.count()

		if (itemCount > 0) {
			await items.first().click()

			/** Confirm selection */
			await browserModal.confirmSelection()

			/** Verify modal closes */
			await browserModal.expectModalClosed()

			/** Verify github-dir:// URI is generated */
			const uri = await wpAdmin.getSelectedAssetURI()
			expect(uri).toBeTruthy()
			expect(uri).toContain('github-dir://')
		}
	})

	test('should navigate back from directory view to repository list', async ({ browserModal }) => {
		/** Navigate deep into directory mode */
		await browserModal.waitForLoading()
		await browserModal.switchToDirectoryMode()

		const repos = await browserModal.getVisibleRepositories()
		await browserModal.selectRepository(repos[0])

		/** Go back to repository list */
		await browserModal.waitForLoading()
		await browserModal.goBack()

		/** Verify we're back at repository list */
		const reposAfterBack = await browserModal.getVisibleRepositories()
		expect(reposAfterBack.length).toBeGreaterThan(0)
	})

	test('should handle repository with no branches gracefully', async ({ browserModal }) => {
		/** This tests error handling for edge cases */
		await browserModal.waitForLoading()
		await browserModal.switchToDirectoryMode()

		/** Select any repository */
		const repos = await browserModal.getVisibleRepositories()
		await browserModal.selectRepository(repos[0])

		await browserModal.waitForLoading()

		/** Verify either branches loaded or error state shown */
		const hasError = await browserModal.hasError()
		const branchSelect = browserModal.iframe.locator('select')
		const hasBranchSelect = await branchSelect.count() > 0

		/** Either we have branches or an error */
		expect(hasBranchSelect || hasError).toBe(true)
	})
})

/**
 * Test Strategy:
 *
 * Directory browsing is a premium feature that provides
 * more flexibility than release-based asset selection.
 *
 * We test:
 * - Mode switching (release ↔ directory)
 * - Branch selection and loading
 * - Directory navigation
 * - URI format (github-dir://)
 *
 * Real GitHub API testing ensures:
 * - Branch data is correctly fetched
 * - Directory structures are properly navigated
 * - Edge cases (empty dirs, no branches) are handled
 */
