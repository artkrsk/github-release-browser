<?php

namespace Arts\GH\ReleaseBrowser\Core\Services;

use Arts\GH\ReleaseBrowser\Core\Interfaces\IHttpClient;
use Arts\GH\ReleaseBrowser\Core\Interfaces\ICache;
use Arts\GH\ReleaseBrowser\Core\Interfaces\IConfig;
use Arts\GH\ReleaseBrowser\Core\Interfaces\IPlatformAPI;
use Arts\GH\ReleaseBrowser\Core\Types\Response;

/**
 * GitHub API service
 *
 * Handles GitHub API requests with automatic caching (5 min for releases, 1 hour for repos).
 *
 * @phpstan-type RateLimitData array{remaining: int, limit: int}
 * @phpstan-type ReleaseData array<string, mixed>
 * @phpstan-type RepoData array<string, mixed>
 */
class GitHubAPI implements IPlatformAPI {
	private const API_URL = 'https://api.github.com';

	// Cache keys, behind the configured prefix. Formats unchanged since 1.0.2, so live entries stay valid.
	private const KEY_RELEASES   = 'releases_%s_1'; // First page only; see get_releases().
	private const KEY_RELEASE    = 'release_%s_%s';
	private const KEY_BRANCHES   = 'branches_%s';
	private const KEY_REPO_INFO  = 'repo_info_%s';
	private const KEY_CONTENTS   = 'contents_%s_%s_%s';
	private const KEY_RATE_LIMIT = 'rate_limit';
	private const KEY_USER_REPOS = 'user_repos';

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
	 * @return array<int, array<string, mixed>>|\WP_Error Release data.
	 */
	public function get_releases( string $repo, int $page = 1 ): array|\WP_Error {
		// Only the first page is cached: it is all the UI and "latest" resolution read, and it keeps
		// clear_releases_cache() exact — later pages would otherwise linger until their TTL.
		$cache_key = $page === 1 ? sprintf( self::KEY_RELEASES, $repo ) : '';
		$cached    = $cache_key !== '' ? $this->cache->get( $cache_key ) : false;

		if ( $cached !== false && is_array( $cached ) ) {
			/** @var array<int, array<string, mixed>> */
			return $cached;
		}

		$decoded = $this->fetch_json( "/repos/{$repo}/releases?page={$page}&per_page=30" );

		if ( $decoded instanceof \WP_Error ) {
			return $decoded;
		}

		/** @var array<int, array<string, mixed>> $releases */
		$releases = $decoded;

		// Add source archives to releases with no uploaded assets
		$releases = array_map( array( $this, 'add_source_archives' ), $releases );

		if ( $cache_key !== '' ) {
			$this->cache->set( $cache_key, $releases, 5 * MINUTE_IN_SECONDS );
		}

		return $releases;
	}

	/**
	 * Get GitHub API rate limit
	 *
	 * @param string $token Optional token to check (defaults to configured token, the only cached case).
	 * @return array{remaining: int, limit: int}|\WP_Error Rate limit data.
	 */
	public function get_rate_limit( string $token = '' ): array|\WP_Error {
		$cache_key = self::KEY_RATE_LIMIT;
		$use_cache = $token === '';

		if ( $use_cache ) {
			$cached = $this->cache->get( $cache_key );

			if ( $cached !== false && is_array( $cached ) ) {
				/** @var array{remaining: int, limit: int} */
				return $cached;
			}
		}

		$data = $this->fetch_json( '/rate_limit', $use_cache ? null : $token );

		if ( $data instanceof \WP_Error ) {
			return $data;
		}

		$core = isset( $data['resources'] ) && is_array( $data['resources'] ) && isset( $data['resources']['core'] ) && is_array( $data['resources']['core'] ) ? $data['resources']['core'] : array();

		if ( ! isset( $core['remaining'], $core['limit'] ) || ! is_int( $core['remaining'] ) || ! is_int( $core['limit'] ) ) {
			return $this->invalid_response();
		}

		$rate_limit = array(
			'remaining' => $core['remaining'],
			'limit'     => $core['limit'],
		);

		if ( $use_cache ) {
			$this->cache->set( $cache_key, $rate_limit, MINUTE_IN_SECONDS );
		}

		return $rate_limit;
	}

