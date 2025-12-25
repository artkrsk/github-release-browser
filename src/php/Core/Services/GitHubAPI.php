<?php

namespace Arts\GH\ReleaseBrowser\Core\Services;

use Arts\GH\ReleaseBrowser\Core\Interfaces\IHttpClient;
use Arts\GH\ReleaseBrowser\Core\Interfaces\ICache;
use Arts\GH\ReleaseBrowser\Core\Interfaces\IConfig;
use Arts\GH\ReleaseBrowser\Core\Interfaces\IPlatformAPI;

/**
 * GitHub API service
 *
 * Handles GitHub API requests with automatic caching (5 min for releases, 1 hour for repos).
 *
 * @phpstan-type RateLimitData array{remaining: int, limit: int}
 * @phpstan-type ReleaseData array<string, mixed>
 * @phpstan-type RepoData array<string, mixed>
 * @phpstan-type ErrorData array{error: true, error_code: string, status_code: int, message: string}
 */
class GitHubAPI implements IPlatformAPI {
	private IHttpClient $http_client;
	private ICache $cache;
	private IConfig $config;

	/**
	 * Constructor
	 *
	 * @param IHttpClient $http_client HTTP client instance.
	 * @param ICache      $cache       Cache instance.
	 * @param IConfig     $config      Config instance.
	 */
	public function __construct( IHttpClient $http_client, ICache $cache, IConfig $config ) {
		$this->http_client = $http_client;
		$this->cache       = $cache;
		$this->config      = $config;
	}

	/**
	 * Get releases for repository
	 *
	 * @param string $repo Repository name.
	 * @param int    $page Page number.
	 * @return array<int, array<string, mixed>> Release data.
	 */
	public function get_releases( string $repo, int $page = 1 ): array {
		$cache_key = "releases_{$repo}_{$page}";
		$cached    = $this->cache->get( $cache_key );

		if ( $cached !== false && is_array( $cached ) ) {
			/** @var array<int, array<string, mixed>> */
			return $cached;
		}

		$token   = $this->get_token();
		$headers = array();

		if ( $token !== '' ) {
			$headers['Authorization'] = "Bearer {$token}";
		}

		$url      = "https://api.github.com/repos/{$repo}/releases?page={$page}&per_page=30";
		$response = $this->http_client->get( $url, $headers );

		if ( $response->status_code !== 200 ) {
			return array();
		}

		$decoded = json_decode( $response->body, true );
		if ( ! is_array( $decoded ) ) {
			return array();
		}

		/** @var array<int, array<string, mixed>> $releases */
		$releases = $decoded;

		// Add source archives to releases with no uploaded assets
		$releases = array_map( array( $this, 'add_source_archives' ), $releases );

		$this->cache->set( $cache_key, $releases, 300 ); // 5 minutes - transients handle serialization

		return $releases;
	}

	/**
	 * Get GitHub API rate limit
	 *
	 * @return array{remaining: int, limit: int} Rate limit data.
	 */
	public function get_rate_limit(): array {
		$cache_key = 'rate_limit';
		$cached    = $this->cache->get( $cache_key );

		if ( $cached !== false && is_array( $cached ) ) {
			/** @var array{remaining: int, limit: int} */
			return $cached;
		}

		$token   = $this->get_token();
		$headers = array();

		if ( $token !== '' ) {
			$headers['Authorization'] = "Bearer {$token}";
		}

		$response = $this->http_client->get( 'https://api.github.com/rate_limit', $headers );

		if ( $response->status_code !== 200 ) {
			return array(
				'remaining' => 0,
				'limit'     => 5000,
			);
		}

		$data = json_decode( $response->body, true );
		if ( ! is_array( $data ) || ! isset( $data['resources'] ) || ! is_array( $data['resources'] ) || ! isset( $data['resources']['core'] ) || ! is_array( $data['resources']['core'] ) ) {
			return array(
				'remaining' => 0,
				'limit'     => 5000,
			);
		}

		/** @var array{remaining: int, limit: int} $rate_limit */
		$rate_limit = array(
			'remaining' => isset( $data['resources']['core']['remaining'] ) && is_int( $data['resources']['core']['remaining'] ) ? $data['resources']['core']['remaining'] : 0,
			'limit'     => isset( $data['resources']['core']['limit'] ) && is_int( $data['resources']['core']['limit'] ) ? $data['resources']['core']['limit'] : 5000,
		);

		$this->cache->set( $cache_key, $rate_limit, 60 ); // 1 minute - transients handle serialization

		return $rate_limit;
	}

