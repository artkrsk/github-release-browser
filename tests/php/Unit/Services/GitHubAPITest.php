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

	// ========================================
	// get_branches tests
	// ========================================

	public function test_get_branches_returns_cached_data(): void {
		$cached_branches = array(
			array( 'name' => 'main', 'commit' => array( 'sha' => 'abc123' ), 'protected' => true ),
			array( 'name' => 'develop', 'commit' => array( 'sha' => 'def456' ), 'protected' => false ),
		);

		$this->cache->shouldReceive( 'get' )
			->once()
			->with( 'branches_owner/repo' )
			->andReturn( $cached_branches );

		$result = $this->api->get_branches( 'owner/repo' );

		$this->assertSame( $cached_branches, $result );
	}

	public function test_get_branches_fetches_from_api_when_not_cached(): void {
		$api_branches = array(
			array( 'name' => 'main', 'commit' => array( 'sha' => 'abc123', 'url' => 'https://...' ), 'protected' => true ),
		);

		$this->cache->shouldReceive( 'get' )
			->with( 'branches_owner/repo' )
			->andReturn( false );

		$this->config->shouldReceive( 'get' )
			->with( 'github_token' )
			->andReturn( 'token' );

		$this->http_client->shouldReceive( 'get' )
			->once()
			->with(
				'https://api.github.com/repos/owner/repo/branches?per_page=100',
				array( 'Authorization' => 'Bearer token' )
			)
			->andReturn( new Response( 200, json_encode( $api_branches ), array() ) );

		$this->cache->shouldReceive( 'set' )
			->once()
			->with( 'branches_owner/repo', $api_branches, 300 )
			->andReturn( true );

		$result = $this->api->get_branches( 'owner/repo' );

		$this->assertSame( $api_branches, $result );
	}

	public function test_get_branches_returns_empty_array_on_non_200(): void {
		$this->cache->shouldReceive( 'get' )->andReturn( false );
		$this->config->shouldReceive( 'get' )->andReturn( '' );

		$this->http_client->shouldReceive( 'get' )
			->andReturn( new Response( 404, 'Not Found', array() ) );

		$result = $this->api->get_branches( 'owner/repo' );

		$this->assertSame( array(), $result );
	}

	public function test_get_branches_omits_auth_header_when_no_token(): void {
		$this->cache->shouldReceive( 'get' )->andReturn( false );
		$this->config->shouldReceive( 'get' )->with( 'github_token' )->andReturn( '' );

		$this->http_client->shouldReceive( 'get' )
			->once()
			->with( 'https://api.github.com/repos/owner/repo/branches?per_page=100', array() )
			->andReturn( new Response( 200, json_encode( array() ), array() ) );

		$this->cache->shouldReceive( 'set' )->andReturn( true );

		$this->api->get_branches( 'owner/repo' );
	}

	// ========================================
	// get_contents tests
	// ========================================

	public function test_get_contents_returns_cached_data(): void {
		$cached_contents = array(
			array( 'name' => 'src', 'path' => 'src', 'type' => 'dir' ),
			array( 'name' => 'README.md', 'path' => 'README.md', 'type' => 'file' ),
		);

		$path_hash = hash( 'sha256', '' );
		$this->cache->shouldReceive( 'get' )
			->once()
			->with( "contents_owner/repo_main_{$path_hash}" )
			->andReturn( $cached_contents );

		$result = $this->api->get_contents( 'owner/repo', '', 'main' );

		$this->assertSame( $cached_contents, $result );
	}

	public function test_get_contents_fetches_from_api_when_not_cached(): void {
		$api_contents = array(
			array( 'name' => 'file.txt', 'path' => 'file.txt', 'sha' => 'abc', 'size' => 100, 'type' => 'file', 'download_url' => 'https://...', 'html_url' => 'https://...' ),
		);

		$path_hash = hash( 'sha256', 'src' );
		$this->cache->shouldReceive( 'get' )
			->with( "contents_owner/repo_develop_{$path_hash}" )
			->andReturn( false );

		$this->config->shouldReceive( 'get' )->andReturn( 'token' );

		$this->http_client->shouldReceive( 'get' )
			->once()
			->with(
				'https://api.github.com/repos/owner/repo/contents/src?ref=develop',
				array( 'Authorization' => 'Bearer token' )
			)
			->andReturn( new Response( 200, json_encode( $api_contents ), array() ) );

		$this->cache->shouldReceive( 'set' )
			->once()
			->with( "contents_owner/repo_develop_{$path_hash}", $api_contents, 300 )
			->andReturn( true );

		$result = $this->api->get_contents( 'owner/repo', 'src', 'develop' );

		$this->assertSame( $api_contents, $result );
	}

	public function test_get_contents_returns_empty_on_non_200(): void {
		$path_hash = hash( 'sha256', '' );
		$this->cache->shouldReceive( 'get' )
			->with( "contents_owner/repo_main_{$path_hash}" )
			->andReturn( false );
		$this->config->shouldReceive( 'get' )->andReturn( '' );

		$this->http_client->shouldReceive( 'get' )
			->andReturn( new Response( 404, 'Not Found', array() ) );

		$result = $this->api->get_contents( 'owner/repo' );

		$this->assertSame( array(), $result );
	}

	public function test_get_contents_returns_empty_for_single_file_response(): void {
		// GitHub returns an object (not array) when path points to a single file
		$single_file = array(
			'type'    => 'file',
			'name'    => 'README.md',
			'content' => 'base64content',
		);

		$path_hash = hash( 'sha256', 'README.md' );
		$this->cache->shouldReceive( 'get' )
			->with( "contents_owner/repo_main_{$path_hash}" )
			->andReturn( false );
		$this->config->shouldReceive( 'get' )->andReturn( '' );

		$this->http_client->shouldReceive( 'get' )
			->andReturn( new Response( 200, json_encode( $single_file ), array() ) );

		$result = $this->api->get_contents( 'owner/repo', 'README.md', 'main' );

		$this->assertSame( array(), $result );
	}

	public function test_get_contents_encodes_path_in_url(): void {
		$path_hash = hash( 'sha256', 'path with spaces' );
		$this->cache->shouldReceive( 'get' )
			->with( "contents_owner/repo_main_{$path_hash}" )
			->andReturn( false );
		$this->config->shouldReceive( 'get' )->andReturn( '' );

		$this->http_client->shouldReceive( 'get' )
			->once()
			->with(
				'https://api.github.com/repos/owner/repo/contents/path%20with%20spaces?ref=main',
				array()
			)
			->andReturn( new Response( 200, json_encode( array() ), array() ) );

		$this->cache->shouldReceive( 'set' )->andReturn( true );

		$this->api->get_contents( 'owner/repo', 'path with spaces', 'main' );
	}

	// ========================================
	// get_archive_url tests
	// ========================================

	public function test_get_archive_url_returns_redirect_location(): void {
		$this->config->shouldReceive( 'get' )->andReturn( 'token' );

		$this->http_client->shouldReceive( 'get' )
			->once()
			->with(
				'https://api.github.com/repos/owner/repo/zipball/main',
				array( 'Authorization' => 'Bearer token' ),
				array( 'redirection' => 0 )
			)
			->andReturn( new Response(
				302,
				'',
				array( 'location' => 'https://codeload.github.com/owner/repo/zip/main' )
			) );

		$result = $this->api->get_archive_url( 'owner/repo', 'main' );

		$this->assertSame( 'https://codeload.github.com/owner/repo/zip/main', $result );
	}

	public function test_get_archive_url_returns_fallback_on_non_redirect(): void {
		$this->config->shouldReceive( 'get' )->andReturn( '' );

		$this->http_client->shouldReceive( 'get' )
			->andReturn( new Response( 404, 'Not Found', array() ) );

		$result = $this->api->get_archive_url( 'owner/repo', 'v1.0.0' );

		$this->assertSame( 'https://api.github.com/repos/owner/repo/zipball/v1.0.0', $result );
	}

	public function test_get_archive_url_handles_missing_location_header(): void {
		$this->config->shouldReceive( 'get' )->andReturn( '' );

		$this->http_client->shouldReceive( 'get' )
			->andReturn( new Response( 302, '', array() ) ); // 302 but no location

		$result = $this->api->get_archive_url( 'owner/repo', 'main' );

		$this->assertSame( 'https://api.github.com/repos/owner/repo/zipball/main', $result );
	}

	// ========================================
	// get_repo_info tests
	// ========================================

	public function test_get_repo_info_returns_cached_data(): void {
		$cached_info = array(
			'default_branch' => 'main',
			'full_name'      => 'owner/repo',
			'private'        => false,
		);

		$this->cache->shouldReceive( 'get' )
			->once()
			->with( 'repo_info_owner/repo' )
			->andReturn( $cached_info );

		$result = $this->api->get_repo_info( 'owner/repo' );

		$this->assertSame( $cached_info, $result );
	}

	public function test_get_repo_info_fetches_from_api(): void {
		$api_response = array(
			'default_branch' => 'develop',
			'full_name'      => 'owner/repo',
			'private'        => true,
			'extra_field'    => 'ignored',
		);

		$this->cache->shouldReceive( 'get' )
			->with( 'repo_info_owner/repo' )
			->andReturn( false );
		$this->config->shouldReceive( 'get' )->andReturn( 'token' );

		$this->http_client->shouldReceive( 'get' )
			->once()
			->with(
				'https://api.github.com/repos/owner/repo',
				array( 'Authorization' => 'Bearer token' )
			)
			->andReturn( new Response( 200, json_encode( $api_response ), array() ) );

		$this->cache->shouldReceive( 'set' )
			->once()
			->with( 'repo_info_owner/repo', Mockery::type( 'array' ), 3600 )
			->andReturn( true );

		$result = $this->api->get_repo_info( 'owner/repo' );

		$this->assertSame( 'develop', $result['default_branch'] );
		$this->assertSame( 'owner/repo', $result['full_name'] );
		$this->assertTrue( $result['private'] );
	}

	public function test_get_repo_info_returns_defaults_on_non_200(): void {
		$this->cache->shouldReceive( 'get' )->andReturn( false );
		$this->config->shouldReceive( 'get' )->andReturn( '' );

		$this->http_client->shouldReceive( 'get' )
			->andReturn( new Response( 404, 'Not Found', array() ) );

		$result = $this->api->get_repo_info( 'owner/repo' );

		$this->assertSame( 'main', $result['default_branch'] );
		$this->assertSame( 'owner/repo', $result['full_name'] );
		$this->assertFalse( $result['private'] );
	}

	public function test_get_repo_info_returns_defaults_on_malformed_json(): void {
		$this->cache->shouldReceive( 'get' )->andReturn( false );
		$this->config->shouldReceive( 'get' )->andReturn( '' );

		$this->http_client->shouldReceive( 'get' )
			->andReturn( new Response( 200, 'not valid json', array() ) );

		$result = $this->api->get_repo_info( 'owner/repo' );

		$this->assertSame( 'main', $result['default_branch'] );
	}

	// ========================================
	// clear_releases_cache tests
	// ========================================

	public function test_clear_releases_cache_deletes_correct_key(): void {
		$this->cache->shouldReceive( 'delete' )
			->once()
			->with( 'releases_owner/repo_1' );

		$this->api->clear_releases_cache( 'owner/repo' );
	}

	// ========================================
	// clear_branches_cache tests
	// ========================================

	public function test_clear_branches_cache_deletes_both_keys(): void {
		$this->cache->shouldReceive( 'delete' )
			->once()
			->with( 'branches_owner/repo' );

		$this->cache->shouldReceive( 'delete' )
			->once()
			->with( 'repo_info_owner/repo' );

		$this->api->clear_branches_cache( 'owner/repo' );
	}

	// ========================================
	// add_source_archives tests (via get_releases)
	// ========================================

	public function test_get_releases_preserves_existing_assets(): void {
		$api_releases = array(
			array(
				'tag_name'    => 'v1.0.0',
				'assets'      => array(
					array( 'name' => 'plugin.zip', 'id' => 123 ),
				),
				'zipball_url' => 'https://api.github.com/repos/owner/repo/zipball/v1.0.0',
				'tarball_url' => 'https://api.github.com/repos/owner/repo/tarball/v1.0.0',
			),
		);

		$this->cache->shouldReceive( 'get' )->andReturn( false );
		$this->config->shouldReceive( 'get' )->andReturn( '' );

		$this->http_client->shouldReceive( 'get' )
			->andReturn( new Response( 200, json_encode( $api_releases ), array() ) );

		$this->cache->shouldReceive( 'set' )->andReturn( true );

		$result = $this->api->get_releases( 'owner/repo' );

		// Should keep original assets, not add source archives
		$this->assertCount( 1, $result[0]['assets'] );
		$this->assertSame( 'plugin.zip', $result[0]['assets'][0]['name'] );
		$this->assertSame( 123, $result[0]['assets'][0]['id'] );
	}

	public function test_get_releases_adds_source_archives_when_no_assets(): void {
		$api_releases = array(
			array(
				'tag_name'     => 'v1.0.0',
				'assets'       => array(), // No uploaded assets
				'zipball_url'  => 'https://api.github.com/repos/owner/repo/zipball/v1.0.0',
				'tarball_url'  => 'https://api.github.com/repos/owner/repo/tarball/v1.0.0',
				'created_at'   => '2024-01-01T00:00:00Z',
				'published_at' => '2024-01-01T00:00:00Z',
			),
		);

		$this->cache->shouldReceive( 'get' )->andReturn( false );
		$this->config->shouldReceive( 'get' )->andReturn( '' );

		$this->http_client->shouldReceive( 'get' )
			->andReturn( new Response( 200, json_encode( $api_releases ), array() ) );

		$this->cache->shouldReceive( 'set' )->andReturn( true );

		$result = $this->api->get_releases( 'owner/repo' );

		// Should have 2 synthetic assets (zip and tar.gz)
		$this->assertCount( 2, $result[0]['assets'] );
		$this->assertSame( 'Source code (zip)', $result[0]['assets'][0]['name'] );
		$this->assertSame( 'Source code (tar.gz)', $result[0]['assets'][1]['name'] );
	}

	public function test_get_releases_source_archives_have_correct_structure(): void {
		$api_releases = array(
			array(
				'tag_name'     => 'v1.0.0',
				'assets'       => array(),
				'zipball_url'  => 'https://api.github.com/repos/owner/repo/zipball/v1.0.0',
				'tarball_url'  => 'https://api.github.com/repos/owner/repo/tarball/v1.0.0',
				'created_at'   => '2024-01-01T00:00:00Z',
				'published_at' => '2024-01-02T00:00:00Z',
			),
		);

		$this->cache->shouldReceive( 'get' )->andReturn( false );
		$this->config->shouldReceive( 'get' )->andReturn( '' );

		$this->http_client->shouldReceive( 'get' )
			->andReturn( new Response( 200, json_encode( $api_releases ), array() ) );

		$this->cache->shouldReceive( 'set' )->andReturn( true );

		$result = $this->api->get_releases( 'owner/repo' );

		$zip_asset = $result[0]['assets'][0];
		$tar_asset = $result[0]['assets'][1];

		// Verify zip asset structure
		$this->assertSame( 'Source code (zip)', $zip_asset['name'] );
		$this->assertSame( 'https://api.github.com/repos/owner/repo/zipball/v1.0.0', $zip_asset['browser_download_url'] );
		$this->assertSame( 'application/zip', $zip_asset['content_type'] );
		$this->assertSame( 0, $zip_asset['size'] );
		$this->assertSame( -1, $zip_asset['id'] );
		$this->assertTrue( $zip_asset['synthetic'] );

		// Verify tar.gz asset structure
		$this->assertSame( 'Source code (tar.gz)', $tar_asset['name'] );
		$this->assertSame( 'https://api.github.com/repos/owner/repo/tarball/v1.0.0', $tar_asset['browser_download_url'] );
		$this->assertSame( 'application/gzip', $tar_asset['content_type'] );
		$this->assertSame( -2, $tar_asset['id'] );
		$this->assertTrue( $tar_asset['synthetic'] );
	}

	public function test_get_release_by_tag_adds_source_archives_when_no_assets(): void {
		$api_release = array(
			'tag_name'    => 'v2.0.0',
			'assets'      => array(),
			'zipball_url' => 'https://api.github.com/repos/owner/repo/zipball/v2.0.0',
			'tarball_url' => 'https://api.github.com/repos/owner/repo/tarball/v2.0.0',
		);

		$this->cache->shouldReceive( 'get' )->andReturn( false );
		$this->config->shouldReceive( 'get' )->andReturn( '' );

		$this->http_client->shouldReceive( 'get' )
			->andReturn( new Response( 200, json_encode( $api_release ), array() ) );

		$this->cache->shouldReceive( 'set' )->andReturn( true );

		$result = $this->api->get_release_by_tag( 'owner/repo', 'v2.0.0' );

		$this->assertCount( 2, $result['assets'] );
		$this->assertSame( 'Source code (zip)', $result['assets'][0]['name'] );
		$this->assertSame( 'Source code (tar.gz)', $result['assets'][1]['name'] );
	}
}
