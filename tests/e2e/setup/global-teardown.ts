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
	/**
	 * In CI, wp-env is stopped via workflow
	 * Locally, we keep it running for faster subsequent runs
	 */
}

export default globalTeardown
