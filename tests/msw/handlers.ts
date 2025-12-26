import { http, HttpResponse } from 'msw'
import { createMockRepo, createMockRelease, createMockAsset } from '../test-utils'
import {
	createGitHubApiResponse,
	createRateLimitResponse,
	createInvalidTokenResponse,
	createNetworkErrorResponse
} from './factories'

/**
 * MSW Request Handlers for WordPress AJAX Endpoints
 *
 * These handlers intercept POST requests to /wp-admin/admin-ajax.php
 * and return mocked GitHub API responses in WordPress AJAX format.
 */

export const handlers = [
	/**
	 * Handler: Get User Repositories
	 * Action: github_release_browser_get_user_repos
	 */
	http.post('*/wp-admin/admin-ajax.php', async ({ request }) => {
		const formData = await request.formData()
		const action = formData.get('action')

		/** Match any prefix + action suffix pattern */
		if (action && action.toString().endsWith('_get_user_repos')) {
			/** Default: Return list of repositories in WordPress AJAX format */
			const repos = [
				createMockRepo({ name: 'test-repo-1', full_name: 'owner/test-repo-1' }),
				createMockRepo({ name: 'test-repo-2', full_name: 'owner/test-repo-2' }),
				createMockRepo({ name: 'react', full_name: 'facebook/react', stargazers_count: 200000 })
			]

			/** Note: GitHubService expects data.repos, not data directly */
			return HttpResponse.json({
				success: true,
				data: { repos }
			})
		}

		/** Get Releases */
		if (action && action.toString().endsWith('_get_releases')) {
			const repo = formData.get('repo') as string

			if (!repo) {
				return HttpResponse.json({
					success: false,
					data: { message: 'Repository parameter is required' }
				}, { status: 400 })
			}

			/** Default: Return list of releases in WordPress AJAX format */
			const releases = [
				createMockRelease({
					id: 1,
					tag_name: 'v1.0.0',
					name: 'Release 1.0.0',
					assets: [
						createMockAsset({ name: 'app-v1.0.0.zip' }),
						createMockAsset({ name: 'app-v1.0.0.tar.gz' })
					]
				}),
				createMockRelease({
					id: 2,
					tag_name: 'v0.9.0',
					name: 'Release 0.9.0',
					assets: [createMockAsset({ name: 'app-v0.9.0.zip' })]
				})
			]

			/** Note: GitHubService expects data.releases, not data directly */
			return HttpResponse.json({
				success: true,
				data: { releases }
			})
		}

		/** Get Branches */
		if (action && action.toString().endsWith('_get_branches')) {
			const repo = formData.get('repo') as string

			if (!repo) {
				return HttpResponse.json({
					success: false,
					data: { message: 'Repository parameter is required' }
				}, { status: 400 })
			}

			/** Default: Return list of branches */
			const branches = [
				{ name: 'main', commit: { sha: 'abc123', url: 'https://api.github.com/repos/owner/repo/commits/abc123' }, protected: true },
				{ name: 'develop', commit: { sha: 'def456', url: 'https://api.github.com/repos/owner/repo/commits/def456' }, protected: false },
				{ name: 'feature/test', commit: { sha: 'ghi789', url: 'https://api.github.com/repos/owner/repo/commits/ghi789' }, protected: false }
			]

			return HttpResponse.json(createGitHubApiResponse(branches))
		}

		/** Get Directory Contents */
		if (action && action.toString().endsWith('_get_contents')) {
			const repo = formData.get('repo') as string
			const path = formData.get('path') as string
			const ref = formData.get('ref') as string

			if (!repo) {
				return HttpResponse.json({
					success: false,
					data: { message: 'Repository parameter is required' }
				}, { status: 400 })
			}

			/** Default: Return directory contents */
			const contents = [
				{
					name: 'src',
					path: 'src',
					type: 'dir',
					sha: 'abc123',
					size: 0,
					url: 'https://api.github.com/repos/owner/repo/contents/src',
					html_url: 'https://github.com/owner/repo/tree/main/src',
					git_url: 'https://api.github.com/repos/owner/repo/git/trees/abc123',
					download_url: null
				},
				{
					name: 'README.md',
					path: 'README.md',
					type: 'file',
					sha: 'def456',
					size: 1024,
					url: 'https://api.github.com/repos/owner/repo/contents/README.md',
					html_url: 'https://github.com/owner/repo/blob/main/README.md',
					git_url: 'https://api.github.com/repos/owner/repo/git/blobs/def456',
					download_url: 'https://raw.githubusercontent.com/owner/repo/main/README.md'
				}
			]

			return HttpResponse.json(createGitHubApiResponse(contents))
		}

		/** Fallback for unhandled actions */
		return HttpResponse.json({
			success: false,
			data: { message: `Unknown action: ${action}` }
		}, { status: 400 })
	})
]

