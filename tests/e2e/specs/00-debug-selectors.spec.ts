import { test, expect } from '@playwright/test'
import { enableAllDebugging } from '../utils/debug'

/**
 * Debug Test: Find Correct Selectors
 *
 * This test inspects the actual DOM to determine correct selectors
 * for repositories, releases, and assets.
 */

test('Find repository item selectors', async ({ page }) => {
	enableAllDebugging(page)

	/** Login */
	await page.goto('http://localhost:8888/wp-login.php')
	await page.fill('#user_login', 'admin')
	await page.fill('#user_pass', 'password')
	await page.click('#wp-submit')
	await page.waitForURL('**/wp-admin/**')

	/** Go to test page and open modal */
	await page.goto('http://localhost:8888/wp-admin/admin.php?page=github-release-browser-test')
	const browseButton = page.locator('a.thickbox')
	await browseButton.click()

	/** Wait for iframe and content */
	await page.waitForTimeout(3000)

	const iframe = page.frameLocator('#TB_iframeContent')

	/** Get all unique element types in the root */
	const rootDiv = iframe.locator('#github-release-browser-root')
	const rootHTML = await rootDiv.innerHTML()

	console.log('=== IFRAME ROOT HTML ===')
	console.log(rootHTML)
	console.log('=== END ===\n')

	/** Try different selectors to find repositories */
	const selectors = [
		'.components-panel__body',
		'.wp-panel-body',
		'[role="button"]',
		'button',
		'[class*="panel"]',
		'[class*="repo"]',
		'[data-testid]'
	]

	for (const selector of selectors) {
		const elements = iframe.locator(selector)
		const count = await elements.count()
		console.log(`Selector "${selector}": ${count} elements found`)

		if (count > 0 && count < 20) {
			const firstText = await elements.first().textContent()
			console.log(`  First element text: ${firstText?.substring(0, 100)}`)
		}
	}

	/** This test always passes - it's just for inspection */
	expect(true).toBe(true)
})
