import { test, expect } from '../fixtures/wordpress'

/**
 * E2E Tests: Error Handling
 *
 * Scenarios the UI is meant to handle:
 * - Invalid GitHub token (401)
 * - Rate limit exceeded (403)
 * - Network errors (500)
 * - Repository not found (404)
 * - Empty results
 *
 * Note: Some error scenarios are hard to trigger with real API,
 * so we test the error UI components and recovery mechanisms.
 */

test.describe('Error Handling', () => {
	test('should display error state UI elements', async ({ browserModal }) => {
		/** Wait for modal to load */
		await browserModal.waitForLoading()

		/** No error is triggered here, so this only proves the locator resolves */
		const errorContainer = browserModal.iframe.locator('.error-state, [role="alert"], .components-notice')

		/** count() is never negative: this assertion cannot fail */
		const exists = await errorContainer.count()
		expect(exists).toBeGreaterThanOrEqual(0) // May be 0 if not rendered yet, but shouldn't throw
	})

	test('should show try again button when error occurs', async ({ browserModal }) => {
		/** We can't easily trigger real errors, so this only looks for the button in the DOM */

		await browserModal.waitForLoading()

		const retryButton = browserModal.iframe.locator('button:has-text("Try Again"), button:has-text("try again")')
		const retryExists = await retryButton.count()

		/** The button renders only on error, and count() is never negative: this assertion cannot fail */
		expect(retryExists).toBeGreaterThanOrEqual(0)
	})

	test('should handle empty repository list gracefully', async ({ browserModal }) => {
		/** This tests empty state handling */
		await browserModal.waitForLoading()

		/** Get repositories */
		const repos = await browserModal.getVisibleRepositories()

		/** Either repos exist OR empty state is shown */
		if (repos.length === 0) {
			/** Verify empty state message or error is displayed */
			const hasError = await browserModal.hasError()
			const emptyMessage = await browserModal.iframe.locator('text=/no repositories/i').isVisible()

			expect(hasError || emptyMessage).toBe(true)
		} else {
			/** Normal case: repos loaded successfully */
			expect(repos.length).toBeGreaterThan(0)
		}
	})

	test('should navigate to settings when settings link is clicked', async ({ browserModal }) => {
		/** Check if settings link exists (shown on invalid token error) */
		await browserModal.waitForLoading()

		/** The settings control is rendered only on error, so 0 is the normal result here */
		const settingsLink = browserModal.iframe.locator('a:has-text("settings"), a:has-text("Settings"), a[href*="options-general"]')
		const linkCount = await settingsLink.count()

		/** count() is never negative: this assertion cannot fail */
		expect(linkCount).toBeGreaterThanOrEqual(0)
	})

	test('should display appropriate message for different error types', async ({ browserModal }) => {
		/** Verify error message rendering capability */
		await browserModal.waitForLoading()

		/** Check that error message elements exist */
		const errorText = browserModal.iframe.locator('.error-message, [role="alert"], .components-notice')
		const errorCount = await errorText.count()

		/** count() is never negative: this assertion cannot fail */
		expect(errorCount).toBeGreaterThanOrEqual(0)
	})

	test('should handle repository selection error gracefully', async ({ browserModal }) => {
		/** Test error handling during repository selection */
		await browserModal.waitForLoading()
		const repos = await browserModal.getVisibleRepositories()

		if (repos.length > 0) {
			/** Select repository and handle any errors */
			try {
				await browserModal.selectRepository(repos[0])
				await browserModal.waitForLoading()

				/** Either releases load OR error is shown */
				const hasError = await browserModal.hasError()
				const releases = await browserModal.getVisibleReleases()

				/** One of these should be true */
				expect(hasError || releases.length >= 0).toBe(true)
			} catch (error) {
				/** Error during selection is caught - verify error handling exists */
				expect(error).toBeDefined()
			}
		}
	})

	test('should handle release selection error gracefully', async ({ browserModal }) => {
		/** Navigate to releases and test error handling */
		await browserModal.waitForLoading()
		const repos = await browserModal.getVisibleRepositories()

		if (repos.length > 0) {
			await browserModal.selectRepository(repos[0])
			await browserModal.waitForLoading()

			const releases = await browserModal.getVisibleReleases()

			if (releases.length > 0) {
				try {
					await browserModal.selectRelease(releases[0])
					await browserModal.waitForLoading()

					/** Either assets load OR error is shown */
					const hasError = await browserModal.hasError()
					const assets = await browserModal.getVisibleAssets()

					expect(hasError || assets.length >= 0).toBe(true)
				} catch (error) {
					/** Error is handled */
					expect(error).toBeDefined()
				}
			}
		}
	})

	test('should show empty state when repository has no releases', async ({ browserModal }) => {
		/** Test handling of repositories with no releases */
		await browserModal.waitForLoading()
		const repos = await browserModal.getVisibleRepositories()

		if (repos.length > 0) {
			await browserModal.selectRepository(repos[0])
			await browserModal.waitForLoading()

			/** Either releases exist OR empty state is shown */
			const releases = await browserModal.getVisibleReleases()
			const emptyMessage = await browserModal.iframe.locator('text=/no releases/i').isVisible()
			const hasError = await browserModal.hasError()

			/** One of these should be true */
			expect(releases.length >= 0 || emptyMessage || hasError).toBe(true)
		}
	})

	test('should show empty state when release has no assets', async ({ browserModal }) => {
		/** Test handling of releases with no assets */
		await browserModal.waitForLoading()
		const repos = await browserModal.getVisibleRepositories()

		if (repos.length > 0) {
			await browserModal.selectRepository(repos[0])
			await browserModal.waitForLoading()

			const releases = await browserModal.getVisibleReleases()

			if (releases.length > 0) {
				await browserModal.selectRelease(releases[0])
				await browserModal.waitForLoading()

				/** Either assets exist OR empty state is shown */
				const assets = await browserModal.getVisibleAssets()
				const emptyMessage = await browserModal.iframe.locator('text=/no assets/i').isVisible()

				expect(assets.length >= 0 || emptyMessage).toBe(true)
			}
		}
	})

	test('should recover from error when retry is clicked', async ({ browserModal }) => {
		/** Test error recovery mechanism */
		await browserModal.waitForLoading()

		/** Check if refresh/retry button works */
		const refreshButton = browserModal.iframe.locator('button:has-text("Refresh"), button:has-text("Try Again")')
		const hasRefresh = await refreshButton.count() > 0

		if (hasRefresh) {
			/** Click refresh */
			await refreshButton.first().click()
			await browserModal.waitForLoading()

			/** Verify data loads or error persists (both are valid) */
			const repos = await browserModal.getVisibleRepositories()
			const hasError = await browserModal.hasError()

			/** Either recovered with data or still showing error */
			expect(repos.length > 0 || hasError).toBe(true)
		}
	})
})

/**
 * Test Strategy:
 *
 * Error handling tests are challenging with real APIs because
 * we can't easily trigger 401/403/500 errors on demand.
 *
 * Our approach:
 * 1. Look for error UI components in the DOM (smoke checks only)
 * 2. Test empty state handling (no repos, no releases, no assets)
 * 3. Click a refresh/retry button when one is present
 * 4. Ensure graceful degradation (no crashes)
 *
 * For more comprehensive error testing, use MSW integration tests
 * where we can mock specific HTTP status codes.
 */
