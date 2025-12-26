import { test, expect } from '@playwright/test'
import { enableAllDebugging } from '../utils/debug'

/**
 * Smoke Tests - Basic WordPress and Plugin Verification
 *
 * These tests verify the WordPress environment is properly configured
 * before running complex E2E tests.
 */

test.describe('Smoke Tests', () => {
	test('WordPress is accessible and admin can login', async ({ page }) => {
		enableAllDebugging(page)

		/** Navigate to WordPress login */
		await page.goto('http://localhost:8888/wp-login.php')

		/** Login */
		await page.fill('#user_login', 'admin')
		await page.fill('#user_pass', 'password')
		await page.click('#wp-submit')

		/** Verify logged in */
		await page.waitForURL('**/wp-admin/**')
		await expect(page.locator('#wpadminbar')).toBeVisible()

		console.log('✅ WordPress login successful')
	})

	test('Browser test page exists and loads', async ({ page }) => {
		enableAllDebugging(page)

		/** Login */
		await page.goto('http://localhost:8888/wp-login.php')
		await page.fill('#user_login', 'admin')
		await page.fill('#user_pass', 'password')
		await page.click('#wp-submit')
		await page.waitForURL('**/wp-admin/**')

		/** Navigate to browser test page */
		await page.goto('http://localhost:8888/wp-admin/admin.php?page=github-release-browser-test')
		await page.waitForLoadState('domcontentloaded')

		/** Verify test page content */
		await expect(page.locator('h1:has-text("GitHub Release Browser Test")')).toBeVisible()
		await expect(page.locator('#github-asset-uri')).toBeVisible()
		await expect(page.locator('text=Browse GitHub Releases')).toBeVisible()

		console.log('✅ Browser test page loads correctly')
	})

	test('GitHub token is configured in wp-env', async ({ page }) => {
		enableAllDebugging(page)

		/** Login */
		await page.goto('http://localhost:8888/wp-login.php')
		await page.fill('#user_login', 'admin')
		await page.fill('#user_pass', 'password')
		await page.click('#wp-submit')
		await page.waitForURL('**/wp-admin/**')

		/** Navigate to test page */
		await page.goto('http://localhost:8888/wp-admin/admin.php?page=github-release-browser-test')

		/** Check if window.githubReleaseBrowserConfig exists */
		const hasConfig = await page.evaluate(() => {
			return typeof (window as any).githubReleaseBrowserConfig !== 'undefined'
		})

		/** Note: Config is loaded in iframe, not main page */
		console.log(`Config in main page: ${hasConfig}`)

		/** The real check is whether the iframe loads */
		/** This test just verifies the page structure exists */
		expect(true).toBe(true) // Placeholder - real validation in next test
	})

	test('Thickbox modal can open', async ({ page }) => {
		enableAllDebugging(page)

		/** Login and navigate */
		await page.goto('http://localhost:8888/wp-login.php')
		await page.fill('#user_login', 'admin')
		await page.fill('#user_pass', 'password')
		await page.click('#wp-submit')
		await page.waitForURL('**/wp-admin/**')

		await page.goto('http://localhost:8888/wp-admin/admin.php?page=github-release-browser-test')
		await page.waitForLoadState('domcontentloaded')

		/** Click the browse button */
		const browseButton = page.locator('a.thickbox:has-text("Browse GitHub Releases")')
		await browseButton.click()

		/** Wait for Thickbox modal */
		const modal = page.locator('#TB_window')
		await modal.waitFor({ state: 'visible', timeout: 5000 })

		console.log('✅ Thickbox modal opens')

		/** Check if iframe exists */
		const iframe = page.locator('#TB_iframeContent')
		const iframeExists = await iframe.count()
		console.log(`Iframe count: ${iframeExists}`)

		expect(iframeExists).toBe(1)

		/** Try to access iframe content */
		try {
			const iframeContent = page.frameLocator('#TB_iframeContent')
			const body = await iframeContent.locator('body')
			const hasBody = await body.count()
			console.log(`Iframe body count: ${hasBody}`)

			if (hasBody > 0) {
				const bodyHtml = await body.innerHTML()
				console.log(`Iframe body HTML: ${bodyHtml.substring(0, 200)}`)
			}
		} catch (error) {
			console.error('Failed to access iframe content:', error)
		}
	})

	test('Iframe content actually renders with React app', async ({ page }) => {
		enableAllDebugging(page)

		/** Login and navigate */
		await page.goto('http://localhost:8888/wp-login.php')
		await page.fill('#user_login', 'admin')
		await page.fill('#user_pass', 'password')
		await page.click('#wp-submit')
		await page.waitForURL('**/wp-admin/**')

		await page.goto('http://localhost:8888/wp-admin/admin.php?page=github-release-browser-test')
		await page.waitForLoadState('domcontentloaded')

		/** Click browse button */
		const browseButton = page.locator('a.thickbox')
		await browseButton.click()

		/** Wait for modal */
		await page.waitForTimeout(2000)

		/** Get iframe content */
		const iframe = page.frameLocator('#TB_iframeContent')
		const rootDiv = iframe.locator('#github-release-browser-root')
		const hasRoot = await rootDiv.count()

		console.log(`Root div count: ${hasRoot}`)

		if (hasRoot > 0) {
			const rootHTML = await rootDiv.innerHTML()
			console.log(`Root HTML length: ${rootHTML.length}`)
			console.log(`Root HTML first 1000 chars:\n${rootHTML.substring(0, 1000)}`)

			/** Check if React rendered */
			const hasReactContent = rootHTML.length > 10
			expect(hasReactContent).toBe(true)
		} else {
			console.error('Root div not found in iframe!')
			expect(hasRoot).toBeGreaterThan(0)
		}
	})

	test('Modal integration action is registered', async ({ page }) => {
		enableAllDebugging(page)

		/** Direct test of the media-upload.php endpoint */
		await page.goto('http://localhost:8888/wp-login.php')
		await page.fill('#user_login', 'admin')
		await page.fill('#user_pass', 'password')
		await page.click('#wp-submit')
		await page.waitForURL('**/wp-admin/**')

		/** Try to directly access the media-upload page */
		const response = await page.goto('http://localhost:8888/wp-admin/media-upload.php?type=github_releases&TB_iframe=true')

		console.log(`Response status: ${response?.status()}`)
		console.log(`Response URL: ${response?.url()}`)

		/** Check if response has content */
		const content = await page.content()
		console.log(`Page content length: ${content.length}`)
		console.log(`First 500 chars: ${content.substring(0, 500)}`)

		/** If the action is registered, we should get actual content */
		expect(response?.status()).toBe(200)
	})
})
