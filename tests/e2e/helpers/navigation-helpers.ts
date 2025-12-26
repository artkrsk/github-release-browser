import { BrowserModal } from '../page-objects/BrowserModal'
import { expect } from '@playwright/test'

/**
 * Navigation Helper Functions for E2E Tests
 *
 * Reusable navigation flows to reduce code duplication and improve
 * test readability. These helpers compose multiple BrowserModal methods
 * into common test scenarios.
 */

/**
 * Navigate to assets view by finding a repository with releases
 * and selecting the latest release
 *
 * This is the most common navigation pattern in E2E tests.
 *
 * @param browserModal - BrowserModal page object instance
 * @returns Repository name that was selected
 */
export async function navigateToAssetsView(
	browserModal: BrowserModal
): Promise<string | null> {
	await browserModal.waitForLoading()
	const repoWithReleases = await browserModal.findRepositoryWithReleases()
	expect(repoWithReleases).toBeTruthy()

	await browserModal.selectLatestRelease()
	await browserModal.waitForLoading()

	return repoWithReleases
}

/**
 * Get visible assets and select the first one
 *
 * @param browserModal - BrowserModal page object instance
 * @returns Array of asset names
 */
export async function selectFirstAsset(
	browserModal: BrowserModal
): Promise<string[]> {
	const assets = await browserModal.getVisibleAssets()
	expect(assets.length).toBeGreaterThan(0)
	await browserModal.selectAsset(assets[0])

	return assets
}

/**
 * Complete full asset selection flow: navigate to assets, select first asset,
 * and confirm selection
 *
 * @param browserModal - BrowserModal page object instance
 * @returns Object with repository name and selected assets
 */
export async function completeAssetSelection(
	browserModal: BrowserModal
): Promise<{ repository: string | null; assets: string[] }> {
	const repository = await navigateToAssetsView(browserModal)
	const assets = await selectFirstAsset(browserModal)

	await browserModal.confirmSelection()
	await browserModal.expectModalClosed()

	return { repository, assets }
}

/**
 * Navigate to assets view without selecting any asset
 * Useful for tests that need to inspect the assets list
 *
 * @param browserModal - BrowserModal page object instance
 * @returns Object with repository name and visible assets
 */
export async function navigateToAssetsWithoutSelection(
	browserModal: BrowserModal
): Promise<{ repository: string | null; assets: string[] }> {
	const repository = await navigateToAssetsView(browserModal)
	const assets = await browserModal.getVisibleAssets()
	expect(assets.length).toBeGreaterThan(0)

	return { repository, assets }
}

/**
 * Setup directory browsing mode by switching mode, selecting repository,
 * selecting branch, and waiting for contents to load
 *
 * @param browserModal - BrowserModal page object instance
 * @param branchName - Branch name to select (default: 'main')
 * @returns Repository name that was selected
 */
export async function setupDirectoryMode(
	browserModal: BrowserModal,
	branchName: string = 'main'
): Promise<string> {
	await browserModal.waitForLoading()
	await browserModal.switchToDirectoryMode()

	const repos = await browserModal.getVisibleRepositories()
	await browserModal.selectRepository(repos[0])

	await browserModal.waitForLoading()
	await browserModal.selectBranch(branchName)
	await browserModal.waitForLoading()

	return repos[0]
}

/**
 * Setup directory mode without branch selection
 * Useful for tests that need to verify branch selector is visible
 *
 * @param browserModal - BrowserModal page object instance
 * @returns Repository name that was selected
 */
export async function setupDirectoryModeWithoutBranch(
	browserModal: BrowserModal
): Promise<string> {
	await browserModal.waitForLoading()
	await browserModal.switchToDirectoryMode()

	const repos = await browserModal.getVisibleRepositories()
	await browserModal.selectRepository(repos[0])
	await browserModal.waitForLoading()

	return repos[0]
}
