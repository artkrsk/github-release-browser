import { test, expect } from '../fixtures/wordpress'
import { navigateToAssetsView, selectFirstAsset } from '../helpers/navigation-helpers'

/**
 * E2E Tests: Asset Confirmation and URI Generation
 *
 * Tests the final step of the user flow: confirming an asset
 * selection and verifying the generated URI.
 *
 * Tests cover:
 * - Asset selection confirmation
 * - Modal closing after confirmation
 * - URI population in parent page
 * - URI format validation
 * - URI testing via AJAX endpoint
 */

test.describe('Asset Confirmation', () => {
	test('should populate URI field when asset is confirmed', async ({ browserModal, wpAdmin }) => {
		/** Navigate to assets view and select first asset */
		await navigateToAssetsView(browserModal)
		await selectFirstAsset(browserModal)

		/** Confirm selection */
		await browserModal.confirmSelection()
		await browserModal.expectModalClosed()

		/** Verify URI is populated */
		const uri = await wpAdmin.getSelectedAssetURI()
		expect(uri).toBeTruthy()
		expect(uri).not.toBe('')
	})

	test('should generate github-release:// URI for release assets', async ({ browserModal, wpAdmin }) => {
		/** Navigate to assets and complete selection */
		await navigateToAssetsView(browserModal)
		await selectFirstAsset(browserModal)
		await browserModal.confirmSelection()
		await browserModal.expectModalClosed()

		/** Verify URI format */
		const uri = await wpAdmin.getSelectedAssetURI()
		expect(uri).toMatch(/^github-release:\/\//)
		expect(uri).toContain('/')
	})

	test('should close modal after confirmation', async ({ browserModal }) => {
		/** Navigate to assets and select asset */
		await navigateToAssetsView(browserModal)
		await selectFirstAsset(browserModal)

		/** Verify modal is open, then confirm and verify it closes */
		await browserModal.expectModalOpen()
		await browserModal.confirmSelection()
		await browserModal.expectModalClosed()
	})

	test('should enable confirm button only when asset is selected', async ({ browserModal }) => {
		/** Navigate to assets view */
		await navigateToAssetsView(browserModal)

		/** Initially, confirm button should be disabled */
		expect(await browserModal.isConfirmDisabled()).toBe(true)

		/** Select an asset */
		await selectFirstAsset(browserModal)

		/** Now confirm button should be enabled */
		expect(await browserModal.isConfirmDisabled()).toBe(false)
	})

	test('should test URI and get download URL', async ({ browserModal, wpAdmin }) => {
		/** Complete full selection flow */
		await navigateToAssetsView(browserModal)
		await selectFirstAsset(browserModal)
		await browserModal.confirmSelection()
		await browserModal.expectModalClosed()

		/** Verify URI exists */
		const uri = await wpAdmin.getSelectedAssetURI()
		expect(uri).toBeTruthy()

		/** Test URI via AJAX endpoint */
		const result = await wpAdmin.testURI()
		expect(result).toBeTruthy()
		expect(result.length).toBeGreaterThan(0)
	})

	test('should preserve URI after modal is closed', async ({ browserModal, wpAdmin, page }) => {
		/** Complete selection flow */
		await navigateToAssetsView(browserModal)
		await selectFirstAsset(browserModal)
		await browserModal.confirmSelection()
		await browserModal.expectModalClosed()

		/** Get URI */
		const uri = await wpAdmin.getSelectedAssetURI()
		expect(uri).toBeTruthy()

		/** Open modal again */
		await wpAdmin.openBrowserModal()
		const modalAfterReopen = new (await import('../page-objects/BrowserModal')).BrowserModal(page)
		await modalAfterReopen.waitForModal()
		await modalAfterReopen.close()

		/** URI should still be preserved */
		const uriAfterReopen = await wpAdmin.getSelectedAssetURI()
		expect(uriAfterReopen).toBe(uri)
	})

	test('should handle multiple asset selections correctly', async ({ browserModal, wpAdmin }) => {
		/** First selection */
		await navigateToAssetsView(browserModal)
		const assets = await selectFirstAsset(browserModal)
		await browserModal.confirmSelection()
		await browserModal.expectModalClosed()

		const firstURI = await wpAdmin.getSelectedAssetURI()

		/** Second selection (if there are multiple assets) */
		if (assets.length > 1) {
			await wpAdmin.openBrowserModal()
			const modal2 = new (await import('../page-objects/BrowserModal')).BrowserModal(browserModal.page)
			await modal2.waitForModal()

			/** Navigate and select different asset */
			await navigateToAssetsView(modal2)
			const assets2 = await modal2.getVisibleAssets()
			await modal2.selectAsset(assets2[1])
			await modal2.confirmSelection()
			await modal2.expectModalClosed()

			/** URI should be updated */
			const secondURI = await wpAdmin.getSelectedAssetURI()
			expect(secondURI).toBeTruthy()
			expect(secondURI).not.toBe(firstURI)
		}
	})
})

/**
 * Test Strategy:
 *
 * Asset confirmation is the final critical step.
 * We verify:
 * - Modal closes properly
 * - URI is correctly generated
 * - URI format is valid (github-release://)
 * - URI persists across modal open/close
 * - AJAX endpoint can resolve URI to download URL
 *
 * These tests ensure the complete integration between:
 * - React frontend (modal)
 * - WordPress parent page (input field)
 * - PHP backend (URI resolution)
 */
