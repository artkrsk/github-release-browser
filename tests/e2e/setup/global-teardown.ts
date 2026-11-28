import { FullConfig } from '@playwright/test'

/**
 * Global Teardown for Playwright E2E Tests
 *
 * This runs once after all tests complete. It is intentionally a no-op:
 * it cleans up nothing and generates no reports (the HTML report comes from
 * the Playwright reporter in playwright.config.ts).
 *
 * @see https://playwright.dev/docs/test-global-setup-teardown
 */
async function globalTeardown(config: FullConfig) {
	/**
	 * wp-env is left running for faster subsequent runs; stop it with `pnpm env:stop`
	 */
}

export default globalTeardown