	/**
	 * Get user repositories
	 *
	 * @return array<int, array<string, mixed>>|\WP_Error Repository data.
	 */
	public function get_user_repos(): array|\WP_Error {
		$cache_key = self::KEY_USER_REPOS;
		$cached    = $this->cache->get( $cache_key );

		if ( $cached !== false && is_array( $cached ) ) {
			/** @var array<int, array<string, mixed>> */
			return $cached;
		}

		$decoded = $this->fetch_json( '/user/repos?per_page=100&sort=updated' );

		if ( $decoded instanceof \WP_Error ) {
			return $decoded;
		}

		/** @var array<int, array<string, mixed>> $repos */
		$repos = $decoded;

		$this->cache->set( $cache_key, $repos, HOUR_IN_SECONDS );

		return $repos;
	}

	/**
	 * Get release by tag
	 *
	 * @param string $repo Repository name.
	 * @param string $tag Release tag.
	 * @return array<string, mixed>|\WP_Error Release data.
	 */
	public function get_release_by_tag( string $repo, string $tag ): array|\WP_Error {
		$cache_key = sprintf( self::KEY_RELEASE, $repo, $tag );
		$cached    = $this->cache->get( $cache_key );

		if ( $cached !== false && is_array( $cached ) ) {
			/** @var array<string, mixed> */
			return $cached;
		}

		$decoded = $this->fetch_json( "/repos/{$repo}/releases/tags/{$tag}" );

		if ( $decoded instanceof \WP_Error ) {
			return $decoded;
		}

		/** @var array<string, mixed> $release */
		$release = $decoded;

		// Add source archives if no uploaded assets
		$release = $this->add_source_archives( $release );

		$this->cache->set( $cache_key, $release, 5 * MINUTE_IN_SECONDS );

		return $release;
	}

	/**
	 * Get download URL for asset (follows redirects to S3)
	 *
	 * @param string $repo     Repository name.
	 * @param int    $asset_id Asset ID.
	 * @return string|\WP_Error Signed download URL.
	 */
	public function get_download_url( string $repo, int $asset_id ): string|\WP_Error {
		return $this->fetch_redirect( "/repos/{$repo}/releases/assets/{$asset_id}", array( 'Accept' => 'application/octet-stream' ) );
	}

