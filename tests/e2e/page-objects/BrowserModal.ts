import { Page, Locator, expect } from '@playwright/test'

/**
 * Page Object Model for GitHub Release Browser Modal
 *
 * This class encapsulates all interactions with the browser modal,
 * providing a clean API for E2E tests.
 *
 * The modal is rendered inside WordPress Thickbox (#TB_window).
 */
export class BrowserModal {
	readonly page: Page
	readonly modal: Locator
	readonly searchInput: Locator
	readonly refreshButton: Locator
	readonly backButton: Locator
	readonly spinner: Locator
	readonly confirmButton: Locator

	constructor(page: Page) {
		this.page = page
		this.modal = page.locator('#TB_window')
		this.searchInput = page.locator('[data-testid="search-control"]')
		this.refreshButton = page.locator('text=Refresh')
		this.backButton = page.locator('text=/back to/i')
		this.spinner = page.locator('[data-testid="spinner"]')
		this.confirmButton = page.locator('text=/insert into download/i')
	}

	/** Wait for modal to be visible and stable */
	async waitForModal() {
		await this.modal.waitFor({ state: 'visible' })
		/** Wait for animations to complete */
		await this.page.waitForTimeout(500)
	}

	/** Wait for loading spinner to disappear */
	async waitForLoading() {
		await this.spinner.waitFor({ state: 'hidden', timeout: 15000 })
	}

	/** Search for repositories */
	async searchRepository(query: string) {
		await this.searchInput.fill(query)
		/** Wait a bit for client-side filtering */
		await this.page.waitForTimeout(300)
	}

	/** Select a repository by name */
	async selectRepository(name: string) {
		const repo = this.page.locator(`text=${name}`).first()
		await repo.click()
		await this.waitForLoading()
	}

	/** Select a release by tag name */
	async selectRelease(tagName: string) {
		const release = this.page.locator(`text=${tagName}`).first()
		await release.click()
		await this.waitForLoading()
	}

	/** Select an asset by filename */
	async selectAsset(filename: string) {
		const asset = this.page.locator(`text=${filename}`).first()
		await asset.click()
	}

	/** Click the refresh button */
	async refresh() {
		await this.refreshButton.click()
		await this.waitForLoading()
	}

	/** Click the back button */
	async goBack() {
		await this.backButton.click()
		await this.waitForLoading()
	}

	/** Confirm selection (Insert into download) */
	async confirmSelection() {
		await this.confirmButton.click()
	}

	/** Check if confirm button is disabled */
	async isConfirmDisabled(): Promise<boolean> {
		return await this.confirmButton.isDisabled()
	}

	/** Switch to directory browsing mode */
	async switchToDirectoryMode() {
		const toggle = this.page.locator('[data-testid="toggle-option-directory"]')
		await toggle.click()
		await this.page.waitForTimeout(300)
	}

	/** Switch to release mode */
	async switchToReleaseMode() {
		const toggle = this.page.locator('[data-testid="toggle-option-release"]')
		await toggle.click()
		await this.page.waitForTimeout(300)
	}

	/** Select a branch in directory mode */
	async selectBranch(branchName: string) {
		const branchSelect = this.page.locator('[data-testid="select-control"] select')
		await branchSelect.selectOption({ label: branchName })
		await this.waitForLoading()
	}

	/** Navigate to a folder in directory browser */
	async navigateToFolder(folderName: string) {
		const folder = this.page.locator(`text=${folderName}`).first()
		await folder.click()
		await this.waitForLoading()
	}

	/** Get error message text */
	async getErrorMessage(): Promise<string | null> {
		const errorElement = this.page.locator('[data-testid="error-message"]')
		if (await errorElement.isVisible()) {
			return await errorElement.textContent()
		}
		return null
	}

	/** Check if error state is displayed */
	async hasError(): Promise<boolean> {
		const errorElement = this.page.locator('[data-testid="error-message"]')
		return await errorElement.isVisible()
	}

	/** Get all visible repository names */
	async getVisibleRepositories(): Promise<string[]> {
		const cards = this.page.locator('.wp-card')
		const count = await cards.count()
		const names: string[] = []

		for (let i = 0; i < count; i++) {
			const text = await cards.nth(i).textContent()
			if (text) {
				names.push(text.trim())
			}
		}

		return names
	}

	/** Get all visible release tags */
	async getVisibleReleases(): Promise<string[]> {
		const releases = this.page.locator('[data-testid="release-item"]')
		const count = await releases.count()
		const tags: string[] = []

		for (let i = 0; i < count; i++) {
			const text = await releases.nth(i).textContent()
			if (text) {
				tags.push(text.trim())
			}
		}

		return tags
	}

	/** Get all visible asset names */
	async getVisibleAssets(): Promise<string[]> {
		const assets = this.page.locator('[data-testid="asset-item"]')
		const count = await assets.count()
		const names: string[] = []

		for (let i = 0; i < count; i++) {
			const text = await assets.nth(i).textContent()
			if (text) {
				names.push(text.trim())
			}
		}

		return names
	}

	/** Close the modal */
	async close() {
		const closeButton = this.page.locator('#TB_closeWindowButton')
		await closeButton.click()
		await this.modal.waitFor({ state: 'hidden' })
	}

	/** Verify modal is open */
	async expectModalOpen() {
		await expect(this.modal).toBeVisible()
	}

	/** Verify modal is closed */
	async expectModalClosed() {
		await expect(this.modal).toBeHidden()
	}

	/** Verify loading state */
	async expectLoading() {
		await expect(this.spinner).toBeVisible()
	}

	/** Verify not loading */
	async expectNotLoading() {
		await expect(this.spinner).toBeHidden()
	}
}