	/**
	 * Get user repositories
	 *
	 * @return array<string, mixed> Repository data or error information.
	 */
	public function get_user_repos(): array {
		$cache_key = 'user_repos';
		$cached    = $this->cache->get( $cache_key );

		if ( $cached !== false && is_array( $cached ) ) {
			/** @var array<string, mixed> */
			return $cached;
		}

		$token   = $this->get_token();
		$headers = array();

		if ( $token !== '' ) {
			$headers['Authorization'] = "Bearer {$token}";
		}

		$url      = 'https://api.github.com/user/repos?per_page=100&sort=updated';
		$response = $this->http_client->get( $url, $headers );

		if ( $response->status_code !== 200 ) {
			// Return structured error information instead of empty array
			return array(
				'error'       => true,
				'error_code'  => $this->get_error_code_from_status( $response->status_code, $token ),
				'status_code' => $response->status_code,
				'message'     => $this->get_error_message_from_status( $response->status_code, $token ),
			);
		}

		$decoded = json_decode( $response->body, true );
		if ( ! is_array( $decoded ) ) {
			return array();
		}

		/** @var array<string, mixed> $repos */
		$repos = $decoded;
		$this->cache->set( $cache_key, $repos, 3600 ); // 1 hour - transients handle serialization

		return $repos;
	}

	/**
	 * Get release by tag
	 *
	 * @param string $repo Repository name.
	 * @param string $tag Release tag.
	 * @return array<string, mixed> Release data.
	 */
	public function get_release_by_tag( string $repo, string $tag ): array {
		$cache_key = "release_{$repo}_{$tag}";
		$cached    = $this->cache->get( $cache_key );

		if ( $cached !== false && is_array( $cached ) ) {
			/** @var array<string, mixed> */
			return $cached;
		}

		$token   = $this->get_token();
		$headers = array();

		if ( $token !== '' ) {
			$headers['Authorization'] = "Bearer {$token}";
		}

		$url      = "https://api.github.com/repos/{$repo}/releases/tags/{$tag}";
		$response = $this->http_client->get( $url, $headers );

		if ( $response->status_code !== 200 ) {
			return array();
		}

		$decoded = json_decode( $response->body, true );
		if ( ! is_array( $decoded ) ) {
			return array();
		}

		/** @var array<string, mixed> $release */
		$release = $decoded;

		// Add source archives if no uploaded assets
		$release = $this->add_source_archives( $release );

		$this->cache->set( $cache_key, $release, 300 ); // 5 minutes - transients handle serialization

		return $release;
	}

	/**
	 * Get download URL for asset (follows redirects to S3)
	 *
	 * @param string $repo     Repository name.
	 * @param int    $asset_id Asset ID.
	 * @return string Download URL or empty string on error.
	 */
	public function get_download_url( string $repo, int $asset_id ): string {
		$token   = $this->get_token();
		$headers = array( 'Accept' => 'application/octet-stream' );

		if ( $token !== '' ) {
			$headers['Authorization'] = "Bearer {$token}";
		}

		$url      = "https://api.github.com/repos/{$repo}/releases/assets/{$asset_id}";
		$response = $this->http_client->get( $url, $headers, array( 'redirection' => 0 ) );

		// GitHub returns 302 redirect to S3
		if ( $response->status_code === 302 && isset( $response->headers['location'] ) && is_string( $response->headers['location'] ) ) {
			return $response->headers['location'];
		}

		return '';
	}

	/**
	 * Test connection with GitHub API
	 *
	 * @param string $token Optional token to test (defaults to configured token).
	 * @return bool True if connection is successful.
	 */
	public function test_connection( string $token = '' ): bool {
		$test_token = $token !== '' ? $token : $this->get_token();
		$headers    = array();

		if ( $test_token !== '' ) {
			$headers['Authorization'] = "Bearer {$test_token}";
		}

		$response = $this->http_client->get( 'https://api.github.com/user', $headers );

		return $response->status_code === 200;
	}

	/**
	 * Clear cache entries
	 *
	 * @param string $pattern Specific cache key to clear, or empty to clear common keys (user_repos, rate_limit).
	 */
	public function clear_cache( string $pattern = '' ): void {
		if ( empty( $pattern ) ) {
			// Clear common cache keys
			$this->cache->delete( 'user_repos' );
			$this->cache->delete( 'rate_limit' );
		} else {
			$this->cache->delete( $pattern );
		}
	}

	/**
	 * Clear releases cache for a specific repository
	 *
	 * @param string $repo Repository name (owner/repo format).
	 */
	public function clear_releases_cache( string $repo ): void {
		// Clear paginated releases (we only cache page 1)
		$this->cache->delete( "releases_{$repo}_1" );

		// Note: Individual release by tag caches remain until TTL
		// They're cleared naturally or can be cleared via clear_cache($pattern)
	}

