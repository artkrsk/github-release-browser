<?php

namespace Arts\GH\ReleaseBrowser\Tests\Integration;

use Arts\GH\ReleaseBrowser\Browser;
use Arts\GH\ReleaseBrowser\Core\Interfaces\IPlatformAPI;
use Arts\GH\ReleaseBrowser\Core\Services\URIParser;
use Arts\GH\ReleaseBrowser\Core\Services\AssetResolver;
use WP_UnitTestCase;

/**
 * Integration tests for Browser class
 *
 * Tests the main Browser orchestrator with real WordPress environment.
 */
class BrowserTest extends WP_UnitTestCase {

	public function tear_down(): void {
		// Clean up any registered hooks.
		remove_all_actions( 'wp_ajax_test_browser_get_releases' );
		remove_all_actions( 'wp_ajax_nopriv_test_browser_get_releases' );
		remove_all_actions( 'wp_ajax_test_browser_get_rate_limit' );
		remove_all_actions( 'wp_ajax_nopriv_test_browser_get_rate_limit' );
		remove_all_actions( 'wp_ajax_test_browser_parse_uri' );
		remove_all_actions( 'wp_ajax_nopriv_test_browser_parse_uri' );
		remove_all_actions( 'wp_ajax_test_browser_get_download_url' );
		remove_all_actions( 'wp_ajax_nopriv_test_browser_get_download_url' );
		remove_all_actions( 'wp_ajax_test_browser_get_user_repos' );
		remove_all_actions( 'wp_ajax_nopriv_test_browser_get_user_repos' );
		remove_all_actions( 'wp_ajax_test_browser_clear_cache' );
		remove_all_actions( 'wp_ajax_nopriv_test_browser_clear_cache' );
		remove_all_actions( 'wp_ajax_test_browser_test_file' );
		remove_all_actions( 'wp_ajax_nopriv_test_browser_test_file' );

		parent::tear_down();
	}

	public function test_constructor_initializes_with_default_config(): void {
		$browser = new Browser( array() );

		$this->assertInstanceOf( Browser::class, $browser );
	}

	public function test_constructor_accepts_custom_config(): void {
		$browser = new Browser(
			array(
				'github_token'          => 'test-token',
				'protocol'              => 'custom-release://',
				'cache_prefix'          => 'custom_cache_',
				'enable_latest_release' => true,
				'enable_directories'    => true,
			)
		);

		$this->assertInstanceOf( Browser::class, $browser );
	}

	public function test_get_github_api_returns_platform_api(): void {
		$browser = new Browser( array() );

		$api = $browser->get_github_api();

		$this->assertInstanceOf( IPlatformAPI::class, $api );
	}

	public function test_get_uri_parser_returns_uri_parser(): void {
		$browser = new Browser( array() );

		$parser = $browser->get_uri_parser();

		$this->assertInstanceOf( URIParser::class, $parser );
	}

	public function test_get_asset_resolver_returns_asset_resolver(): void {
		$browser = new Browser( array() );

		$resolver = $browser->get_asset_resolver();

		$this->assertInstanceOf( AssetResolver::class, $resolver );
	}

	public function test_constructor_registers_ajax_handlers(): void {
		new Browser(
			array(
				'action_prefix' => 'test_browser',
			)
		);

		// Check core AJAX handlers are registered.
		$this->assertTrue( has_action( 'wp_ajax_test_browser_get_releases' ) !== false );
		$this->assertTrue( has_action( 'wp_ajax_nopriv_test_browser_get_releases' ) !== false );
		$this->assertTrue( has_action( 'wp_ajax_test_browser_get_rate_limit' ) !== false );
		$this->assertTrue( has_action( 'wp_ajax_test_browser_parse_uri' ) !== false );
		$this->assertTrue( has_action( 'wp_ajax_test_browser_get_download_url' ) !== false );
		$this->assertTrue( has_action( 'wp_ajax_test_browser_get_user_repos' ) !== false );
		$this->assertTrue( has_action( 'wp_ajax_test_browser_clear_cache' ) !== false );
		$this->assertTrue( has_action( 'wp_ajax_test_browser_test_file' ) !== false );
	}

	public function test_directory_handlers_registered_when_enabled(): void {
		new Browser(
			array(
				'action_prefix'      => 'test_browser',
				'enable_directories' => true,
			)
		);

		// Directory-specific handlers should be registered.
		$this->assertTrue( has_action( 'wp_ajax_test_browser_get_branches' ) !== false );
		$this->assertTrue( has_action( 'wp_ajax_test_browser_get_contents' ) !== false );
		$this->assertTrue( has_action( 'wp_ajax_test_browser_get_archive_url' ) !== false );
		$this->assertTrue( has_action( 'wp_ajax_test_browser_get_repo_info' ) !== false );
	}

	public function test_directory_handlers_not_registered_when_disabled(): void {
		// Clean slate.
		remove_all_actions( 'wp_ajax_disabled_browser_get_branches' );
		remove_all_actions( 'wp_ajax_disabled_browser_get_contents' );

		new Browser(
			array(
				'action_prefix'      => 'disabled_browser',
				'enable_directories' => false,
			)
		);

		// Directory handlers should NOT be registered.
		$this->assertFalse( has_action( 'wp_ajax_disabled_browser_get_branches' ) );
		$this->assertFalse( has_action( 'wp_ajax_disabled_browser_get_contents' ) );
	}

	public function test_register_modal_integration(): void {
		// Remove any existing hooks from previous tests.
		remove_all_actions( 'media_upload_github_releases' );

		$browser = new Browser(
			array(
				'action_prefix' => 'modal_test_' . uniqid(),
			)
		);

		// Modal integration should not be registered until called.
		$this->assertFalse( has_action( 'media_upload_github_releases' ) );

		$browser->register_modal_integration();

		// After registration, media upload hook should be registered.
		$this->assertTrue( has_action( 'media_upload_github_releases' ) !== false );
	}

	public function test_modal_integration_only_registered_once(): void {
		$browser = new Browser(
			array(
				'action_prefix' => 'modal_once_test',
			)
		);

		$browser->register_modal_integration();
		$count_after_first = has_action( 'media_upload_github_releases' );

		$browser->register_modal_integration();
		$count_after_second = has_action( 'media_upload_github_releases' );

		// Priority should be same (not doubled).
		$this->assertSame( $count_after_first, $count_after_second );
	}

	public function test_custom_platform_adapter_is_used(): void {
		$mock_adapter = $this->createMock( IPlatformAPI::class );

		$browser = new Browser( array(), $mock_adapter );

		$this->assertSame( $mock_adapter, $browser->get_github_api() );
	}

	public function test_uri_parser_uses_configured_protocol(): void {
		$browser = new Browser(
			array(
				'protocol' => 'my-custom://',
			)
		);

		$parser = $browser->get_uri_parser();

		$this->assertTrue( $parser->is_github_file( 'my-custom://owner/repo/v1.0.0' ) );
		$this->assertFalse( $parser->is_github_file( 'github-release://owner/repo/v1.0.0' ) );
	}

	public function test_config_defaults_are_applied(): void {
		$browser = new Browser(
			array(
				'github_token' => 'test-token',
			)
		);

		$parser = $browser->get_uri_parser();

		// Default protocol should be used.
		$this->assertTrue( $parser->is_github_file( 'github-release://owner/repo' ) );
	}

	public function test_strings_config_is_accepted(): void {
		$browser = new Browser(
			array(
				'strings' => array(
					'custom.message' => 'Custom Message Value',
				),
			)
		);

		// Browser should be created successfully with custom strings.
		$this->assertInstanceOf( Browser::class, $browser );
	}
}
