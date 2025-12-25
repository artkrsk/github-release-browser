<?php

namespace Arts\GH\ReleaseBrowser\Tests\Integration\Services;

use Arts\GH\ReleaseBrowser\Core\Services\URIParser;
use WP_UnitTestCase;

/**
 * Integration tests for URIParser service
 *
 * Tests URIParser with real WordPress WP_Error class.
 */
class URIParserTest extends WP_UnitTestCase {

	private URIParser $parser;

	public function set_up(): void {
		parent::set_up();
		$this->parser = new URIParser();
	}

	public function test_parse_returns_wp_error_for_invalid_protocol(): void {
		$result = $this->parser->parse( 'invalid://owner/repo' );

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_protocol', $result->get_error_code() );
	}

	public function test_parse_returns_wp_error_for_invalid_format(): void {
		$result = $this->parser->parse( 'github-release://onlyowner' );

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_format', $result->get_error_code() );
	}

	public function test_parse_valid_uri_returns_array(): void {
		$result = $this->parser->parse( 'github-release://owner/repo/v1.0.0/asset.zip' );

		$this->assertIsArray( $result );
		$this->assertTrue( $result['valid'] );
		$this->assertSame( 'owner/repo', $result['repo'] );
		$this->assertSame( 'v1.0.0', $result['release'] );
		$this->assertSame( 'asset.zip', $result['asset'] );
	}

	public function test_parse_dir_returns_wp_error_for_invalid_protocol(): void {
		$result = $this->parser->parse_dir( 'invalid://owner/repo/main' );

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_protocol', $result->get_error_code() );
	}

	public function test_parse_dir_returns_wp_error_for_invalid_format(): void {
		$result = $this->parser->parse_dir( 'github-dir://owner/repo' );

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_format', $result->get_error_code() );
	}

	public function test_parse_dir_valid_uri_returns_array(): void {
		$result = $this->parser->parse_dir( 'github-dir://owner/repo/main/src/components' );

		$this->assertIsArray( $result );
		$this->assertTrue( $result['valid'] );
		$this->assertSame( 'owner/repo', $result['repo'] );
		$this->assertSame( 'main', $result['branch'] );
		$this->assertSame( 'src/components', $result['path'] );
	}

	public function test_parse_with_custom_protocol(): void {
		$parser = new URIParser( 'my-protocol://', 'my-dir://' );

		$result = $parser->parse( 'my-protocol://owner/repo/v2.0.0' );

		$this->assertIsArray( $result );
		$this->assertTrue( $result['valid'] );
		$this->assertSame( 'owner/repo', $result['repo'] );
		$this->assertSame( 'v2.0.0', $result['release'] );
	}

	public function test_parse_dir_with_custom_protocol(): void {
		$parser = new URIParser( 'my-protocol://', 'my-dir://' );

		$result = $parser->parse_dir( 'my-dir://owner/repo/develop' );

		$this->assertIsArray( $result );
		$this->assertTrue( $result['valid'] );
		$this->assertSame( 'owner/repo', $result['repo'] );
		$this->assertSame( 'develop', $result['branch'] );
	}

	public function test_is_github_file_with_valid_uri(): void {
		$this->assertTrue( $this->parser->is_github_file( 'github-release://owner/repo' ) );
	}

	public function test_is_github_file_with_invalid_uri(): void {
		$this->assertFalse( $this->parser->is_github_file( 'https://github.com/owner/repo' ) );
	}

	public function test_is_github_dir_with_valid_uri(): void {
		$this->assertTrue( $this->parser->is_github_dir( 'github-dir://owner/repo/main' ) );
	}

	public function test_is_github_dir_with_invalid_uri(): void {
		$this->assertFalse( $this->parser->is_github_dir( 'github-release://owner/repo' ) );
	}

	public function test_build_creates_valid_uri(): void {
		$uri = $this->parser->build(
			array(
				'repo'    => 'owner/repo',
				'release' => 'v1.0.0',
				'asset'   => 'file.zip',
			)
		);

		$this->assertSame( 'github-release://owner/repo/v1.0.0/file.zip', $uri );
	}

	public function test_build_omits_latest_release(): void {
		$uri = $this->parser->build(
			array(
				'repo'    => 'owner/repo',
				'release' => 'latest',
			)
		);

		$this->assertSame( 'github-release://owner/repo', $uri );
	}

	public function test_build_dir_creates_valid_uri(): void {
		$uri = $this->parser->build_dir(
			array(
				'repo'   => 'owner/repo',
				'branch' => 'main',
				'path'   => 'src/components',
			)
		);

		$this->assertSame( 'github-dir://owner/repo/main/src/components', $uri );
	}

	public function test_build_dir_without_path(): void {
		$uri = $this->parser->build_dir(
			array(
				'repo'   => 'owner/repo',
				'branch' => 'develop',
			)
		);

		$this->assertSame( 'github-dir://owner/repo/develop', $uri );
	}

	public function test_roundtrip_parse_and_build(): void {
		$original = 'github-release://owner/repo/v1.0.0/asset.zip';

		$parsed = $this->parser->parse( $original );
		$this->assertIsArray( $parsed );

		$rebuilt = $this->parser->build(
			array(
				'repo'    => $parsed['repo'],
				'release' => $parsed['release'],
				'asset'   => $parsed['asset'],
			)
		);

		$this->assertSame( $original, $rebuilt );
	}

	public function test_roundtrip_parse_dir_and_build_dir(): void {
		$original = 'github-dir://owner/repo/main/path/to/folder';

		$parsed = $this->parser->parse_dir( $original );
		$this->assertIsArray( $parsed );

		$rebuilt = $this->parser->build_dir(
			array(
				'repo'   => $parsed['repo'],
				'branch' => $parsed['branch'],
				'path'   => $parsed['path'],
			)
		);

		$this->assertSame( $original, $rebuilt );
	}

	public function test_parse_with_special_characters_in_asset(): void {
		$result = $this->parser->parse( 'github-release://owner/repo/v1.0.0/my-file_v1.2.3.tar.gz' );

		$this->assertIsArray( $result );
		$this->assertSame( 'my-file_v1.2.3.tar.gz', $result['asset'] );
	}

	public function test_parse_without_asset(): void {
		$result = $this->parser->parse( 'github-release://owner/repo/v1.0.0' );

		$this->assertIsArray( $result );
		$this->assertTrue( $result['valid'] );
		$this->assertSame( 'owner/repo', $result['repo'] );
		$this->assertSame( 'v1.0.0', $result['release'] );
		$this->assertNull( $result['asset'] );
	}

	public function test_parse_minimal_uri(): void {
		$result = $this->parser->parse( 'github-release://owner/repo' );

		$this->assertIsArray( $result );
		$this->assertTrue( $result['valid'] );
		$this->assertSame( 'owner/repo', $result['repo'] );
		$this->assertSame( 'latest', $result['release'] );
		$this->assertNull( $result['asset'] );
	}
}
