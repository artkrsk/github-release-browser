<?php

namespace Arts\GH\ReleaseBrowser\Core\Interfaces;

/**
 * Platform API interface
 *
 * Defines the contract for Git platform integrations (GitHub, GitLab, Bitbucket, etc.)
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
	 * @param string $repo Repository name (owner/repo format).
	 * @param int    $page Page number for pagination.
	 * @return array<int, array<string, mixed>> Release data.
	 */
	public function get_releases( string $repo, int $page = 1 ): array;

	/**
	 * Get release by tag
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @param string $tag Release tag.
	 * @return array<string, mixed> Release data.
	 */
	public function get_release_by_tag( string $repo, string $tag ): array;

	/**
	 * Get user repositories
	 *
	 * @return array<string, mixed> Repository data or error information.
	 */
	public function get_user_repos(): array;

	/**
	 * Get API rate limit information
	 *
	 * @return array{remaining: int, limit: int} Rate limit data.
	 */
	public function get_rate_limit(): array;

	/**
	 * Get download URL for asset (follows redirects)
	 *
	 * @param string $repo     Repository name (owner/repo format).
	 * @param int    $asset_id Asset ID.
	 * @return string Download URL or empty string on error.
	 */
	public function get_download_url( string $repo, int $asset_id ): string;

	/**
	 * Test connection with platform API
	 *
	 * @param string $token Optional token to test (defaults to configured token).
	 * @return bool True if connection is successful.
	 */
	public function test_connection( string $token = '' ): bool;

	/**
	 * Clear cache entries
	 *
	 * @param string $pattern Specific cache key to clear, or empty for common keys.
	 */
	public function clear_cache( string $pattern = '' ): void;

	/**
	 * Get repository branches
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @return array<int, BranchData> Branch data.
	 */
	public function get_branches( string $repo ): array;

	/**
	 * Get directory contents at path
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @param string $path Directory path (empty for root).
	 * @param string $ref  Branch or commit reference.
	 * @return array<int, ContentItemData> Directory contents.
	 */
	public function get_contents( string $repo, string $path = '', string $ref = 'main' ): array;

	/**
	 * Get archive download URL
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @param string $ref  Branch or commit reference.
	 * @return string Archive download URL.
	 */
	public function get_archive_url( string $repo, string $ref ): string;

	/**
	 * Get repository info
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @return RepoInfoData Repository metadata including default branch.
	 */
	public function get_repo_info( string $repo ): array;

	/**
	 * Clear releases cache for a specific repository
	 *
	 * @param string $repo Repository name (owner/repo format).
	 */
	public function clear_releases_cache( string $repo ): void;

	/**
	 * Clear branches cache for a specific repository
	 *
	 * @param string $repo Repository name (owner/repo format).
	 */
	public function clear_branches_cache( string $repo ): void;
}
