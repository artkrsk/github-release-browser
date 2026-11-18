<?php

namespace Arts\GH\ReleaseBrowser\Core\Interfaces;

/**
 * Platform API interface
 *
 * Defines the contract for Git platform integrations (GitHub, GitLab, Bitbucket, etc.)
 *
 * Every method that talks to the platform returns its value or a `\WP_Error`; an empty array is a
 * genuinely empty result, never a failure. The error carries `['status' => int]` as its data when an
 * HTTP response caused it. Codes:
 *
 * - `token_missing`       — the request needs a token and none is configured.
 * - `token_invalid`       — the token was rejected (401).
 * - `rate_limit_exceeded` — 429, or 403 with the rate-limit headers.
 * - `forbidden`           — any other 403: the token lacks access.
 * - `not_found`           — 404; also what the platform answers for a private repo the token cannot see.
 * - `api_error`           — any other non-success status.
 * - `invalid_response`    — a success status with a body or redirect this client cannot use.
 * - `http_request_failed` — the transport failed before any response (WordPress's own code).
 * - `invalid_path`, `not_a_directory` — get_contents() input and target.
 * - `invalid_asset`, `download_failed`, `file_too_large` — download_asset_to_file().
 *
 * @since 1.0.2
 * @since 2.0.0 Failures are `\WP_Error`s instead of empty values or defaults; clear_cache() removed.
 *
 * @phpstan-type RateLimitData array{remaining: int, limit: int}
 * @phpstan-type BranchData array{name: string, commit: array{sha: string, url: string}, protected: bool}
 * @phpstan-type ContentItemData array{name: string, path: string, sha: string, size: int, type: string, download_url: string|null, html_url: string}
 * @phpstan-type RepoInfoData array{default_branch: string, full_name: string, private: bool}
 */
interface IPlatformAPI {
	/**
	 * Get releases for repository
	 *
	 * @since 1.0.0
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @param int    $page Page number for pagination.
	 * @return array<int, array<string, mixed>>|\WP_Error Release data.
	 */
	public function get_releases( string $repo, int $page = 1 ): array|\WP_Error;

	/**
	 * Get release by tag
	 *
	 * @since 1.0.0
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @param string $tag Release tag.
	 * @return array<string, mixed>|\WP_Error Release data; `not_found` when the tag has no release.
	 */
	public function get_release_by_tag( string $repo, string $tag ): array|\WP_Error;

	/**
	 * Get user repositories
	 *
	 * @since 1.0.0
	 *
	 * @return array<int, array<string, mixed>>|\WP_Error Repository data.
	 */
	public function get_user_repos(): array|\WP_Error;

	/**
	 * Get API rate limit information
	 *
	 * An explicit token is checked uncached, so a token being validated before it is saved
	 * reports its own limit rather than the configured token's (or the anonymous one).
	 *
	 * @since 1.0.0
	 * @since 1.1.2 Accepts `$token`.
	 *
	 * @param string $token Optional token to check (defaults to configured token).
	 * @return RateLimitData|\WP_Error Rate limit data.
	 */
	public function get_rate_limit( string $token = '' ): array|\WP_Error;

	/**
	 * Get download URL for asset (follows redirects)
	 *
	 * @since 1.0.0
	 *
	 * @param string $repo     Repository name (owner/repo format).
	 * @param int    $asset_id Asset ID.
	 * @return string|\WP_Error Short-lived signed download URL.
	 */
	public function get_download_url( string $repo, int $asset_id ): string|\WP_Error;

	/**
	 * Download a release asset to a local file.
	 *
	 * Resolves the asset's short-lived signed URL and streams the body to disk. Works for private
	 * repositories: the signed URL carries its own credentials, so the configured token is never
	 * re-sent to the storage host (doing so makes the storage provider reject the request).
	 *
	 * The caller owns the returned file and must delete it. On failure no file is left behind.
	 *
	 * @since 1.1.0
	 *
	 * @param string $repo        Repository in `owner/name` form.
	 * @param int    $asset_id    Release asset id. Ids <= 0 are synthesized source archives and are refused.
	 * @param int    $timeout     Seconds to allow for the download.
	 * @param int    $max_bytes   Refuse assets larger than this, 0 for no limit.
	 * @return string|\WP_Error Absolute path to the downloaded file.
	 */
	public function download_asset_to_file( string $repo, int $asset_id, int $timeout = 60, int $max_bytes = 0 ): string|\WP_Error;

	/**
	 * Test connection with platform API
	 *
	 * @since 1.0.0
	 *
	 * @param string $token Optional token to test (defaults to configured token).
	 * @return true|\WP_Error
	 */
	public function test_connection( string $token = '' ): bool|\WP_Error;

	/**
	 * Clear the cached account data: the user's repositories and the configured token's rate limit.
	 *
	 * @since 2.0.0
	 */
	public function clear_account_cache(): void;

	/**
	 * Get repository branches
	 *
	 * @since 1.0.2
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @return array<int, BranchData>|\WP_Error Branch data.
	 */
	public function get_branches( string $repo ): array|\WP_Error;

	/**
	 * Get directory contents at path
	 *
	 * @since 1.0.2
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @param string $path Directory path (empty for root).
	 * @param string $ref  Branch or commit reference.
	 * @return array<int, ContentItemData>|\WP_Error Directory contents.
	 */
	public function get_contents( string $repo, string $path = '', string $ref = 'main' ): array|\WP_Error;

	/**
	 * Get archive download URL
	 *
	 * @since 1.0.2
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @param string $ref  Branch or commit reference.
	 * @return string|\WP_Error Short-lived signed archive URL.
	 */
	public function get_archive_url( string $repo, string $ref ): string|\WP_Error;

	/**
	 * Get repository info
	 *
	 * @since 1.0.2
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @return RepoInfoData|\WP_Error Repository metadata including default branch.
	 */
	public function get_repo_info( string $repo ): array|\WP_Error;

	/**
	 * Clear the cached releases list for a repository, so "latest" sees a new release
	 *
	 * @since 1.0.2
	 *
	 * @param string $repo Repository name (owner/repo format).
	 */
	public function clear_releases_cache( string $repo ): void;

	/**
	 * Clear the cached release for one tag
	 *
	 * @since 2.0.0
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @param string $tag  Release tag, exactly as passed to get_release_by_tag().
	 */
	public function clear_release_cache( string $repo, string $tag ): void;

	/**
	 * Clear branches cache for a specific repository
	 *
	 * @since 1.0.2
	 *
	 * @param string $repo Repository name (owner/repo format).
	 */
	public function clear_branches_cache( string $repo ): void;
}
