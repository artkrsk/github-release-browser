import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Load test environment variables
 * Priority: .env.test > .env.test.example
 */
dotenv.config({ path: resolve(__dirname, '.env.test') })
dotenv.config({ path: resolve(__dirname, '.env.test.example') })

/**
 * Playwright Configuration for WordPress E2E Testing
 *
 * This configuration is optimized for testing WordPress plugins with wp-env.
 * It handles WordPress-specific concerns like slow Docker startup, authentication,
 * and the Thickbox modal integration used by this plugin.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	/** Directory containing E2E test specs */
	testDir: './tests/e2e/specs',

	/** Global setup/teardown */
	globalSetup: './tests/e2e/setup/global-setup.ts',
	globalTeardown: './tests/e2e/setup/global-teardown.ts',

	/** Maximum time one test can run */
	timeout: 60 * 1000, // 60 seconds (WordPress can be slow in Docker)

	/** Expect assertions timeout */
	expect: {
		timeout: 10 * 1000 // 10 seconds for DOM assertions
	},

	/** Run tests in files in parallel */
	fullyParallel: false, // WordPress state management works better sequentially

	/** Fail the build on CI if you accidentally left test.only in the source code */
	forbidOnly: !!process.env.CI,

	/** Retry on CI only */
	retries: process.env.CI ? 2 : 1,

	/** Limit parallel workers to avoid overwhelming wp-env */
	workers: process.env.CI ? 1 : 2,

	/** Reporter to use */
	reporter: [
		['html', { outputFolder: 'playwright-report' }],
		['list'],
		...(process.env.CI ? [['github' as const]] : [])
	],

	/** Shared settings for all projects */
	use: {
		/** Base URL for WordPress installation */
		baseURL: process.env.WP_ENV_URL || 'http://localhost:8888',

		/** Collect trace when retrying the failed test */
		trace: 'on-first-retry',

		/** Screenshot only on failure */
		screenshot: 'only-on-failure',

		/** Video only on failure */
		video: 'retain-on-failure',

		/** Maximum time for navigation */
		navigationTimeout: 30 * 1000,

		/** Maximum time for actions (click, fill, etc.) */
		actionTimeout: 10 * 1000
	},

	/** Configure projects for major browsers */
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 1280, height: 720 }
			}
		},

		/** Uncomment to test on Firefox */
		// {
		// 	name: 'firefox',
		// 	use: {
		// 		...devices['Desktop Firefox'],
		// 		viewport: { width: 1280, height: 720 }
		// 	}
		// },

		/** Uncomment to test on WebKit (Safari) */
		// {
		// 	name: 'webkit',
		// 	use: {
		// 		...devices['Desktop Safari'],
		// 		viewport: { width: 1280, height: 720 }
		// 	}
		// }
	],

	/**
	 * Web Server Configuration
	 *
	 * Playwright can automatically start wp-env if it's not running.
	 * However, this is disabled by default because:
	 * 1. wp-env startup is slow (~60s)
	 * 2. WordPress REST API may not be ready immediately
	 * 3. Better to start wp-env manually and reuse the instance
	 *
	 * To enable auto-start, uncomment the webServer block below.
	 */
	// webServer: {
	// 	command: 'pnpm env:start',
	// 	port: 8888,
	// 	timeout: 120 * 1000, // 2 minutes for wp-env to start
	// 	reuseExistingServer: !process.env.CI,
	// 	stdout: 'pipe',
	// 	stderr: 'pipe'
	// }
})