	/**
	 * Clear branches cache for a specific repository
	 *
	 * @param string $repo Repository name (owner/repo format).
	 */
	public function clear_branches_cache( string $repo ): void {
		$this->cache->delete( "branches_{$repo}" );
		$this->cache->delete( "repo_info_{$repo}" );
	}

	/**
	 * Get repository branches
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @return array<int, array{name: string, commit: array{sha: string, url: string}, protected: bool}> Branch data.
	 */
	public function get_branches( string $repo ): array {
		$cache_key = "branches_{$repo}";
		$cached    = $this->cache->get( $cache_key );

		if ( $cached !== false && is_array( $cached ) ) {
			/** @var array<int, array{name: string, commit: array{sha: string, url: string}, protected: bool}> */
			return $cached;
		}

		$token   = $this->get_token();
		$headers = array();

		if ( $token !== '' ) {
			$headers['Authorization'] = "Bearer {$token}";
		}

		$url      = "https://api.github.com/repos/{$repo}/branches?per_page=100";
		$response = $this->http_client->get( $url, $headers );

		if ( $response->status_code !== 200 ) {
			return array();
		}

		$decoded = json_decode( $response->body, true );
		if ( ! is_array( $decoded ) ) {
			return array();
		}

		/** @var array<int, array{name: string, commit: array{sha: string, url: string}, protected: bool}> $branches */
		$branches = $decoded;

		$this->cache->set( $cache_key, $branches, 300 ); // 5 minutes

		return $branches;
	}

	/**
	 * Get directory contents at path
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @param string $path Directory path (empty for root).
	 * @param string $ref  Branch or commit reference.
	 * @return array<int, array{name: string, path: string, sha: string, size: int, type: string, download_url: string|null, html_url: string}> Directory contents.
	 */
	public function get_contents( string $repo, string $path = '', string $ref = 'main' ): array {
		// Use SHA-256 for cache key generation (avoids Snyk MD5 warnings)
		$path_hash = hash( 'sha256', $path );
		$cache_key = "contents_{$repo}_{$ref}_{$path_hash}";
		$cached    = $this->cache->get( $cache_key );

		if ( $cached !== false && is_array( $cached ) ) {
			/** @var array<int, array{name: string, path: string, sha: string, size: int, type: string, download_url: string|null, html_url: string}> */
			return $cached;
		}

		$token   = $this->get_token();
		$headers = array();

		if ( $token !== '' ) {
			$headers['Authorization'] = "Bearer {$token}";
		}

		// Validate path to prevent directory traversal attacks
		if ( ! empty( $path ) && function_exists( 'validate_file' ) && validate_file( $path ) > 0 ) {
			// Path contains .. or other invalid sequences
			return array();
		}

		// Encode path segments individually to preserve slashes
		$path_segments    = explode( '/', $path );
		$encoded_segments = array_map( 'rawurlencode', $path_segments );
		$encoded_path     = implode( '/', $encoded_segments );
		$url              = "https://api.github.com/repos/{$repo}/contents/{$encoded_path}?ref={$ref}";
		$response         = $this->http_client->get( $url, $headers );

		if ( $response->status_code !== 200 ) {
			return array();
		}

		$decoded = json_decode( $response->body, true );
		if ( ! is_array( $decoded ) ) {
			return array();
		}

		// GitHub returns object for single file, array for directory
		// We only handle directory listings
		if ( isset( $decoded['type'] ) ) {
			// Single file response, return empty (we only support directories)
			return array();
		}

		/** @var array<int, array{name: string, path: string, sha: string, size: int, type: string, download_url: string|null, html_url: string}> $contents */
		$contents = $decoded;

		$this->cache->set( $cache_key, $contents, 300 ); // 5 minutes

		return $contents;
	}

	/**
	 * Get archive download URL
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @param string $ref  Branch or commit reference.
	 * @return string Archive download URL (follows redirect to actual download).
	 */
	public function get_archive_url( string $repo, string $ref ): string {
		$token   = $this->get_token();
		$headers = array();

		if ( $token !== '' ) {
			$headers['Authorization'] = "Bearer {$token}";
		}

		// Request zipball - GitHub will redirect to actual archive
		$url      = "https://api.github.com/repos/{$repo}/zipball/{$ref}";
		$response = $this->http_client->get( $url, $headers, array( 'redirection' => 0 ) );

		// GitHub returns 302 redirect to actual archive URL
		if ( $response->status_code === 302 && isset( $response->headers['location'] ) && is_string( $response->headers['location'] ) ) {
			return $response->headers['location'];
		}

		// Fallback to direct URL (will require auth)
		return $url;
	}

