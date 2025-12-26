import { test as base, Page } from '@playwright/test'
import { WordPressAdmin } from '../page-objects/WordPressAdmin'
import { BrowserModal } from '../page-objects/BrowserModal'
import { clearAllCaches } from '../utils/cache-helper'
import { waitForWordPressReady } from '../utils/wp-ready'
import { enableAllDebugging } from '../utils/debug'

/**
 * Custom Playwright Fixtures for WordPress Testing
 *
 * These fixtures extend Playwright's base test with WordPress-specific functionality:
 * - authenticatedPage: Automatically logged in as admin
 * - browserModal: Navigate to test page and open modal
 * - cleanWordPressState: Reset cache between tests
 *
 * @see https://playwright.dev/docs/test-fixtures
 */

type WordPressFixtures = {
	/** Page with WordPress admin authenticated */
	authenticatedPage: Page

	/** WordPress admin page object */
	wpAdmin: WordPressAdmin

	/** Browser modal page object */
	browserModal: BrowserModal

	/** Clean WordPress state before test */
	cleanState: void
}

/**
 * Extended test with WordPress fixtures
 *
 * Usage:
 * ```typescript
 * import { test } from '../fixtures/wordpress'
 *
 * test('my test', async ({ authenticatedPage, browserModal }) => {
 *   // Page is already logged in and modal is ready
 * })
 * ```
 */
export const test = base.extend<WordPressFixtures>({
	/**
	 * Authenticated Page Fixture
	 *
	 * Provides a Playwright page that's already logged into WordPress admin
	 */
	authenticatedPage: async ({ page, baseURL }, use) => {
		/** Enable debugging to capture console errors and network issues */
		enableAllDebugging(page)

		/** Ensure WordPress is ready */
		await waitForWordPressReady(page, baseURL!)

		/** Create admin instance and login */
		const wpAdmin = new WordPressAdmin(page, baseURL!)
		await wpAdmin.login()

		/** Provide the authenticated page to the test */
		await use(page)

		/** Cleanup: Logout after test (optional) */
		// await wpAdmin.logout()
	},

	/**
	 * WordPress Admin Fixture
	 *
	 * Provides WordPressAdmin page object with authenticated session
	 */
	wpAdmin: async ({ authenticatedPage, baseURL }, use) => {
		const wpAdmin = new WordPressAdmin(authenticatedPage, baseURL!)
		await use(wpAdmin)
	},

	/**
	 * Browser Modal Fixture
	 *
	 * Provides BrowserModal page object with modal already opened
	 * Automatically navigates to test page and opens the modal
	 */
	browserModal: async ({ authenticatedPage, wpAdmin }, use) => {
		/** Navigate to browser test page */
		await wpAdmin.navigateToTestPage()

		/** Open the modal */
		await wpAdmin.openBrowserModal()

		/** Create modal instance */
		const modal = new BrowserModal(authenticatedPage)
		await modal.waitForModal()

		/** Provide modal to test */
		await use(modal)

		/** Cleanup: Close modal after test */
		try {
			await modal.close()
		} catch (error) {
			/** Modal might already be closed, ignore error */
		}
	},

	/**
	 * Clean State Fixture
	 *
	 * Automatically runs before each test to ensure clean WordPress state
	 * Clears all transients (cache) to prevent test interference
	 */
	cleanState: [async ({}, use) => {
		/** Clear WordPress caches before test */
		try {
			await clearAllCaches()
		} catch (error) {
			/** Cache clearing failed, but don't fail the test */
			console.warn('Failed to clear caches:', error)
		}

		/** Run the test */
		await use()

		/** Cleanup after test (if needed) */
		// Additional cleanup can go here
	}, { auto: true }] // auto: true means this runs for every test
})

/**
 * Re-export expect for convenience
 */
export { expect } from '@playwright/test'
