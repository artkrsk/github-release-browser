/**
 * MSW Response Factories
 *
 * Factory functions for creating mock API responses in WordPress AJAX format.
 * These factories wrap GitHub API data in the WordPress success/error response structure.
 *
 * **Purpose**: WordPress AJAX Response Wrappers
 * These factories are specifically for MSW (Mock Service Worker) handlers.
 * They wrap GitHub API data in WordPress AJAX response format: { success: boolean, data: any }
 *
 * **When to Use**:
 * - In MSW handlers (tests/msw/handlers.ts)
 * - When mocking WordPress AJAX endpoint responses
 * - For simulating different error scenarios (401, 403, 404, 500)
 *
 * **Do NOT Use For**:
 * - Creating domain entities (use tests/test-utils.tsx factories instead)
 * - Integration test state mocks (use tests/ts/integration/__helpers__/ instead)
 *
 * **See Also**:
 * - Domain entity factories: tests/test-utils.tsx
 * - MSW handlers: tests/msw/handlers.ts
 * - Integration helpers: tests/ts/integration/__helpers__/browser-app-factories.ts
 */

/** WordPress AJAX Success Response */
interface WordPressAjaxSuccess<T = any> {
	success: true
	data: T
}

/** WordPress AJAX Error Response */
interface WordPressAjaxError {
	success: false
	data: {
		message: string
		documentation_url?: string
		status?: number
	}
}

/** WordPress AJAX Response type */
type WordPressAjaxResponse<T = any> = WordPressAjaxSuccess<T> | WordPressAjaxError

/**
 * Create a successful GitHub API response in WordPress AJAX format
 *
 * @param data - The GitHub API data to wrap
 * @param rateLimit - Optional rate limit information
 * @returns WordPress AJAX success response
 */
export function createGitHubApiResponse<T>(
	data: T,
	rateLimit?: {
		limit: number
		remaining: number
		reset: number
	}
): WordPressAjaxSuccess<T> {
	return {
		success: true,
		data
	}
}

/**
 * Create a rate limit exceeded response (403)
 *
 * Simulates GitHub API rate limit error
 *
 * @param remaining - Number of requests remaining (typically 0)
 * @param resetTime - Unix timestamp when rate limit resets
 * @returns WordPress AJAX error response
 */
export function createRateLimitResponse(
	remaining: number = 0,
	resetTime: number = Math.floor(Date.now() / 1000) + 3600
): WordPressAjaxError {
	return {
		success: false,
		data: {
			message: 'API rate limit exceeded',
			documentation_url: 'https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting',
			status: 403
		}
	}
}

/**
 * Create an invalid token response (401)
 *
 * Simulates GitHub API authentication error
 *
 * @returns WordPress AJAX error response
 */
export function createInvalidTokenResponse(): WordPressAjaxError {
	return {
		success: false,
		data: {
			message: 'Bad credentials',
			documentation_url: 'https://docs.github.com/rest',
			status: 401
		}
	}
}

/**
 * Create a network error response (500)
 *
 * Simulates network or server error
 *
 * @param message - Custom error message
 * @returns WordPress AJAX error response
 */
export function createNetworkErrorResponse(
	message: string = 'Network error occurred'
): WordPressAjaxError {
	return {
		success: false,
		data: {
			message,
			status: 500
		}
	}
}

/**
 * Create a not found response (404)
 *
 * Simulates GitHub API resource not found error
 *
 * @param resource - The resource that was not found
 * @returns WordPress AJAX error response
 */
export function createNotFoundResponse(resource: string = 'Repository'): WordPressAjaxError {
	return {
		success: false,
		data: {
			message: `${resource} not found`,
			documentation_url: 'https://docs.github.com/rest',
			status: 404
		}
	}
}

/**
 * Create a validation error response (400)
 *
 * Simulates invalid request parameters
 *
 * @param message - Validation error message
 * @returns WordPress AJAX error response
 */
export function createValidationErrorResponse(
	message: string = 'Invalid request parameters'
): WordPressAjaxError {
	return {
		success: false,
		data: {
			message,
			status: 400
		}
	}
}

/**
 * Create an empty results response
 *
 * Simulates successful API call that returns no data
 *
 * @returns WordPress AJAX success response with empty array
 */
export function createEmptyResultsResponse(): WordPressAjaxSuccess<[]> {
	return {
		success: true,
		data: []
	}
}

/**
 * Create a paginated response
 *
 * Simulates GitHub API pagination headers
 *
 * @param data - The page data
 * @param page - Current page number
 * @param totalPages - Total number of pages
 * @returns WordPress AJAX success response with pagination info
 */
export function createPaginatedResponse<T>(
	data: T[],
	page: number = 1,
	totalPages: number = 1
): WordPressAjaxSuccess<{
	items: T[]
	pagination: {
		current_page: number
		total_pages: number
		has_next: boolean
		has_prev: boolean
	}
}> {
	return {
		success: true,
		data: {
			items: data,
			pagination: {
				current_page: page,
				total_pages: totalPages,
				has_next: page < totalPages,
				has_prev: page > 1
			}
		}
	}
}
