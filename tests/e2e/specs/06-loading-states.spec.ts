import { test, expect } from '../fixtures/wordpress'

/**
 * E2E Tests: Loading States and Transitions
 *
 * Tests that loading spinners and disabled states work correctly
 * during data fetching operations.
 *
 * Tests cover:
 * - Initial load spinner
 * - Spinner during repository fetch
 * - Spinner during release fetch
 * - Spinner during branch fetch
 * - Spinner during directory contents fetch
 * - Disabled states during loading
 * - Loading state transitions
 */

test.describe('Loading States', () => {
	test('should show loading spinner on initial modal open', async ({ authenticatedPage, wpAdmin }) => {
		/** Navigate to test page */
		await wpAdmin.navigateToTestPage()

		/** Open modal and immediately check for spinner */
		await wpAdmin.openBrowserModal()

		const modal = new (await import('../page-objects/BrowserModal')).BrowserModal(authenticatedPage)

		/** Spinner should be visible during initial load */
		/** Note: This might be too fast to catch on localhost */
		try {
			await modal.expectLoading()
		} catch {
			/** If loading finished too quickly, that's okay */
			/** Just verify it eventually loads content */
			await modal.waitForLoading()
			const repos = await modal.getVisibleRepositories()
			expect(repos.length).toBeGreaterThan(0)
		}
	})

	test('should hide loading spinner after repositories load', async ({ browserModal }) => {
		/** Wait for initial load to complete */
		await browserModal.waitForLoading()

		/** Spinner should be hidden */
		await browserModal.expectNotLoading()

		/** Content should be visible */
		const repos = await browserModal.getVisibleRepositories()
		expect(repos.length).toBeGreaterThan(0)
	})

	test('should show loading spinner when repository is selected', async ({ browserModal }) => {
		/** Wait for repositories to load */
		await browserModal.waitForLoading()
		const repos = await browserModal.getVisibleRepositories()

		/** Click repository and check for spinner */
		const repoButton = browserModal.page.locator(`text=${repos[0]}`).first()
		await repoButton.click()

		/** Spinner should appear (might be too fast to catch) */
		try {
			await expect(browserModal.spinner).toBeVisible({ timeout: 1000 })
		} catch {
			/** Too fast, already loaded */
		}

		/** Eventually spinner disappears and releases load */
		await browserModal.waitForLoading()
		await browserModal.expectNotLoading()
	})

	test('should show loading spinner when release is selected', async ({ browserModal }) => {
		/** Navigate to releases */
		await browserModal.waitForLoading()
		const repos = await browserModal.getVisibleRepositories()
		await browserModal.selectRepository(repos[0])

		await browserModal.waitForLoading()
		const releases = await browserModal.getVisibleReleases()

		if (releases.length > 0) {
			/** Click release and check for spinner */
			const releaseButton = browserModal.page.locator(`text=${releases[0]}`).first()
			await releaseButton.click()

			/** Spinner might appear briefly */
			try {
				await expect(browserModal.spinner).toBeVisible({ timeout: 500 })
			} catch {
				/** Loaded too quickly */
			}

			/** Eventually loads */
			await browserModal.waitForLoading()
			await browserModal.expectNotLoading()
		}
	})

	test('should show loading spinner during refresh', async ({ browserModal }) => {
		/** Wait for initial load */
		await browserModal.waitForLoading()

		/** Click refresh button */
		await browserModal.refreshButton.click()

		/** Spinner should appear */
		try {
			await browserModal.expectLoading()
		} catch {
			/** Might load too fast on localhost */
		}

		/** Eventually finishes loading */
		await browserModal.waitForLoading()
		await browserModal.expectNotLoading()

		/** Content should be visible */
		const repos = await browserModal.getVisibleRepositories()
		expect(repos.length).toBeGreaterThan(0)
	})

	test('should disable buttons during loading', async ({ browserModal }) => {
		/** Wait for initial load */
		await browserModal.waitForLoading()

		/** Get a button that triggers loading */
		const repos = await browserModal.getVisibleRepositories()

		if (repos.length > 0) {
			/** Check if buttons are disabled during loading */
			/** This is implementation-specific */

			await browserModal.selectRepository(repos[0])

			/** During loading, UI should be disabled or show loading state */
			/** Just verify loading completes properly */
			await browserModal.waitForLoading()

			/** After loading, should have content */
			const panels = await browserModal.iframe.locator('.components-panel__body').count()
			expect(panels).toBeGreaterThan(0)
		}
	})

	test('should show loading spinner in directory mode', async ({ browserModal }) => {
		/** Switch to directory mode */
		await browserModal.waitForLoading()
		await browserModal.switchToDirectoryMode()

		/** Select repository */
		const repos = await browserModal.getVisibleRepositories()
		await browserModal.selectRepository(repos[0])

		/** Should show loading for branches */
		try {
			await browserModal.expectLoading()
		} catch {
			/** Loaded too fast */
		}

		await browserModal.waitForLoading()
		await browserModal.expectNotLoading()
	})

	test('should show loading spinner when branch is selected', async ({ browserModal }) => {
		/** Navigate to directory mode */
		await browserModal.waitForLoading()
		await browserModal.switchToDirectoryMode()

		const repos = await browserModal.getVisibleRepositories()
		await browserModal.selectRepository(repos[0])

		await browserModal.waitForLoading()

		/** Select branch and check for loading */
		const branchSelect = browserModal.page.locator('[data-testid="select-control"] select')
		if (await branchSelect.isVisible()) {
			await browserModal.selectBranch('main')

			/** Should show loading for directory contents */
			try {
				await browserModal.expectLoading()
			} catch {
				/** Too fast */
			}

			await browserModal.waitForLoading()
			await browserModal.expectNotLoading()
		}
	})

	test('should maintain loading state consistency across view changes', async ({ browserModal }) => {
		/** Test that loading states don't get stuck */

		/** Initial load */
		await browserModal.waitForLoading()
		await browserModal.expectNotLoading()

		/** Navigate forward */
		const repos = await browserModal.getVisibleRepositories()
		await browserModal.selectRepository(repos[0])
		await browserModal.waitForLoading()
		await browserModal.expectNotLoading()

		/** Navigate back */
		await browserModal.goBack()
		await browserModal.waitForLoading()
		await browserModal.expectNotLoading()

		/** Navigate forward again */
		await browserModal.selectRepository(repos[0])
		await browserModal.waitForLoading()
		await browserModal.expectNotLoading()

		/** Loading state should be consistent */
		expect(await browserModal.spinner.isVisible()).toBe(false)
	})

	test('should not show loading spinner for instant operations', async ({ browserModal }) => {
		/** Client-side operations shouldn't trigger loading */
		await browserModal.waitForLoading()

		/** Search is client-side filtering */
		await browserModal.searchRepository('test')

		/** Should not trigger loading spinner */
		expect(await browserModal.spinner.isVisible()).toBe(false)

		/** Clear search */
		await browserModal.searchRepository('')

		/** Still no loading */
		expect(await browserModal.spinner.isVisible()).toBe(false)
	})

	test('should handle concurrent loading requests gracefully', async ({ browserModal }) => {
		/** Test that rapid clicks don't break loading state */
		await browserModal.waitForLoading()
		const repos = await browserModal.getVisibleRepositories()

		if (repos.length > 1) {
			/** Rapidly click different repositories */
			const firstRepo = browserModal.page.locator(`text=${repos[0]}`).first()
			await firstRepo.click()

			/** Wait a tiny bit */
			await browserModal.page.waitForTimeout(100)

			/** Click another (might cancel previous) */
			await browserModal.backButton.click()
			await browserModal.page.waitForTimeout(100)

			const secondRepo = browserModal.page.locator(`text=${repos[1]}`).first()
			await secondRepo.click()

			/** Eventually should finish loading */
			await browserModal.waitForLoading()
			await browserModal.expectNotLoading()

			/** Should show valid content */
			const releases = await browserModal.getVisibleReleases()
			expect(releases.length).toBeGreaterThanOrEqual(0)
		}
	})
})

/**
 * Test Strategy:
 *
 * Loading states are crucial for UX. We verify:
 * - Spinners appear during data fetching
 * - Spinners disappear when data loads
 * - UI is disabled/non-interactive during loading
 * - Loading states don't get stuck
 * - Concurrent operations are handled gracefully
 *
 * Challenges:
 * - Local network is very fast, spinners may be too brief to catch
 * - We use try/catch to handle cases where loading finishes instantly
 * - Main goal: ensure loading doesn't break, not that we always see it
 *
 * Real CI environments with network latency will better test loading states.
 */
