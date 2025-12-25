<?php

namespace Arts\GH\ReleaseBrowser\Core\Services;

use Arts\GH\ReleaseBrowser\Core\Interfaces\IHttpClient;
use Arts\GH\ReleaseBrowser\Core\Interfaces\ICache;
use Arts\GH\ReleaseBrowser\Core\Interfaces\IConfig;
use Arts\GH\ReleaseBrowser\Core\Types\Response;

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
class GitHubAPI {
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
		if ( $response->status_code === 302 && isset( $response->headers['location'] ) ) {
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
}
