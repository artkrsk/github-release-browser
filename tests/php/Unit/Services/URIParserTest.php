<?php

namespace Arts\GH\ReleaseBrowser\Tests\Unit\Services;

use Arts\GH\ReleaseBrowser\Core\Services\URIParser;
use PHPUnit\Framework\TestCase;
use Brain\Monkey\Functions;

/**
 * Tests for URIParser service
 */
class URIParserTest extends TestCase {
	private URIParser $parser;

	protected function setUp(): void {
		parent::setUp();
		\Brain\Monkey\setUp();

		$this->parser = new URIParser( 'github-release://' );
	}

	protected function tearDown(): void {
		\Brain\Monkey\tearDown();
		parent::tearDown();
	}

	public function test_is_github_file_returns_true_for_valid_uri(): void {
		$result = $this->parser->is_github_file( 'github-release://owner/repo' );

		$this->assertTrue( $result );
	}

	public function test_is_github_file_returns_false_for_invalid_uri(): void {
		$result = $this->parser->is_github_file( 'https://github.com/owner/repo' );

		$this->assertFalse( $result );
	}

	public function test_is_github_file_returns_false_for_empty_string(): void {
		$result = $this->parser->is_github_file( '' );

		$this->assertFalse( $result );
	}

	public function test_parse_extracts_repo_release_and_asset(): void {
		$result = $this->parser->parse( 'github-release://owner/repo/v1.0.0/file.zip' );

		$this->assertTrue( $result['valid'] );
		$this->assertSame( 'owner/repo', $result['repo'] );
		$this->assertSame( 'v1.0.0', $result['release'] );
		$this->assertSame( 'file.zip', $result['asset'] );
	}

	public function test_parse_handles_latest_release_as_default(): void {
		$result = $this->parser->parse( 'github-release://owner/repo' );

		$this->assertTrue( $result['valid'] );
		$this->assertSame( 'owner/repo', $result['repo'] );
		$this->assertSame( 'latest', $result['release'] );
		$this->assertNull( $result['asset'] );
	}

	public function test_parse_handles_release_without_asset(): void {
		$result = $this->parser->parse( 'github-release://owner/repo/v1.0.0' );

		$this->assertTrue( $result['valid'] );
		$this->assertSame( 'owner/repo', $result['repo'] );
		$this->assertSame( 'v1.0.0', $result['release'] );
		$this->assertNull( $result['asset'] );
	}

	public function test_parse_returns_wp_error_for_invalid_protocol(): void {
		$result = $this->parser->parse( 'https://github.com/owner/repo' );

		$this->assertInstanceOf( \WP_Error::class, $result );
	}

	public function test_parse_returns_wp_error_for_insufficient_parts(): void {
		$result = $this->parser->parse( 'github-release://owner' );

		$this->assertInstanceOf( \WP_Error::class, $result );
	}

	public function test_parse_with_invalid_protocol_structure(): void {
		$result = $this->parser->parse( 'not-github://something' );

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_protocol', $result->get_error_code() );
	}

	public function test_build_creates_valid_uri_with_all_parts(): void {
		$parts = array(
			'repo'    => 'owner/repo',
			'release' => 'v1.0.0',
			'asset'   => 'file.zip',
		);

		$result = $this->parser->build( $parts );

		$this->assertSame( 'github-release://owner/repo/v1.0.0/file.zip', $result );
	}

	public function test_build_creates_uri_without_asset(): void {
		$parts = array(
			'repo'    => 'owner/repo',
			'release' => 'v1.0.0',
		);

		$result = $this->parser->build( $parts );

		$this->assertSame( 'github-release://owner/repo/v1.0.0', $result );
	}

	public function test_build_omits_latest_release(): void {
		$parts = array(
			'repo'    => 'owner/repo',
			'release' => 'latest',
		);

		$result = $this->parser->build( $parts );

		$this->assertSame( 'github-release://owner/repo', $result );
	}

	public function test_build_handles_latest_with_asset(): void {
		$parts = array(
			'repo'    => 'owner/repo',
			'release' => 'latest',
			'asset'   => 'file.zip',
		);

		$result = $this->parser->build( $parts );

		$this->assertSame( 'github-release://owner/repo/file.zip', $result );
	}

	public function test_build_only_requires_repo(): void {
		$parts = array(
			'repo' => 'owner/repo',
		);

		$result = $this->parser->build( $parts );

		$this->assertSame( 'github-release://owner/repo', $result );
	}

	public function test_parser_uses_custom_protocol(): void {
		$custom_parser = new URIParser( 'custom-protocol://' );

		$result = $custom_parser->is_github_file( 'custom-protocol://owner/repo' );

		$this->assertTrue( $result );
	}

	// ========================================
	// is_github_dir tests
	// ========================================

