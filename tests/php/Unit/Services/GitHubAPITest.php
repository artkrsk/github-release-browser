<?php

namespace Arts\GH\ReleaseBrowser\Tests\Unit\Services;

use Arts\GH\ReleaseBrowser\Core\Services\GitHubAPI;
use Arts\GH\ReleaseBrowser\Core\Interfaces\IHttpClient;
use Arts\GH\ReleaseBrowser\Core\Interfaces\ICache;
use Arts\GH\ReleaseBrowser\Core\Interfaces\IConfig;
use Arts\GH\ReleaseBrowser\Core\Types\Response;
use Mockery;
use Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration;
use PHPUnit\Framework\TestCase;

/**
 * Tests for GitHubAPI service
 */
class GitHubAPITest extends TestCase {
	use MockeryPHPUnitIntegration;

	private GitHubAPI $api;
	private Mockery\MockInterface $http_client;
	private Mockery\MockInterface $cache;
	private Mockery\MockInterface $config;

	protected function setUp(): void {
		parent::setUp();
		\Brain\Monkey\setUp();

		$this->http_client = Mockery::mock( IHttpClient::class );
		$this->cache       = Mockery::mock( ICache::class );
		$this->config      = Mockery::mock( IConfig::class );

		$this->api = new GitHubAPI( $this->http_client, $this->cache, $this->config );
	}

	protected function tearDown(): void {
		Mockery::close();
		\Brain\Monkey\tearDown();
		parent::tearDown();
	}

	public function test_get_releases_returns_cached_data_when_available(): void {
		$cached_releases = array(
			array( 'tag_name' => 'v1.0.0' ),
			array( 'tag_name' => 'v1.1.0' ),
		);

		$this->cache->shouldReceive( 'get' )
			->once()
			->with( 'releases_owner/repo_1' )
			->andReturn( $cached_releases );

		$result = $this->api->get_releases( 'owner/repo', 1 );

		$this->assertSame( $cached_releases, $result );
	}

	public function test_get_releases_fetches_from_api_when_not_cached(): void {
		$api_releases = array(
			array( 'tag_name' => 'v1.0.0', 'assets' => array() ),
		);

		$this->cache->shouldReceive( 'get' )
			->once()
			->with( 'releases_owner/repo_1' )
			->andReturn( false );

		$this->config->shouldReceive( 'get' )
			->once()
			->with( 'github_token' )
			->andReturn( 'test-token' );

		$this->http_client->shouldReceive( 'get' )
			->once()
			->with(
				'https://api.github.com/repos/owner/repo/releases?page=1&per_page=30',
				array( 'Authorization' => 'Bearer test-token' )
			)
			->andReturn( new Response( 200, json_encode( $api_releases ), array() ) );

		$this->cache->shouldReceive( 'set' )
			->once()
			->with( 'releases_owner/repo_1', $api_releases, 300 )
			->andReturn( true );

		$result = $this->api->get_releases( 'owner/repo', 1 );

		$this->assertSame( $api_releases, $result );
	}

	public function test_get_releases_uses_page_parameter(): void {
		$this->cache->shouldReceive( 'get' )
			->with( 'releases_owner/repo_3' )
			->andReturn( false );

		$this->config->shouldReceive( 'get' )->andReturn( '' );

		$this->http_client->shouldReceive( 'get' )
			->once()
			->with(
				'https://api.github.com/repos/owner/repo/releases?page=3&per_page=30',
				array()
			)
			->andReturn( new Response( 200, json_encode( array() ), array() ) );

		$this->cache->shouldReceive( 'set' )->andReturn( true );

		$this->api->get_releases( 'owner/repo', 3 );
	}

	public function test_get_releases_returns_empty_array_on_non_200_response(): void {
		$this->cache->shouldReceive( 'get' )->andReturn( false );
		$this->config->shouldReceive( 'get' )->andReturn( '' );

		$this->http_client->shouldReceive( 'get' )
			->andReturn( new Response( 404, 'Not Found', array() ) );

		$result = $this->api->get_releases( 'owner/repo' );

		$this->assertSame( array(), $result );
	}

