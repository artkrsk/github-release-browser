import { chromium, FullConfig } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Global Setup for Playwright E2E Tests
 *
 * This runs once before all tests. It:
 * 1. Verifies wp-env is running
 * 2. Waits for WordPress to be ready
 * 3. Injects GitHub token for CI environments
 * 4. Performs any necessary database seeding
 *
 * @see https://playwright.dev/docs/test-global-setup-teardown
 */
async function globalSetup(config: FullConfig) {
	console.log('🔧 Global E2E Setup Starting...')

	const baseURL = config.use?.baseURL || 'http://localhost:8888'

	/** Step 1: Inject GitHub token in CI environment only */
	/** In local dev, .wp-env.override.json should already exist */
	if (process.env.CI === 'true' && process.env.GITHUB_TOKEN) {
		console.log('📝 Injecting GitHub token for CI...')
		const overrideConfig = {
			config: {
				GH_TOKEN: process.env.GITHUB_TOKEN
			}
		}

		const overridePath = path.resolve(process.cwd(), '.wp-env.override.json')
		fs.writeFileSync(overridePath, JSON.stringify(overrideConfig, null, 2))
		console.log('✅ GitHub token injected')
	} else {
		console.log('ℹ️  Using existing .wp-env.override.json (local development)')
	}

	/** Step 2: Wait for WordPress to be ready */
	console.log('⏳ Waiting for WordPress to be ready...')

	const browser = await chromium.launch()
	const context = await browser.newContext()
	const page = await context.newPage()

	let retries = 30 // 30 retries = 60 seconds max
	let ready = false

	while (retries > 0 && !ready) {
		try {
			/** Test if WordPress admin-ajax.php is responding */
			const response = await page.goto(`${baseURL}/wp-admin/admin-ajax.php`, {
				waitUntil: 'domcontentloaded',
				timeout: 2000
			})

			if (response && response.status() === 400) {
				/** 400 is expected for admin-ajax without action parameter */
				ready = true
				console.log('✅ WordPress is ready!')
			}
		} catch (error) {
			retries--
			if (retries === 0) {
				await browser.close()
				throw new Error(
					`WordPress is not ready after 60 seconds. Please ensure wp-env is running with 'pnpm env:start'`
				)
			}
			/** Wait 2 seconds before retry */
			await new Promise(resolve => setTimeout(resolve, 2000))
		}
	}

	await browser.close()

	/** Step 3: Verify GitHub token is configured */
	const overridePath = path.resolve(process.cwd(), '.wp-env.override.json')
	if (!fs.existsSync(overridePath)) {
		console.warn('⚠️  No .wp-env.override.json found. GitHub API tests may fail.')
		console.warn('   Create .wp-env.override.json with your GitHub token:')
		console.warn('   { "config": { "GH_TOKEN": "your_token_here" } }')
	} else {
		try {
			const overrideContent = fs.readFileSync(overridePath, 'utf-8')
			const override = JSON.parse(overrideContent)
			if (override?.config?.GH_TOKEN) {
				console.log('✅ GitHub token configured')
			} else {
				console.warn('⚠️  No GH_TOKEN found in .wp-env.override.json')
			}
		} catch (error) {
			console.warn('⚠️  Could not read .wp-env.override.json')
		}
	}

	console.log('✅ Global E2E Setup Complete\n')
}

export default globalSetup
