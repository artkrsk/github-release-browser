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
		Functions\when( 'is_wp_error' )->returnArg();

		$result = $this->parser->parse( 'https://github.com/owner/repo' );

		$this->assertInstanceOf( \WP_Error::class, $result );
	}

	public function test_parse_returns_wp_error_for_insufficient_parts(): void {
		Functions\when( 'is_wp_error' )->returnArg();

		$result = $this->parser->parse( 'github-release://owner' );

		$this->assertInstanceOf( \WP_Error::class, $result );
	}

	public function test_parse_with_invalid_protocol_structure(): void {
		Functions\when( 'is_wp_error' )->returnArg();

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
}