	public function test_get_releases_includes_authorization_header_when_token_provided(): void {
		$this->cache->shouldReceive( 'get' )->andReturn( false );

		$this->config->shouldReceive( 'get' )
			->with( 'github_token' )
			->andReturn( 'my-secret-token' );

		$this->http_client->shouldReceive( 'get' )
			->once()
			->with(
				Mockery::any(),
				array( 'Authorization' => 'Bearer my-secret-token' )
			)
			->andReturn( new Response( 200, json_encode( array() ), array() ) );

		$this->cache->shouldReceive( 'set' )->andReturn( true );

		$this->api->get_releases( 'owner/repo' );
	}

	public function test_get_releases_omits_authorization_header_when_no_token(): void {
		$this->cache->shouldReceive( 'get' )->andReturn( false );

		$this->config->shouldReceive( 'get' )
			->with( 'github_token' )
			->andReturn( '' );

		$this->http_client->shouldReceive( 'get' )
			->once()
			->with( Mockery::any(), array() )
			->andReturn( new Response( 200, json_encode( array() ), array() ) );

		$this->cache->shouldReceive( 'set' )->andReturn( true );

		$this->api->get_releases( 'owner/repo' );
	}

	public function test_get_rate_limit_returns_cached_data_when_available(): void {
		$cached_rate_limit = array( 'remaining' => 4999, 'limit' => 5000 );

		$this->cache->shouldReceive( 'get' )
			->once()
			->with( 'rate_limit' )
			->andReturn( $cached_rate_limit );

		$result = $this->api->get_rate_limit();

		$this->assertSame( $cached_rate_limit, $result );
	}

	public function test_get_rate_limit_fetches_from_api_when_not_cached(): void {
		$api_response = array(
			'resources' => array(
				'core' => array(
					'remaining' => 4998,
					'limit'     => 5000,
				),
			),
		);

		$this->cache->shouldReceive( 'get' )->andReturn( false );
		$this->config->shouldReceive( 'get' )->andReturn( 'token' );

		$this->http_client->shouldReceive( 'get' )
			->once()
			->with(
				'https://api.github.com/rate_limit',
				array( 'Authorization' => 'Bearer token' )
			)
			->andReturn( new Response( 200, json_encode( $api_response ), array() ) );

		$this->cache->shouldReceive( 'set' )
			->with( 'rate_limit', Mockery::type( 'array' ), 60 )
			->andReturn( true );

		$result = $this->api->get_rate_limit();

		$this->assertSame( 4998, $result['remaining'] );
		$this->assertSame( 5000, $result['limit'] );
	}

	public function test_get_rate_limit_returns_defaults_on_error(): void {
		$this->cache->shouldReceive( 'get' )->andReturn( false );
		$this->config->shouldReceive( 'get' )->andReturn( '' );

		$this->http_client->shouldReceive( 'get' )
			->andReturn( new Response( 500, 'Error', array() ) );

		$result = $this->api->get_rate_limit();

		$this->assertSame( 0, $result['remaining'] );
		$this->assertSame( 5000, $result['limit'] );
	}

	public function test_get_release_by_tag_returns_cached_data(): void {
		$cached_release = array( 'tag_name' => 'v1.0.0' );

		$this->cache->shouldReceive( 'get' )
			->with( 'release_owner/repo_v1.0.0' )
			->andReturn( $cached_release );

		$result = $this->api->get_release_by_tag( 'owner/repo', 'v1.0.0' );

		$this->assertSame( $cached_release, $result );
	}

	public function test_get_release_by_tag_fetches_from_api(): void {
		$api_release = array( 'tag_name' => 'v2.0.0', 'assets' => array() );

		$this->cache->shouldReceive( 'get' )->andReturn( false );
		$this->config->shouldReceive( 'get' )->andReturn( 'token' );

		$this->http_client->shouldReceive( 'get' )
			->once()
			->with(
				'https://api.github.com/repos/owner/repo/releases/tags/v2.0.0',
				array( 'Authorization' => 'Bearer token' )
			)
			->andReturn( new Response( 200, json_encode( $api_release ), array() ) );

		$this->cache->shouldReceive( 'set' )
			->with( 'release_owner/repo_v2.0.0', $api_release, 300 )
			->andReturn( true );

		$result = $this->api->get_release_by_tag( 'owner/repo', 'v2.0.0' );

		$this->assertSame( $api_release, $result );
	}

