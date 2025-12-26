import { Page, Locator, expect } from '@playwright/test'

/**
 * Page Object Model for GitHub Release Browser Modal
 *
 * This class encapsulates all interactions with the browser modal,
 * providing a clean API for E2E tests.
 *
 * The modal is rendered inside WordPress Thickbox (#TB_window) within an iframe.
 * Playwright must interact with the iframe content.
 */
export class BrowserModal {
	readonly page: Page
	readonly modal: Locator
	readonly iframe: Locator
	readonly searchInput: Locator
	readonly refreshButton: Locator
	readonly backButton: Locator
	readonly spinner: Locator
	readonly confirmButton: Locator

	constructor(page: Page) {
		this.page = page
		this.modal = page.locator('#TB_window')

		/** Thickbox modal content is in an iframe */
		this.iframe = page.frameLocator('#TB_iframeContent')

		/** All selectors must be within the iframe using actual WordPress component classes */
		this.searchInput = this.iframe.locator('.components-search-control input[type="search"]')
		this.refreshButton = this.iframe.locator('button:has-text("Refresh"), button[aria-label*="Refresh"]')
		this.backButton = this.iframe.locator('.github-release-browser-browser__back-button')
		this.spinner = this.iframe.locator('.components-spinner')
		this.confirmButton = this.iframe.locator('button:has-text("Insert into download")')
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

	/** Expand a repository accordion by name (clicks the accordion toggle) */
	async expandRepository(name: string) {
		const repoButton = this.iframe.locator(`.components-panel__body-toggle:has-text("${name}")`).first()
		await repoButton.click()
		await this.waitForLoading()
	}

	/** Select a repository by name (alias for expandRepository for backward compatibility) */
	async selectRepository(name: string) {
		await this.expandRepository(name)
	}

	/** Select the "Use Latest Release" option in an expanded repository */
	async selectLatestRelease() {
		/** Wait for the release list to render inside the accordion */
		const latestCard = this.iframe.locator('.github-release-browser-release-card_latest').first()
		await latestCard.waitFor({ state: 'visible', timeout: 10000 })
		await latestCard.click()
		await this.waitForLoading()
	}

	/** Select a release by tag name */
	async selectRelease(tagName: string) {
		const release = this.iframe.locator(`.github-release-browser-release-card:has-text("${tagName}")`).first()
		await release.click()
		await this.waitForLoading()
	}

	/** Select an asset by filename */
	async selectAsset(filename: string) {
		const asset = this.iframe.locator(`.github-release-browser-asset-card:has-text("${filename}")`).first()
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
		const toggle = this.iframe.locator('button[data-value="directory"], button[aria-label="Directory"]')
		await toggle.click()
		await this.page.waitForTimeout(300)
	}

	/** Switch to release mode */
	async switchToReleaseMode() {
		const toggle = this.iframe.locator('button[data-value="releases"], button[aria-label="Releases"]')
		await toggle.click()
		await this.page.waitForTimeout(300)
	}

	/** Select a branch in directory mode */
	async selectBranch(branchName: string) {
		const branchSelect = this.iframe.locator('.components-select-control select, select')
		await branchSelect.selectOption({ label: branchName })
		await this.waitForLoading()
	}

	/** Navigate to a folder in directory browser */
	async navigateToFolder(folderName: string) {
		const folder = this.iframe.locator(`text=${folderName}`).first()
		await folder.click()
		await this.waitForLoading()
	}

	/** Get error message text */
	async getErrorMessage(): Promise<string | null> {
		const errorElement = this.iframe.locator('[data-testid="error-message"]')
		if (await errorElement.isVisible()) {
			return await errorElement.textContent()
		}
		return null
	}

	/** Check if error state is displayed */
	async hasError(): Promise<boolean> {
		const errorElement = this.iframe.locator('[data-testid="error-message"]')
		return await errorElement.isVisible()
	}

	/** Get all visible repository names */
	async getVisibleRepositories(): Promise<string[]> {
		/** Repository toggle buttons are inside PanelBody headers */
		const buttons = this.iframe.locator('.components-panel__body-toggle')
		const count = await buttons.count()
		const names: string[] = []

		for (let i = 0; i < count; i++) {
			const text = await buttons.nth(i).textContent()
			if (text) {
				/** Extract just the repository name (remove checkmarks and lock symbols) */
				const cleanText = text.trim().replace(/[✓*]/g, '').trim()
				if (cleanText) {
					names.push(cleanText)
				}
			}
		}

		return names
	}

	/** Get all visible release tags */
	async getVisibleReleases(): Promise<string[]> {
		/** Release cards use .github-release-browser-release-card (excluding the special "latest" card) */
		const releases = this.iframe.locator('.github-release-browser-release-card:not(.github-release-browser-release-card_latest)')
		const count = await releases.count()
		const tags: string[] = []

		for (let i = 0; i < count; i++) {
			/** Get the title which contains the tag name */
			const titleElement = releases.nth(i).locator('.github-release-browser-card__title')
			const text = await titleElement.textContent()
			if (text) {
				/** Extract just the tag name (before any " - " subtitle) */
				const tagName = text.split(' - ')[0].trim()
				if (tagName) {
					tags.push(tagName)
				}
			}
		}

		return tags
	}

	/** Get all visible asset names */
	async getVisibleAssets(): Promise<string[]> {
		/** Asset cards use .github-release-browser-asset-card */
		const assets = this.iframe.locator('.github-release-browser-asset-card')
		const count = await assets.count()
		const names: string[] = []

		for (let i = 0; i < count; i++) {
			/** Get the title which contains the asset filename */
			const titleElement = assets.nth(i).locator('.github-release-browser-card__title')
			const text = await titleElement.textContent()
			if (text) {
				names.push(text.trim())
			}
		}

		return names
	}

	/** Find the first repository that has releases and leave it expanded */
	async findRepositoryWithReleases(): Promise<string | null> {
		const repos = await this.getVisibleRepositories()

		for (const repo of repos) {
			await this.expandRepository(repo)

			/** Check if "Use Latest Release" card is visible (indicates releases exist) */
			const latestCard = this.iframe.locator('.github-release-browser-release-card_latest')
			try {
				await latestCard.waitFor({ state: 'visible', timeout: 3000 })
				/** Found a repository with releases - leave it expanded */
				return repo
			} catch (e) {
				/** No releases in this repo, collapse and try next */
				await this.collapseCurrentRepository(repo)
			}
		}

		return null
	}

	/** Collapse a repository accordion by clicking its toggle button */
	async collapseCurrentRepository(name: string) {
		const repoButton = this.iframe.locator(`.components-panel__body-toggle:has-text("${name}")`).first()
		await repoButton.click()
		await this.page.waitForTimeout(300)
	}

	/** Close the modal */
	async close() {
		const closeButton = this.page.locator('#TB_closeWindowButton').first()
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
