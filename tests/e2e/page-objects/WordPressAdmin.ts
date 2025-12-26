import { Page, Locator, expect } from '@playwright/test'
import { waitForBrowserScript } from '../utils/wp-ready'

/**
 * Page Object Model for WordPress Admin Pages
 *
 * This class handles WordPress authentication and navigation
 * to the plugin's test page.
 */
export class WordPressAdmin {
	readonly page: Page
	readonly baseURL: string

	constructor(page: Page, baseURL: string = 'http://localhost:8888') {
		this.page = page
		this.baseURL = baseURL
	}

	/**
	 * Login to WordPress admin
	 *
	 * @param username - WordPress username (default: admin)
	 * @param password - WordPress password (default: password)
	 */
	async login(username: string = 'admin', password: string = 'password') {
		await this.page.goto(`${this.baseURL}/wp-login.php`)

		/** Fill login form */
		await this.page.fill('#user_login', username)
		await this.page.fill('#user_pass', password)
		await this.page.click('#wp-submit')

		/** Wait for dashboard to load */
		await this.page.waitForURL('**/wp-admin/**')
		await expect(this.page.locator('#wpadminbar')).toBeVisible()
	}

	/**
	 * Navigate to the browser test page
	 *
	 * This is the custom admin page added by dev-plugin/dev-harness.php
	 */
	async navigateToTestPage() {
		await this.page.goto(`${this.baseURL}/wp-admin/admin.php?page=github-release-browser-test`)

		/** Wait for page to load */
		await this.page.waitForLoadState('domcontentloaded')

		/** Wait for browser script to be loaded */
		await waitForBrowserScript(this.page)
	}

	/**
	 * Open the browser modal
	 *
	 * Clicks the "Browse GitHub Releases" button on the test page
	 */
	async openBrowserModal() {
		const button = this.page.locator('text=Browse GitHub Releases')
		await button.click()

		/** Wait for Thickbox modal to open */
		const modal = this.page.locator('#TB_window')
		await modal.waitFor({ state: 'visible' })

		/** Wait for modal animations */
		await this.page.waitForTimeout(500)
	}

	/**
	 * Get the selected asset URI from the input field
	 *
	 * The input ID is 'github-asset-uri' per dev-harness.php
	 *
	 * @returns The URI value or null if empty
	 */
	async getSelectedAssetURI(): Promise<string | null> {
		const input = this.page.locator('#github-asset-uri')
		const value = await input.inputValue()
		return value || null
	}

	/**
	 * Test a URI using the AJAX endpoint
	 *
	 * Clicks the "Test URI" button and returns the result
	 *
	 * @returns The download URL or error message
	 */
	async testURI(): Promise<string> {
		const button = this.page.locator('text=Test URI')
		await button.click()

		/** Wait for AJAX response */
		await this.page.waitForTimeout(1000)

		/** Get result from result div */
		const result = this.page.locator('#uri_test_result')
		return await result.textContent() || ''
	}

	/**
	 * Verify user is logged in
	 */
	async expectLoggedIn() {
		await expect(this.page.locator('#wpadminbar')).toBeVisible()
	}

	/**
	 * Logout from WordPress
	 */
	async logout() {
		await this.page.goto(`${this.baseURL}/wp-login.php?action=logout`)
		const logoutLink = this.page.locator('a:has-text("log out")')
		await logoutLink.click()
		await this.page.waitForURL('**/wp-login.php**')
	}

	/**
	 * Navigate to WordPress settings page
	 */
	async navigateToSettings() {
		await this.page.goto(`${this.baseURL}/wp-admin/options-general.php`)
		await this.page.waitForLoadState('domcontentloaded')
	}

	/**
	 * Clear WordPress caches via admin toolbar
	 *
	 * Note: This requires a caching plugin. Basic wp-env doesn't have this.
	 * Use cache-helper.ts utilities instead for test cache management.
	 */
	async clearCacheViaAdmin() {
		/** This is a placeholder - implement if caching plugin is added */
		console.warn('Cache clearing via admin not implemented. Use cache-helper.ts instead.')
	}
}