	/**
	 * Get repository info
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @return array{default_branch: string, full_name: string, private: bool} Repository metadata.
	 */
	public function get_repo_info( string $repo ): array {
		$cache_key = "repo_info_{$repo}";
		$cached    = $this->cache->get( $cache_key );

		if ( $cached !== false && is_array( $cached ) ) {
			/** @var array{default_branch: string, full_name: string, private: bool} */
			return $cached;
		}

		$token   = $this->get_token();
		$headers = array();

		if ( $token !== '' ) {
			$headers['Authorization'] = "Bearer {$token}";
		}

		$url      = "https://api.github.com/repos/{$repo}";
		$response = $this->http_client->get( $url, $headers );

		if ( $response->status_code !== 200 ) {
			// Return sensible defaults on error
			return array(
				'default_branch' => 'main',
				'full_name'      => $repo,
				'private'        => false,
			);
		}

		$decoded = json_decode( $response->body, true );
		if ( ! is_array( $decoded ) ) {
			return array(
				'default_branch' => 'main',
				'full_name'      => $repo,
				'private'        => false,
			);
		}

		/** @var array{default_branch: string, full_name: string, private: bool} $repo_info */
		$repo_info = array(
			'default_branch' => isset( $decoded['default_branch'] ) && is_string( $decoded['default_branch'] ) ? $decoded['default_branch'] : 'main',
			'full_name'      => isset( $decoded['full_name'] ) && is_string( $decoded['full_name'] ) ? $decoded['full_name'] : $repo,
			'private'        => isset( $decoded['private'] ) && is_bool( $decoded['private'] ) ? $decoded['private'] : false,
		);

		$this->cache->set( $cache_key, $repo_info, 3600 ); // 1 hour

		return $repo_info;
	}

	/**
	 * Get configured GitHub token
	 *
	 * @return string Token or empty string if not configured.
	 */
	private function get_token(): string {
		$token = $this->config->get( 'github_token' );
		return is_string( $token ) ? $token : '';
	}

	/**
	 * Get error code from HTTP status and token state
	 *
	 * @param int    $status_code HTTP status code.
	 * @param string $token GitHub token.
	 * @return string Error code.
	 */
	private function get_error_code_from_status( int $status_code, string $token ): string {
		if ( empty( $token ) ) {
			return 'token_missing';
		}

		if ( $status_code === 401 ) {
			return 'token_invalid';
		}

		if ( $status_code === 403 ) {
			return 'rate_limit_exceeded';
		}

		return 'api_error';
	}

	/**
	 * Get error message from HTTP status and token state
	 *
	 * @param int    $status_code HTTP status code.
	 * @param string $token GitHub token.
	 * @return string Error message.
	 */
	private function get_error_message_from_status( int $status_code, string $token ): string {
		if ( empty( $token ) ) {
			return 'GitHub token is not configured';
		}

		if ( $status_code === 401 ) {
			return 'Invalid GitHub token';
		}

		if ( $status_code === 403 ) {
			return 'GitHub API rate limit exceeded';
		}

		return "GitHub API error: {$status_code}";
	}

	/**
	 * Add source archives as synthetic assets if no uploaded assets exist
	 *
	 * @param array<string, mixed> $release Release data.
	 * @return array<string, mixed> Release with source archives.
	 */
	private function add_source_archives( array $release ): array {
		// Only add source archives if no uploaded assets
		if ( ! empty( $release['assets'] ) ) {
			return $release;
		}

		$synthetic_assets = array();

		// Add zipball (Source code zip)
		if ( isset( $release['zipball_url'] ) && is_string( $release['zipball_url'] ) ) {
			$synthetic_assets[] = array(
				'name'                 => 'Source code (zip)',
				'browser_download_url' => $release['zipball_url'],
				'content_type'         => 'application/zip',
				'size'                 => 0,
				'download_count'       => 0,
				'created_at'           => $release['created_at'] ?? '',
				'updated_at'           => $release['published_at'] ?? '',
				'id'                   => -1, // Unique negative ID for synthetic asset
				'synthetic'            => true,
			);
		}

		// Add tarball (Source code tar.gz)
		if ( isset( $release['tarball_url'] ) && is_string( $release['tarball_url'] ) ) {
			$synthetic_assets[] = array(
				'name'                 => 'Source code (tar.gz)',
				'browser_download_url' => $release['tarball_url'],
				'content_type'         => 'application/gzip',
				'size'                 => 0,
				'download_count'       => 0,
				'created_at'           => $release['created_at'] ?? '',
				'updated_at'           => $release['published_at'] ?? '',
				'id'                   => -2, // Unique negative ID for synthetic asset
				'synthetic'            => true,
			);
		}

		$release['assets'] = $synthetic_assets;

		return $release;
	}
}
