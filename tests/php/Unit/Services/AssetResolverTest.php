<?php

namespace Arts\GH\ReleaseBrowser\Tests\Unit\Services;

use Arts\GH\ReleaseBrowser\Core\Services\AssetResolver;
use PHPUnit\Framework\TestCase;

/**
 * Tests for AssetResolver service
 */
class AssetResolverTest extends TestCase {
	private AssetResolver $resolver;

	protected function setUp(): void {
		parent::setUp();
		\Brain\Monkey\setUp();

		$this->resolver = new AssetResolver();
	}

	protected function tearDown(): void {
		\Brain\Monkey\tearDown();
		parent::tearDown();
	}

	public function test_find_asset_returns_first_when_no_pattern(): void {
		$release = array(
			'assets' => array(
				array( 'name' => 'first.zip', 'browser_download_url' => 'https://example.com/first.zip' ),
				array( 'name' => 'second.zip', 'browser_download_url' => 'https://example.com/second.zip' ),
			),
		);

		$result = $this->resolver->find_asset( $release );

		$this->assertIsArray( $result );
		$this->assertSame( 'first.zip', $result['name'] );
	}

	public function test_find_asset_returns_null_when_no_assets(): void {
		$release = array( 'assets' => array() );

		$result = $this->resolver->find_asset( $release );

		$this->assertNull( $result );
	}

	public function test_find_asset_returns_null_when_assets_key_missing(): void {
		$release = array( 'tag_name' => 'v1.0.0' );

		$result = $this->resolver->find_asset( $release );

		$this->assertNull( $result );
	}

	public function test_find_asset_matches_exact_filename(): void {
		$release = array(
			'assets' => array(
				array( 'name' => 'plugin.zip' ),
				array( 'name' => 'plugin-lite.zip' ),
			),
		);

		$result = $this->resolver->find_asset( $release, 'plugin.zip' );

		$this->assertIsArray( $result );
		$this->assertSame( 'plugin.zip', $result['name'] );
	}

	public function test_find_asset_matches_wildcard_pattern(): void {
		$release = array(
			'assets' => array(
				array( 'name' => 'plugin-1.0.0.zip' ),
				array( 'name' => 'source.tar.gz' ),
			),
		);

		$result = $this->resolver->find_asset( $release, '*.zip' );

		$this->assertIsArray( $result );
		$this->assertSame( 'plugin-1.0.0.zip', $result['name'] );
	}

	public function test_find_asset_matches_complex_pattern(): void {
		$release = array(
			'assets' => array(
				array( 'name' => 'plugin-lite.zip' ),
				array( 'name' => 'plugin-pro.zip' ),
				array( 'name' => 'source.tar.gz' ),
			),
		);

		$result = $this->resolver->find_asset( $release, 'plugin-pro.*' );

		$this->assertIsArray( $result );
		$this->assertSame( 'plugin-pro.zip', $result['name'] );
	}

	public function test_find_asset_returns_null_when_pattern_not_found(): void {
		$release = array(
			'assets' => array(
				array( 'name' => 'plugin.zip' ),
			),
		);

		$result = $this->resolver->find_asset( $release, '*.tar.gz' );

		$this->assertNull( $result );
	}

	public function test_find_asset_handles_malformed_assets(): void {
		$release = array(
			'assets' => array(
				'not-an-array',
				array( 'no-name-key' => 'value' ),
				array( 'name' => 'valid.zip' ),
			),
		);

		$result = $this->resolver->find_asset( $release, '*.zip' );

		$this->assertIsArray( $result );
		$this->assertSame( 'valid.zip', $result['name'] );
	}

	public function test_find_asset_in_release_delegates_to_find_asset(): void {
		$release = array(
			'assets' => array(
				array( 'name' => 'file.zip' ),
			),
		);

		$result = $this->resolver->find_asset_in_release( $release, '*.zip' );

		$this->assertIsArray( $result );
		$this->assertSame( 'file.zip', $result['name'] );
	}

	public function test_get_download_url_extracts_url_from_asset(): void {
		$asset = array(
			'name'                 => 'plugin.zip',
			'browser_download_url' => 'https://github.com/owner/repo/releases/download/v1.0.0/plugin.zip',
		);

		$result = $this->resolver->get_download_url( $asset );

		$this->assertSame( 'https://github.com/owner/repo/releases/download/v1.0.0/plugin.zip', $result );
	}

	public function test_get_download_url_returns_empty_string_when_url_missing(): void {
		$asset = array( 'name' => 'plugin.zip' );

		$result = $this->resolver->get_download_url( $asset );

		$this->assertSame( '', $result );
	}

	public function test_get_download_url_returns_empty_string_when_url_not_string(): void {
		$asset = array(
			'name'                 => 'plugin.zip',
			'browser_download_url' => 12345,
		);

		$result = $this->resolver->get_download_url( $asset );

		$this->assertSame( '', $result );
	}

	public function test_format_size_handles_bytes(): void {
		$result = $this->resolver->format_size( 500 );

		$this->assertSame( '500 B', $result );
	}

	public function test_format_size_converts_to_kilobytes(): void {
		$result = $this->resolver->format_size( 1024 );

		$this->assertSame( '1 KB', $result );
	}

	public function test_format_size_converts_to_kilobytes_with_decimals(): void {
		$result = $this->resolver->format_size( 1536 );

		$this->assertSame( '1.5 KB', $result );
	}

	public function test_format_size_converts_to_megabytes(): void {
		$result = $this->resolver->format_size( 1048576 );

		$this->assertSame( '1 MB', $result );
	}

	public function test_format_size_converts_to_megabytes_with_decimals(): void {
		$result = $this->resolver->format_size( 2621440 );

		$this->assertSame( '2.5 MB', $result );
	}

	public function test_format_size_converts_to_gigabytes(): void {
		$result = $this->resolver->format_size( 1073741824 );

		$this->assertSame( '1 GB', $result );
	}

	public function test_format_size_converts_to_terabytes(): void {
		$result = $this->resolver->format_size( 1099511627776 );

		$this->assertSame( '1 TB', $result );
	}

	public function test_format_size_handles_zero(): void {
		$result = $this->resolver->format_size( 0 );

		$this->assertSame( '0 B', $result );
	}

	public function test_format_size_rounds_to_two_decimals(): void {
		$result = $this->resolver->format_size( 1234567 );

		$this->assertSame( '1.18 MB', $result );
	}

	public function test_format_size_stops_at_terabytes(): void {
		// 1024 TB = 1 PB, but we stop at TB
		$result = $this->resolver->format_size( 1125899906842624 );

		$this->assertSame( '1024 TB', $result );
	}
}
