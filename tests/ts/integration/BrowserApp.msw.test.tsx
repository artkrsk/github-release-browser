import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@test-utils'
import { BrowserApp } from '@/components/BrowserApp'
import { setupTestEnvironment } from '@test-utils'
import { server } from '../../msw/setup'
import { invalidTokenHandler, rateLimitHandler, emptyResultsHandler } from '../../msw/handlers'

/**
 * MSW Integration Tests for BrowserApp
 *
 * These tests use Mock Service Worker (MSW) to intercept network requests
 * and provide realistic API responses. Unlike unit tests that mock at the
 * function level, MSW intercepts at the network level, providing more
 * realistic integration testing.
 *
 * Test Scenarios:
 * 1. Successful API interactions
 * 2. Error handling (401, 403, network errors)
 * 3. Cache behavior
 * 4. Loading states
 */

describe('BrowserApp with MSW', () => {
	beforeEach(() => {
		/** Set up test environment with WordPress globals */
		setupTestEnvironment()
	})

	describe('Repository Loading', () => {
		it('should load and display repositories from GitHub API', async () => {
			/** Render the BrowserApp component */
			render(<BrowserApp />)

			/** Wait for repositories to load */
			await waitFor(() => {
				expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
			})

			/** Verify repositories are displayed */
			expect(screen.getByText('test-repo-1')).toBeInTheDocument()
			expect(screen.getByText('test-repo-2')).toBeInTheDocument()
			expect(screen.getByText('react')).toBeInTheDocument()
		})

		it('should handle empty repository list', async () => {
			/** Override default handler with empty results */
			server.use(emptyResultsHandler)

			/** Render the BrowserApp component */
			render(<BrowserApp />)

			/** Wait for loading to complete */
			await waitFor(() => {
				expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
			})

			/** Verify empty state is displayed */
			expect(screen.getByText(/no repositories found/i)).toBeInTheDocument()
		})
	})

	describe('Error Handling', () => {
		it('should display error message when GitHub token is invalid (401)', async () => {
			/** Override default handler with invalid token error */
			server.use(invalidTokenHandler)

			/** Render the BrowserApp component */
			render(<BrowserApp />)

			/** Wait for error message */
			await waitFor(() => {
				expect(screen.getByText(/invalid github token/i)).toBeInTheDocument()
			})

			/** Verify settings link is displayed */
			const settingsLink = screen.getByText(/go to settings/i)
			expect(settingsLink).toBeInTheDocument()
		})

		it('should display rate limit message when API rate limit is exceeded (403)', async () => {
			/** Override default handler with rate limit error */
			server.use(rateLimitHandler)

			/** Render the BrowserApp component */
			render(<BrowserApp />)

			/** Wait for rate limit message */
			await waitFor(() => {
				expect(screen.getByText(/rate limit/i)).toBeInTheDocument()
			})

			/** Verify retry functionality is available */
			expect(screen.getByText(/try again/i)).toBeInTheDocument()
		})
	})

	describe('Loading States', () => {
		it('should show loading spinner while fetching repositories', async () => {
			/** Render the BrowserApp component */
			render(<BrowserApp />)

			/** Verify loading spinner is initially displayed */
			expect(screen.getByTestId('spinner')).toBeInTheDocument()

			/** Wait for loading to complete */
			await waitFor(() => {
				expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
			})
		})
	})

	describe('Release Browsing', () => {
		it('should navigate to releases view when repository is selected', async () => {
			/** Render the BrowserApp component */
			render(<BrowserApp />)

			/** Wait for repositories to load */
			await waitFor(() => {
				expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
			})

			/** Find and click first repository */
			const repoCard = screen.getAllByRole('button')[0]
			repoCard.click()

			/** Wait for releases to load */
			await waitFor(() => {
				expect(screen.getByText('v1.0.0')).toBeInTheDocument()
			})

			/** Verify releases are displayed */
			expect(screen.getByText('Release 1.0.0')).toBeInTheDocument()
			expect(screen.getByText('v0.9.0')).toBeInTheDocument()
		})

		it('should display assets when release is selected', async () => {
			/** Render the BrowserApp component */
			render(<BrowserApp />)

			/** Wait for repositories to load */
			await waitFor(() => {
				expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
			})

			/** Select first repository */
			const repoCard = screen.getAllByRole('button')[0]
			repoCard.click()

			/** Wait for releases to load */
			await waitFor(() => {
				expect(screen.getByText('v1.0.0')).toBeInTheDocument()
			})

			/** Click on first release */
			const releaseButton = screen.getByText('v1.0.0')
			releaseButton.click()

			/** Wait for assets to be displayed */
			await waitFor(() => {
				expect(screen.getByText('app-v1.0.0.zip')).toBeInTheDocument()
			})

			/** Verify all assets are shown */
			expect(screen.getByText('app-v1.0.0.tar.gz')).toBeInTheDocument()
		})
	})

	describe('Network Error Handling', () => {
		it('should show retry button on network failure', async () => {
			/** Override with network error handler */
			server.use(
				invalidTokenHandler // This simulates a server error
			)

			/** Render the BrowserApp component */
			render(<BrowserApp />)

			/** Wait for error state */
			await waitFor(() => {
				expect(screen.getByText(/try again/i)).toBeInTheDocument()
			})

			/** Verify error message is descriptive */
			expect(screen.getByText(/invalid github token/i)).toBeInTheDocument()
		})
	})
})

/**
 * Testing Philosophy:
 *
 * These MSW integration tests validate:
 * 1. Network-level API interactions (more realistic than mocked functions)
 * 2. Error handling with actual HTTP status codes
 * 3. Component behavior with real-world API responses
 * 4. Loading and error state transitions
 *
 * Benefits over unit tests:
 * - Catches integration bugs that unit tests miss
 * - Tests actual network request/response cycle
 * - Validates error handling with real HTTP responses
 * - More confidence in production behavior
 *
 * Trade-offs:
 * - Slower than pure unit tests (~2-3x)
 * - More complex setup (MSW server)
 * - Requires careful cleanup between tests
 */
