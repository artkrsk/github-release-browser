<?php

namespace Arts\GH\ReleaseBrowser\Core\Services;

use Arts\GH\ReleaseBrowser\Core\Interfaces\IHttpClient;
use Arts\GH\ReleaseBrowser\Core\Interfaces\ICache;
use Arts\GH\ReleaseBrowser\Core\Interfaces\IConfig;
use Arts\GH\ReleaseBrowser\Core\Types\Response;

class GitHubAPI {
	private IHttpClient $http_client;
	private ICache $cache;
	private IConfig $config;

	public function __construct( IHttpClient $http_client, ICache $cache, IConfig $config ) {
		$this->http_client = $http_client;
		$this->cache       = $cache;
		$this->config      = $config;
	}

	public function getReleases( string $repo, int $page = 1 ): array {
		$cache_key = "releases_{$repo}_{$page}";
		$cached    = $this->cache->get( $cache_key );

		if ( $cached !== false ) {
			return json_decode( $cached, true );
		}

		$token   = $this->config->get( 'token_key' );
		$headers = array();

		if ( $token ) {
			$headers['Authorization'] = "token {$token}";
		}

		$url      = "https://api.github.com/repos/{$repo}/releases?page={$page}&per_page=30";
		$response = $this->http_client->get( $url, $headers );

		if ( $response->statusCode !== 200 ) {
			return array();
		}

		$releases = json_decode( $response->body, true );
		$this->cache->set( $cache_key, json_encode( $releases ), 300 ); // 5 minutes

		return $releases ?: array();
	}

	public function getRateLimit(): array {
		$cache_key = 'rate_limit';
		$cached    = $this->cache->get( $cache_key );

		if ( $cached !== false ) {
			return json_decode( $cached, true );
		}

		$response = $this->http_client->get( 'https://api.github.com/rate_limit' );

		if ( $response->statusCode !== 200 ) {
			return array(
				'remaining' => 0,
				'limit'     => 5000,
			);
		}

		$data       = json_decode( $response->body, true );
		$rate_limit = $data['resources']['core'] ?? array(
			'remaining' => 0,
			'limit'     => 5000,
		);

		$this->cache->set( $cache_key, json_encode( $rate_limit ), 60 ); // 1 minute

		return $rate_limit;
	}
}