/**
 * Error Scenario Handlers
 *
 * These handlers can be used in tests to simulate error conditions:
 * - invalidTokenHandler: Simulates 401 Unauthorized (invalid GitHub token)
 * - rateLimitHandler: Simulates 403 Forbidden (rate limit exceeded)
 * - networkErrorHandler: Simulates network failure
 * - notFoundHandler: Simulates 404 Not Found (repository doesn't exist)
 */

/** Handler for invalid GitHub token (401) */
export const invalidTokenHandler = http.post('*/wp-admin/admin-ajax.php', async ({ request }) => {
	const formData = await request.formData()
	const action = formData.get('action')

	if (action?.toString().includes('github') || action?.toString().includes('release')) {
		return HttpResponse.json(createInvalidTokenResponse(), { status: 401 })
	}
})

/** Handler for rate limit exceeded (403) */
export const rateLimitHandler = http.post('*/wp-admin/admin-ajax.php', async ({ request }) => {
	const formData = await request.formData()
	const action = formData.get('action')

	if (action?.toString().includes('github') || action?.toString().includes('release')) {
		return HttpResponse.json(createRateLimitResponse(0), { status: 403 })
	}
})

/** Handler for network errors */
export const networkErrorHandler = http.post('*/wp-admin/admin-ajax.php', async ({ request }) => {
	const formData = await request.formData()
	const action = formData.get('action')

	if (action?.toString().includes('github') || action?.toString().includes('release')) {
		return HttpResponse.json(createNetworkErrorResponse(), { status: 500 })
	}
})

/** Handler for repository not found (404) */
export const notFoundHandler = http.post('*/wp-admin/admin-ajax.php', async ({ request }) => {
	const formData = await request.formData()
	const action = formData.get('action')

	if (action?.toString().endsWith('_get_releases') ||
		action?.toString().endsWith('_get_branches') ||
		action?.toString().endsWith('_get_contents')) {
		return HttpResponse.json({
			success: false,
			data: {
				message: 'Not Found',
				documentation_url: 'https://docs.github.com/rest'
			}
		}, { status: 404 })
	}
})

/** Handler for empty results (no releases, no repos, etc.) */
export const emptyResultsHandler = http.post('*/wp-admin/admin-ajax.php', async ({ request }) => {
	const formData = await request.formData()
	const action = formData.get('action')

	if (action?.toString().endsWith('_get_user_repos')) {
		return HttpResponse.json({
			success: true,
			data: { repos: [] }
		})
	}

	if (action?.toString().endsWith('_get_releases')) {
		return HttpResponse.json({
			success: true,
			data: { releases: [] }
		})
	}

	if (action?.toString().endsWith('_get_branches')) {
		return HttpResponse.json(createGitHubApiResponse([]))
	}

	if (action?.toString().endsWith('_get_contents')) {
		return HttpResponse.json(createGitHubApiResponse([]))
	}

	/** Fallback */
	return HttpResponse.json(createGitHubApiResponse([]))
})