	public function test_is_github_dir_returns_true_for_valid_uri(): void {
		$result = $this->parser->is_github_dir( 'github-dir://owner/repo/main' );

		$this->assertTrue( $result );
	}

	public function test_is_github_dir_returns_false_for_release_uri(): void {
		$result = $this->parser->is_github_dir( 'github-release://owner/repo/v1.0.0' );

		$this->assertFalse( $result );
	}

	public function test_is_github_dir_returns_false_for_empty_string(): void {
		$result = $this->parser->is_github_dir( '' );

		$this->assertFalse( $result );
	}

	public function test_is_github_dir_returns_false_for_regular_url(): void {
		$result = $this->parser->is_github_dir( 'https://github.com/owner/repo' );

		$this->assertFalse( $result );
	}

	// ========================================
	// parse_dir tests
	// ========================================

	public function test_parse_dir_extracts_repo_branch_and_path(): void {
		$result = $this->parser->parse_dir( 'github-dir://owner/repo/main/src/components' );

		$this->assertTrue( $result['valid'] );
		$this->assertSame( 'owner/repo', $result['repo'] );
		$this->assertSame( 'main', $result['branch'] );
		$this->assertSame( 'src/components', $result['path'] );
	}

	public function test_parse_dir_handles_root_path(): void {
		$result = $this->parser->parse_dir( 'github-dir://owner/repo/develop' );

		$this->assertTrue( $result['valid'] );
		$this->assertSame( 'owner/repo', $result['repo'] );
		$this->assertSame( 'develop', $result['branch'] );
		$this->assertSame( '', $result['path'] );
	}

	public function test_parse_dir_returns_wp_error_for_invalid_protocol(): void {
		$result = $this->parser->parse_dir( 'github-release://owner/repo/v1.0.0' );

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_protocol', $result->get_error_code() );
	}

	public function test_parse_dir_returns_wp_error_for_insufficient_parts(): void {
		// Needs at least owner/repo/branch (3 parts after protocol)
		$result = $this->parser->parse_dir( 'github-dir://owner/repo' );

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_format', $result->get_error_code() );
	}

	public function test_parse_dir_handles_deeply_nested_paths(): void {
		$result = $this->parser->parse_dir( 'github-dir://owner/repo/feature-branch/src/lib/utils/helpers' );

		$this->assertTrue( $result['valid'] );
		$this->assertSame( 'owner/repo', $result['repo'] );
		$this->assertSame( 'feature-branch', $result['branch'] );
		$this->assertSame( 'src/lib/utils/helpers', $result['path'] );
	}

	// ========================================
	// build_dir tests
	// ========================================

	public function test_build_dir_creates_valid_uri_with_all_parts(): void {
		$parts = array(
			'repo'   => 'owner/repo',
			'branch' => 'main',
			'path'   => 'src/components',
		);

		$result = $this->parser->build_dir( $parts );

		$this->assertSame( 'github-dir://owner/repo/main/src/components', $result );
	}

	public function test_build_dir_creates_uri_without_path(): void {
		$parts = array(
			'repo'   => 'owner/repo',
			'branch' => 'develop',
		);

		$result = $this->parser->build_dir( $parts );

		$this->assertSame( 'github-dir://owner/repo/develop', $result );
	}

	public function test_build_dir_creates_uri_with_empty_path(): void {
		$parts = array(
			'repo'   => 'owner/repo',
			'branch' => 'main',
			'path'   => '',
		);

		$result = $this->parser->build_dir( $parts );

		$this->assertSame( 'github-dir://owner/repo/main', $result );
	}

	public function test_build_dir_creates_uri_with_nested_path(): void {
		$parts = array(
			'repo'   => 'owner/repo',
			'branch' => 'feature/new-feature',
			'path'   => 'packages/core/src',
		);

		$result = $this->parser->build_dir( $parts );

		$this->assertSame( 'github-dir://owner/repo/feature/new-feature/packages/core/src', $result );
	}

	// ========================================
	// Custom dir_protocol test
	// ========================================

	public function test_parser_uses_custom_dir_protocol(): void {
		$custom_parser = new URIParser( 'github-release://', 'custom-dir://' );

		$this->assertTrue( $custom_parser->is_github_dir( 'custom-dir://owner/repo/main' ) );
		$this->assertFalse( $custom_parser->is_github_dir( 'github-dir://owner/repo/main' ) );
	}

	public function test_parse_dir_and_build_dir_roundtrip(): void {
		$original_uri = 'github-dir://owner/repo/main/src/utils';

		$parsed = $this->parser->parse_dir( $original_uri );
		$rebuilt = $this->parser->build_dir( $parsed );

		$this->assertSame( $original_uri, $rebuilt );
	}
}
