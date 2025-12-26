import { Page } from '@playwright/test'

/**
 * WordPress Readiness Utilities
 *
 * Helper functions to wait for WordPress and plugin to be ready.
 * These handle the async nature of Docker-based wp-env.
 */

/**
 * Wait for WordPress admin-ajax.php to respond
 *
 * @param page - Playwright page instance
 * @param baseURL - WordPress base URL
 * @param maxRetries - Maximum number of retry attempts
 * @returns True when WordPress is ready
 */
export async function waitForWordPressReady(
	page: Page,
	baseURL: string = 'http://localhost:8888',
	maxRetries: number = 15
): Promise<boolean> {
	let retries = maxRetries

	while (retries > 0) {
		try {
			const response = await page.goto(`${baseURL}/wp-admin/admin-ajax.php`, {
				waitUntil: 'domcontentloaded',
				timeout: 2000
			})

			/** 400 is expected for admin-ajax without action parameter */
			if (response && response.status() === 400) {
				return true
			}
		} catch (error) {
			retries--
			if (retries === 0) {
				throw new Error('WordPress admin-ajax.php is not responding')
			}
			await new Promise(resolve => setTimeout(resolve, 1000))
		}
	}

	return false
}

/**
 * Wait for plugin to be active and scripts loaded
 *
 * Verifies that window.githubReleaseBrowserConfig exists
 *
 * @param page - Playwright page instance
 * @param timeout - Maximum time to wait in milliseconds
 * @returns True when plugin is active
 */
export async function waitForPluginActive(
	page: Page,
	timeout: number = 10000
): Promise<boolean> {
	try {
		await page.waitForFunction(
			() => typeof (window as any).githubReleaseBrowserConfig !== 'undefined',
			{ timeout }
		)
		return true
	} catch (error) {
		throw new Error('Plugin did not load within timeout period')
	}
}

/**
 * Wait for browser script to be loaded in the page
 *
 * Checks for the presence of window.githubReleaseBrowserConfig
 *
 * @param page - Playwright page instance
 * @param timeout - Maximum time to wait in milliseconds
 * @returns True when script is loaded
 */
export async function waitForBrowserScript(
	page: Page,
	timeout: number = 10000
): Promise<boolean> {
	try {
		/** Wait for the config object to exist */
		await page.waitForFunction(
			() => {
				const config = (window as any).githubReleaseBrowserConfig
				return config && typeof config === 'object'
			},
			{ timeout }
		)
		return true
	} catch (error) {
		throw new Error('Browser script did not load within timeout period')
	}
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retries
 * @param initialDelay - Initial delay in milliseconds
 * @returns Result of the function
 */
export async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	maxRetries: number = 3,
	initialDelay: number = 1000
): Promise<T> {
	let lastError: Error | undefined

	for (let i = 0; i < maxRetries; i++) {
		try {
			return await fn()
		} catch (error) {
			lastError = error as Error
			if (i < maxRetries - 1) {
				const delay = initialDelay * Math.pow(2, i)
				await new Promise(resolve => setTimeout(resolve, delay))
			}
		}
	}

	throw lastError || new Error('Retry failed')
}

/**
 * Wait for element to be stable (not animating)
 *
 * Useful for waiting for WordPress modals/dialogs to finish opening
 *
 * @param page - Playwright page instance
 * @param selector - Element selector
 * @param timeout - Maximum time to wait
 * @returns True when element is stable
 */
export async function waitForElementStable(
	page: Page,
	selector: string,
	timeout: number = 5000
): Promise<boolean> {
	const element = page.locator(selector)

	try {
		/** Wait for element to be visible */
		await element.waitFor({ state: 'visible', timeout })

		/** Wait a bit for animations to complete */
		await page.waitForTimeout(300)

		return true
	} catch (error) {
		throw new Error(`Element ${selector} did not become stable within timeout`)
	}
}
