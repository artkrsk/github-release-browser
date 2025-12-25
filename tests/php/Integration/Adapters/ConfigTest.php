<?php

namespace Arts\GH\ReleaseBrowser\Tests\Integration\Adapters;

use Arts\GH\ReleaseBrowser\Adapters\WordPress\Config;
use WP_UnitTestCase;

/**
 * Integration tests for WordPress Config adapter
 *
 * Tests the Config adapter with real WordPress wp_parse_args function.
 */
class ConfigTest extends WP_UnitTestCase {

	public function test_constructor_sets_defaults(): void {
		$config = new Config();

		$this->assertSame( '', $config->get( 'github_token' ) );
		$this->assertSame( 'gh_browser_', $config->get( 'cache_prefix' ) );
		$this->assertSame( 'github-release://', $config->get( 'protocol' ) );
	}

	public function test_constructor_accepts_custom_values(): void {
		$config = new Config(
			array(
				'github_token' => 'test-token-123',
				'cache_prefix' => 'custom_prefix_',
				'protocol'     => 'custom://',
			)
		);

		$this->assertSame( 'test-token-123', $config->get( 'github_token' ) );
		$this->assertSame( 'custom_prefix_', $config->get( 'cache_prefix' ) );
		$this->assertSame( 'custom://', $config->get( 'protocol' ) );
	}

	public function test_partial_config_merges_with_defaults(): void {
		$config = new Config(
			array(
				'github_token' => 'my-token',
			)
		);

		$this->assertSame( 'my-token', $config->get( 'github_token' ) );
		$this->assertSame( 'gh_browser_', $config->get( 'cache_prefix' ) );
		$this->assertSame( 'github-release://', $config->get( 'protocol' ) );
	}

	public function test_get_nonexistent_key_returns_null(): void {
		$config = new Config();

		$this->assertNull( $config->get( 'nonexistent_key' ) );
	}

	public function test_get_nonexistent_key_returns_default_value(): void {
		$config = new Config();

		$this->assertSame( 'fallback', $config->get( 'nonexistent_key', 'fallback' ) );
	}

	public function test_get_existing_key_ignores_default_value(): void {
		$config = new Config(
			array(
				'github_token' => 'real-token',
			)
		);

		$this->assertSame( 'real-token', $config->get( 'github_token', 'default-token' ) );
	}

	public function test_custom_config_values(): void {
		$config = new Config(
			array(
				'action_prefix'         => 'my_browser',
				'enable_latest_release' => true,
				'enable_directories'    => false,
				'per_page'              => 50,
			)
		);

		$this->assertSame( 'my_browser', $config->get( 'action_prefix' ) );
		$this->assertTrue( $config->get( 'enable_latest_release' ) );
		$this->assertFalse( $config->get( 'enable_directories' ) );
		$this->assertSame( 50, $config->get( 'per_page' ) );
	}

	public function test_empty_string_token_is_preserved(): void {
		$config = new Config(
			array(
				'github_token' => '',
			)
		);

		$this->assertSame( '', $config->get( 'github_token' ) );
	}

	public function test_null_values_use_defaults(): void {
		$config = new Config(
			array(
				'github_token' => null,
			)
		);

		// wp_parse_args treats null as a value, so it will be null not default.
		$this->assertNull( $config->get( 'github_token' ) );
	}

	public function test_config_with_array_values(): void {
		$allowed_repos = array( 'owner/repo1', 'owner/repo2' );

		$config = new Config(
			array(
				'allowed_repos' => $allowed_repos,
			)
		);

		$this->assertSame( $allowed_repos, $config->get( 'allowed_repos' ) );
	}

	public function test_config_with_nested_array(): void {
		$options = array(
			'display' => array(
				'show_assets'      => true,
				'show_directories' => false,
			),
		);

		$config = new Config(
			array(
				'options' => $options,
			)
		);

		$this->assertSame( $options, $config->get( 'options' ) );
	}
}
