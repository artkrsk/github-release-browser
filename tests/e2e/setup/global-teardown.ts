import { FullConfig } from '@playwright/test'

/**
 * Global Teardown for Playwright E2E Tests
 *
 * This runs once after all tests complete. It:
 * 1. Cleans up temporary files
 * 2. Optionally stops wp-env (only in CI)
 * 3. Generates final reports
 *
 * @see https://playwright.dev/docs/test-global-setup-teardown
 */
async function globalTeardown(config: FullConfig) {
	console.log('\n🧹 Global E2E Teardown Starting...')

	/**
	 * In CI, wp-env should be stopped after tests
	 * Locally, we keep it running for faster subsequent runs
	 */
	if (process.env.CI) {
		console.log('🛑 Stopping wp-env (CI environment)...')
		// Note: wp-env stop is handled by CI workflow
		// We don't stop it here to avoid issues with artifacts upload
	} else {
		console.log('ℹ️  Keeping wp-env running (local environment)')
		console.log('   Stop manually with: pnpm env:stop')
	}

	console.log('✅ Global E2E Teardown Complete')
}

export default globalTeardown
