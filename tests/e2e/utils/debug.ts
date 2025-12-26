import { Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Debugging Utilities for E2E Tests
 *
 * Helper functions to capture browser state, console logs,
 * and network activity for debugging test failures.
 */

/**
 * Capture all browser console messages
 *
 * @param page - Playwright page instance
 */
export function captureConsoleMessages(page: Page) {
	page.on('console', msg => {
		const type = msg.type()
		const text = msg.text()

		if (type === 'error') {
			console.error(`[Browser Error] ${text}`)
		} else if (type === 'warn') {
			console.warn(`[Browser Warning] ${text}`)
		} else {
			console.log(`[Browser ${type}] ${text}`)
		}
	})
}

/**
 * Capture JavaScript errors in the page
 *
 * @param page - Playwright page instance
 */
export function capturePageErrors(page: Page) {
	page.on('pageerror', error => {
		console.error(`[Page Error] ${error.message}`)
		console.error(error.stack)
	})
}

/**
 * Capture network request failures
 *
 * @param page - Playwright page instance
 */
export function captureNetworkFailures(page: Page) {
	page.on('requestfailed', request => {
		console.error(`[Network Failure] ${request.method()} ${request.url()}`)
		console.error(`  Failure: ${request.failure()?.errorText}`)
	})
}

/**
 * Capture all network requests (for debugging)
 *
 * @param page - Playwright page instance
 * @param filter - Optional URL filter (e.g., 'admin-ajax.php')
 */
export function captureNetworkRequests(page: Page, filter?: string) {
	page.on('request', request => {
		const url = request.url()
		if (!filter || url.includes(filter)) {
			console.log(`[Request] ${request.method()} ${url}`)
		}
	})

	page.on('response', async response => {
		const url = response.url()
		if (!filter || url.includes(filter)) {
			const status = response.status()
			console.log(`[Response] ${status} ${url}`)

			if (status >= 400) {
				try {
					const body = await response.text()
					console.error(`[Response Body] ${body.substring(0, 500)}`)
				} catch (e) {
					console.error('[Response Body] Could not read response')
				}
			}
		}
	})
}

/**
 * Enable all debugging for a page
 *
 * Captures console, errors, and network activity
 *
 * @param page - Playwright page instance
 */
export function enableAllDebugging(page: Page) {
	captureConsoleMessages(page)
	capturePageErrors(page)
	captureNetworkFailures(page)
	captureNetworkRequests(page, 'admin-ajax.php')
}

/**
 * Save page HTML snapshot for debugging
 *
 * @param page - Playwright page instance
 * @param name - Snapshot name
 */
export async function savePageSnapshot(page: Page, name: string) {
	const html = await page.content()
	const snapshotPath = path.join(process.cwd(), 'test-results', `snapshot-${name}.html`)
	fs.mkdirSync(path.dirname(snapshotPath), { recursive: true })
	fs.writeFileSync(snapshotPath, html)
	console.log(`📸 Snapshot saved: ${snapshotPath}`)
}

/**
 * Dump iframe content for debugging
 *
 * @param page - Playwright page instance
 * @param iframeSelector - Iframe selector
 */
export async function dumpIframeContent(page: Page, iframeSelector: string = '#TB_iframeContent') {
	try {
		const iframe = page.frameLocator(iframeSelector)
		const body = await iframe.locator('body').innerHTML()
		console.log('=== IFRAME CONTENT ===')
		console.log(body.substring(0, 1000))
		console.log('=== END IFRAME CONTENT ===')
	} catch (error) {
		console.error('Failed to dump iframe content:', error)
	}
}
