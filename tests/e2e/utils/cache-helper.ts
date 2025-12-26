import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Cache Management Utilities for E2E Tests
 *
 * WordPress uses transients for caching. These utilities help
 * manage cache state between E2E tests.
 */

/**
 * Clear all WordPress transients via WP-CLI
 *
 * This ensures each test starts with a clean cache state.
 *
 * @returns Promise that resolves when cache is cleared
 */
export async function clearAllCaches(): Promise<void> {
	try {
		/** Clear all transients using WP-CLI in wp-env container */
		await execAsync('pnpm env:cli wp transient delete --all')
	} catch (error) {
		/** Don't fail the test if cache clearing fails */
	}
}

/**
 * Clear specific transient by key
 *
 * @param key - Transient key to delete
 * @returns Promise that resolves when transient is deleted
 */
export async function clearTransient(key: string): Promise<void> {
	try {
		await execAsync(`pnpm env:cli wp transient delete ${key}`)
	} catch (error) {
		/** Don't fail the test if cache clearing fails */
	}
}

/**
 * List all current transients
 *
 * Useful for debugging cache issues
 *
 * @returns Array of transient keys
 */
export async function listTransients(): Promise<string[]> {
	try {
		const { stdout } = await execAsync('pnpm env:cli wp transient list --format=json')
		const transients = JSON.parse(stdout)
		return transients.map((t: any) => t.name)
	} catch (error) {
		return []
	}
}

/**
 * Seed cache with test data (optional)
 *
 * Pre-populate WordPress transients to speed up tests.
 *
 * @param key - Transient key
 * @param value - JSON-serializable value
 * @param expiration - Expiration time in seconds (default: 1 hour)
 */
export async function seedCache(
	key: string,
	value: any,
	expiration: number = 3600
): Promise<void> {
	try {
		const jsonValue = JSON.stringify(value).replace(/'/g, "\\'")
		await execAsync(
			`pnpm env:cli wp transient set ${key} '${jsonValue}' ${expiration}`
		)
	} catch (error) {
		/** Don't fail if seeding fails */
	}
}

/**
 * Wait for cache to be available
 *
 * Some caching systems need time to warm up
 *
 * @param timeout - Maximum time to wait in milliseconds
 */
export async function waitForCacheReady(timeout: number = 5000): Promise<void> {
	/** Simple wait - WordPress transients are always ready */
	await new Promise(resolve => setTimeout(resolve, 100))
}