	public function test_get_user_repos_returns_error_structure_on_401(): void {
		$this->cache->shouldReceive( 'get' )->andReturn( false );
		$this->config->shouldReceive( 'get' )->andReturn( 'invalid-token' );

		$this->http_client->shouldReceive( 'get' )
			->andReturn( new Response( 401, 'Unauthorized', array() ) );

		$result = $this->api->get_user_repos();

		$this->assertIsArray( $result );
		$this->assertTrue( $result['error'] );
		$this->assertSame( 'token_invalid', $result['error_code'] );
		$this->assertSame( 401, $result['status_code'] );
	}

	public function test_get_user_repos_returns_error_structure_on_403(): void {
		$this->cache->shouldReceive( 'get' )->andReturn( false );
		$this->config->shouldReceive( 'get' )->andReturn( 'token' );

		$this->http_client->shouldReceive( 'get' )
			->andReturn( new Response( 403, 'Forbidden', array() ) );

		$result = $this->api->get_user_repos();

		$this->assertSame( 'rate_limit_exceeded', $result['error_code'] );
	}

	public function test_get_user_repos_returns_token_missing_when_no_token(): void {
		$this->cache->shouldReceive( 'get' )->andReturn( false );
		$this->config->shouldReceive( 'get' )->andReturn( '' );

		$this->http_client->shouldReceive( 'get' )
			->andReturn( new Response( 401, 'Unauthorized', array() ) );

		$result = $this->api->get_user_repos();

		$this->assertSame( 'token_missing', $result['error_code'] );
	}

	public function test_get_download_url_follows_redirect(): void {
		$this->config->shouldReceive( 'get' )->andReturn( 'token' );

		$this->http_client->shouldReceive( 'get' )
			->once()
			->with(
				'https://api.github.com/repos/owner/repo/releases/assets/123',
				array(
					'Accept'        => 'application/octet-stream',
					'Authorization' => 'Bearer token',
				),
				array( 'redirection' => 0 )
			)
			->andReturn( new Response(
				302,
				'',
				array( 'location' => 'https://s3.amazonaws.com/github/asset.zip' )
			) );

		$result = $this->api->get_download_url( 'owner/repo', 123 );

		$this->assertSame( 'https://s3.amazonaws.com/github/asset.zip', $result );
	}

	public function test_get_download_url_returns_empty_on_non_redirect(): void {
		$this->config->shouldReceive( 'get' )->andReturn( '' );

		$this->http_client->shouldReceive( 'get' )
			->andReturn( new Response( 404, 'Not Found', array() ) );

		$result = $this->api->get_download_url( 'owner/repo', 123 );

		$this->assertSame( '', $result );
	}

	public function test_test_connection_returns_true_on_success(): void {
		$this->config->shouldReceive( 'get' )->andReturn( 'valid-token' );

		$this->http_client->shouldReceive( 'get' )
			->once()
			->with(
				'https://api.github.com/user',
				array( 'Authorization' => 'Bearer valid-token' )
			)
			->andReturn( new Response( 200, '{"login":"user"}', array() ) );

		$result = $this->api->test_connection();

		$this->assertTrue( $result );
	}

	public function test_test_connection_returns_false_on_failure(): void {
		$this->config->shouldReceive( 'get' )->andReturn( 'invalid' );

		$this->http_client->shouldReceive( 'get' )
			->andReturn( new Response( 401, 'Unauthorized', array() ) );

		$result = $this->api->test_connection();

		$this->assertFalse( $result );
	}

	public function test_test_connection_accepts_custom_token(): void {
		$this->http_client->shouldReceive( 'get' )
			->once()
			->with(
				'https://api.github.com/user',
				array( 'Authorization' => 'Bearer custom-token' )
			)
			->andReturn( new Response( 200, '{}', array() ) );

		$result = $this->api->test_connection( 'custom-token' );

		$this->assertTrue( $result );
	}

	public function test_clear_cache_deletes_common_keys_when_no_pattern(): void {
		$this->cache->shouldReceive( 'delete' )
			->once()
			->with( 'user_repos' );

		$this->cache->shouldReceive( 'delete' )
			->once()
			->with( 'rate_limit' );

		$this->api->clear_cache();
	}

	public function test_clear_cache_deletes_specific_key_when_pattern_provided(): void {
		$this->cache->shouldReceive( 'delete' )
			->once()
			->with( 'release_owner/repo_v1.0.0' );

		$this->api->clear_cache( 'release_owner/repo_v1.0.0' );
	}
}