	/**
	 * Download a release asset to a local file. See IPlatformAPI::download_asset_to_file().
	 *
	 * Two hops by necessity: the API endpoint answers with a 302 to a signed storage URL, and that
	 * second request must NOT carry the Authorization header — the signed URL already authenticates
	 * itself, and storage rejects a request presenting both. Hence get_download_url() first, then a
	 * bare streamed GET.
	 *
	 * @param string $repo      Repository in `owner/name` form.
	 * @param int    $asset_id  Release asset id.
	 * @param int    $timeout   Seconds to allow for the download.
	 * @param int    $max_bytes Refuse assets larger than this, 0 for no limit.
	 * @return string|\WP_Error Absolute path to the downloaded file.
	 */
	public function download_asset_to_file( string $repo, int $asset_id, int $timeout = 60, int $max_bytes = 0 ): string|\WP_Error {
		// Synthesized source archives carry negative ids and 404 on the asset endpoint.
		if ( $asset_id <= 0 ) {
			return new \WP_Error( 'invalid_asset', 'Source code archives have no release asset to download' );
		}

		$url = $this->get_download_url( $repo, $asset_id );

		if ( $url instanceof \WP_Error ) {
			return $url;
		}

		// wp_tempnam() lives in wp-admin/includes/file.php, which is NOT loaded on REST, cron or
		// webhook requests — exactly where a release sync runs.
		if ( ! function_exists( 'wp_tempnam' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		$tmp = wp_tempnam( 'gh-asset-' . $asset_id );

		if ( ! is_string( $tmp ) || '' === $tmp ) {
			return new \WP_Error( 'download_failed', 'Could not create a temporary file for the asset' );
		}

		// No headers: the signed URL is self-authenticating (see the docblock).
		$options = array(
			'timeout'  => $timeout,
			'stream'   => true,
			'filename' => $tmp,
		);

		// The transport silently truncates the body at the limit and still reports 200, so the limit
		// is one byte past the cap: a file that reaches it proves the asset is too large.
		if ( $max_bytes > 0 ) {
			$options['max_bytes'] = $max_bytes + 1;
		}

		$response = $this->http_client->get( $url, array(), $options );

		if ( $response instanceof \WP_Error ) {
			wp_delete_file( $tmp );

			return $response;
		}

		// A non-200 body is streamed to the file too — the transport writes whatever arrives without
		// inspecting the status — so an error page would otherwise be handed back as if it were a ZIP.
		if ( 200 !== $response->status_code ) {
			wp_delete_file( $tmp );

			return new \WP_Error( 'download_failed', "Asset storage answered HTTP {$response->status_code}", array( 'status' => $response->status_code ) );
		}

		$size = filesize( $tmp );

		if ( $max_bytes > 0 && is_int( $size ) && $size > $max_bytes ) {
			wp_delete_file( $tmp );

			return new \WP_Error( 'file_too_large', "Asset is larger than {$max_bytes} bytes" );
		}

		// wp_tempnam() creates the file up front, so "it exists" proves nothing; emptiness does.
		if ( ! is_int( $size ) || $size <= 0 ) {
			wp_delete_file( $tmp );

			return new \WP_Error( 'download_failed', 'Downloaded asset is empty' );
		}

		return $tmp;
	}

	/**
	 * Test connection with GitHub API
	 *
	 * @param string $token Optional token to test (defaults to configured token).
	 * @return true|\WP_Error
	 */
	public function test_connection( string $token = '' ): bool|\WP_Error {
		$user = $this->fetch_json( '/user', $token !== '' ? $token : null );

		return $user instanceof \WP_Error ? $user : true;
	}

	/**
	 * Clear the cached account data: the user's repositories and the configured token's rate limit.
	 */
	public function clear_account_cache(): void {
		$this->cache->delete( self::KEY_USER_REPOS );
		$this->cache->delete( self::KEY_RATE_LIMIT );
	}

	/**
	 * Clear releases cache for a specific repository
	 *
	 * @param string $repo Repository name (owner/repo format).
	 */
	public function clear_releases_cache( string $repo ): void {
		$this->cache->delete( sprintf( self::KEY_RELEASES, $repo ) );
	}

	/**
	 * Clear the cached release for one tag
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @param string $tag  Release tag, as passed to get_release_by_tag().
	 */
	public function clear_release_cache( string $repo, string $tag ): void {
		$this->cache->delete( sprintf( self::KEY_RELEASE, $repo, $tag ) );
	}

	/**
	 * Clear branches cache for a specific repository
	 *
	 * @param string $repo Repository name (owner/repo format).
	 */
	public function clear_branches_cache( string $repo ): void {
		$this->cache->delete( sprintf( self::KEY_BRANCHES, $repo ) );
		$this->cache->delete( sprintf( self::KEY_REPO_INFO, $repo ) );
	}

	/**
	 * Get repository branches
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @return array<int, array{name: string, commit: array{sha: string, url: string}, protected: bool}>|\WP_Error Branch data.
	 */
	public function get_branches( string $repo ): array|\WP_Error {
		$cache_key = sprintf( self::KEY_BRANCHES, $repo );
		$cached    = $this->cache->get( $cache_key );

		if ( $cached !== false && is_array( $cached ) ) {
			/** @var array<int, array{name: string, commit: array{sha: string, url: string}, protected: bool}> */
			return $cached;
		}

		$decoded = $this->fetch_json( "/repos/{$repo}/branches?per_page=100" );

		if ( $decoded instanceof \WP_Error ) {
			return $decoded;
		}

		/** @var array<int, array{name: string, commit: array{sha: string, url: string}, protected: bool}> $branches */
		$branches = $decoded;

		$this->cache->set( $cache_key, $branches, 5 * MINUTE_IN_SECONDS );

		return $branches;
	}

	/**
	 * Get directory contents at path
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @param string $path Directory path (empty for root).
	 * @param string $ref  Branch or commit reference.
	 * @return array<int, array{name: string, path: string, sha: string, size: int, type: string, download_url: string|null, html_url: string}>|\WP_Error Directory contents.
	 */
	public function get_contents( string $repo, string $path = '', string $ref = 'main' ): array|\WP_Error {
		// Use SHA-256 for cache key generation (avoids Snyk MD5 warnings)
		$path_hash = hash( 'sha256', $path );
		$cache_key = sprintf( self::KEY_CONTENTS, $repo, $ref, $path_hash );
		$cached    = $this->cache->get( $cache_key );

		if ( $cached !== false && is_array( $cached ) ) {
			/** @var array<int, array{name: string, path: string, sha: string, size: int, type: string, download_url: string|null, html_url: string}> */
			return $cached;
		}

		// Validate path to prevent directory traversal attacks
		if ( ! empty( $path ) && function_exists( 'validate_file' ) && validate_file( $path ) > 0 ) {
			return new \WP_Error( 'invalid_path', 'Path contains invalid segments' );
		}

		// Encode path segments individually to preserve slashes
		$path_segments    = explode( '/', $path );
		$encoded_segments = array_map( 'rawurlencode', $path_segments );
		$encoded_path     = implode( '/', $encoded_segments );
		$decoded          = $this->fetch_json( "/repos/{$repo}/contents/{$encoded_path}?ref={$ref}" );

		if ( $decoded instanceof \WP_Error ) {
			return $decoded;
		}

		// GitHub returns an object for a single file and a list for a directory; only directories are browsable.
		if ( isset( $decoded['type'] ) ) {
			return new \WP_Error( 'not_a_directory', 'Path is a file, not a directory' );
		}

		/** @var array<int, array{name: string, path: string, sha: string, size: int, type: string, download_url: string|null, html_url: string}> $contents */
		$contents = $decoded;

		$this->cache->set( $cache_key, $contents, 5 * MINUTE_IN_SECONDS );

		return $contents;
	}

	/**
	 * Get archive download URL
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @param string $ref  Branch or commit reference.
	 * @return string|\WP_Error Signed archive download URL.
	 */
	public function get_archive_url( string $repo, string $ref ): string|\WP_Error {
		return $this->fetch_redirect( "/repos/{$repo}/zipball/{$ref}" );
	}

	/**
	 * Get repository info
	 *
	 * @param string $repo Repository name (owner/repo format).
	 * @return array{default_branch: string, full_name: string, private: bool}|\WP_Error Repository metadata.
	 */
	public function get_repo_info( string $repo ): array|\WP_Error {
		$cache_key = sprintf( self::KEY_REPO_INFO, $repo );
		$cached    = $this->cache->get( $cache_key );

		if ( $cached !== false && is_array( $cached ) ) {
			/** @var array{default_branch: string, full_name: string, private: bool} */
			return $cached;
		}

		$decoded = $this->fetch_json( "/repos/{$repo}" );

		if ( $decoded instanceof \WP_Error ) {
			return $decoded;
		}

		$repo_info = array(
			'default_branch' => isset( $decoded['default_branch'] ) && is_string( $decoded['default_branch'] ) ? $decoded['default_branch'] : 'main',
			'full_name'      => isset( $decoded['full_name'] ) && is_string( $decoded['full_name'] ) ? $decoded['full_name'] : $repo,
			'private'        => isset( $decoded['private'] ) && is_bool( $decoded['private'] ) ? $decoded['private'] : false,
		);

		$this->cache->set( $cache_key, $repo_info, HOUR_IN_SECONDS );

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
	 * Request headers plus the Bearer token, when there is one.
	 *
	 * @param string                $token   GitHub token, '' for an anonymous request.
	 * @param array<string, string> $headers Headers to send alongside.
	 * @return array<string, string>
	 */
	private function with_auth( string $token, array $headers = array() ): array {
		if ( $token !== '' ) {
			$headers['Authorization'] = "Bearer {$token}";
		}

		return $headers;
	}

	/**
	 * GET an API path that must answer 200 with a JSON array or object.
	 *
	 * @param string      $path  Path under the API root, with its query string.
	 * @param string|null $token Token to send instead of the configured one.
	 * @return array<mixed>|\WP_Error
	 */
	private function fetch_json( string $path, ?string $token = null ): array|\WP_Error {
		$token    = $token ?? $this->get_token();
		$response = $this->http_client->get( self::API_URL . $path, $this->with_auth( $token ) );

		if ( $response instanceof \WP_Error ) {
			return $response;
		}

		if ( $response->status_code !== 200 ) {
			return $this->error_from( $response, $token );
		}

		$decoded = json_decode( $response->body, true );

		return is_array( $decoded ) ? $decoded : $this->invalid_response();
	}

	/**
	 * GET an API path that must answer with a redirect, and return where it points.
	 *
	 * @param string                $path    Path under the API root.
	 * @param array<string, string> $headers Extra request headers.
	 * @return string|\WP_Error
	 */
	private function fetch_redirect( string $path, array $headers = array() ): string|\WP_Error {
		$token    = $this->get_token();
		$response = $this->http_client->get( self::API_URL . $path, $this->with_auth( $token, $headers ), array( 'redirection' => 0 ) );

		if ( $response instanceof \WP_Error ) {
			return $response;
		}

		$location = $response->headers['location'] ?? '';

		if ( $response->status_code === 302 && $location !== '' ) {
			return $location;
		}

		if ( $response->status_code >= 400 ) {
			return $this->error_from( $response, $token );
		}

		return $this->invalid_response();
	}

	/**
	 * Map a failed API response to the error contract documented on IPlatformAPI.
	 *
	 * GitHub signals rate limiting with 403 or 429 plus `x-ratelimit-remaining: 0` or `retry-after`,
	 * and answers 404 rather than 403 for a private repository the token cannot see.
	 *
	 * @param Response $response Failed API response.
	 * @param string   $token    Token the request was sent with.
	 */
	private function error_from( Response $response, string $token ): \WP_Error {
		$status      = $response->status_code;
		$data        = array( 'status' => $status );
		$rate_limits = ( $response->headers['x-ratelimit-remaining'] ?? '' ) === '0' || isset( $response->headers['retry-after'] );

		if ( $status === 429 || ( $status === 403 && $rate_limits ) ) {
			return new \WP_Error( 'rate_limit_exceeded', 'GitHub API rate limit exceeded', $data );
		}

		if ( ( $status === 401 || $status === 403 ) && $token === '' ) {
			return new \WP_Error( 'token_missing', 'GitHub token is not configured', $data );
		}

		if ( $status === 401 ) {
			return new \WP_Error( 'token_invalid', 'Invalid GitHub token', $data );
		}

		if ( $status === 403 ) {
			return new \WP_Error( 'forbidden', 'The GitHub token lacks access to this resource', $data );
		}

		if ( $status === 404 ) {
			return new \WP_Error( 'not_found', 'Not found on GitHub, or the token cannot access it', $data );
		}

		return new \WP_Error( 'api_error', "GitHub API error: {$status}", $data );
	}

	/** A 2xx answer this client cannot use */
	private function invalid_response(): \WP_Error {
		return new \WP_Error( 'invalid_response', 'Unexpected response from the GitHub API' );
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
