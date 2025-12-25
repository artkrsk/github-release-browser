<?php

namespace Arts\GH\ReleaseBrowser\Tests\Integration\Ajax;

use Arts\GH\ReleaseBrowser\Browser;
use Arts\GH\ReleaseBrowser\Core\Interfaces\IPlatformAPI;
use WP_Ajax_UnitTestCase;
use WPAjaxDieContinueException;
use WPAjaxDieStopException;

/**
 * Integration tests for ajax_test_file handler
 *
 * @group ajax
 */
class TestFileTest extends WP_Ajax_UnitTestCase {

	private string $action_prefix = 'test_file_ajax';

	public function test_ajax_test_file_without_nonce_fails(): void {
		remove_all_actions( "wp_ajax_{$this->action_prefix}_test_file" );
		remove_all_actions( "wp_ajax_nopriv_{$this->action_prefix}_test_file" );

		new Browser( array( 'action_prefix' => $this->action_prefix ) );

		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$_POST['file_url'] = 'github-release://owner/repo/v1.0.0/plugin.zip';

		$this->expectException( WPAjaxDieStopException::class );
		$this->expectExceptionMessage( '-1' );

		$this->_handleAjax( "{$this->action_prefix}_test_file" );
	}

	public function test_ajax_test_file_without_auth_returns_error(): void {
		remove_all_actions( "wp_ajax_{$this->action_prefix}_test_file" );
		remove_all_actions( "wp_ajax_nopriv_{$this->action_prefix}_test_file" );

		new Browser( array( 'action_prefix' => $this->action_prefix ) );

		wp_set_current_user( 0 );

		$_POST['_wpnonce'] = wp_create_nonce( "{$this->action_prefix}_nonce" );
		$_POST['nonce']    = $_POST['_wpnonce'];
		$_POST['file_url'] = 'github-release://owner/repo/v1.0.0/plugin.zip';

		try {
			$this->_handleAjax( "{$this->action_prefix}_test_file" );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
		}

		$this->assertFalse( $response['success'] );
		$this->assertSame( 'Unauthorized', $response['data']['message'] );
	}

	public function test_ajax_test_file_without_file_url_returns_error(): void {
		remove_all_actions( "wp_ajax_{$this->action_prefix}_test_file" );
		remove_all_actions( "wp_ajax_nopriv_{$this->action_prefix}_test_file" );

		new Browser( array( 'action_prefix' => $this->action_prefix ) );

		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$_POST['_wpnonce'] = wp_create_nonce( "{$this->action_prefix}_nonce" );
		$_POST['nonce']    = $_POST['_wpnonce'];

		try {
			$this->_handleAjax( "{$this->action_prefix}_test_file" );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
		}

		$this->assertFalse( $response['success'] );
		$this->assertSame( 'Invalid GitHub file URL', $response['data']['message'] );
	}

	public function test_ajax_test_file_rejects_non_github_url(): void {
		remove_all_actions( "wp_ajax_{$this->action_prefix}_test_file" );
		remove_all_actions( "wp_ajax_nopriv_{$this->action_prefix}_test_file" );

		new Browser( array( 'action_prefix' => $this->action_prefix ) );

		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$_POST['_wpnonce'] = wp_create_nonce( "{$this->action_prefix}_nonce" );
		$_POST['nonce']    = $_POST['_wpnonce'];
		$_POST['file_url'] = 'https://example.com/file.zip';

		try {
			$this->_handleAjax( "{$this->action_prefix}_test_file" );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
		}

		$this->assertFalse( $response['success'] );
		$this->assertSame( 'Invalid GitHub file URL', $response['data']['message'] );
	}

	public function test_ajax_test_file_with_valid_asset(): void {
		remove_all_actions( "wp_ajax_{$this->action_prefix}_test_file" );
		remove_all_actions( "wp_ajax_nopriv_{$this->action_prefix}_test_file" );

		$mock_api = $this->createMock( IPlatformAPI::class );
		$mock_api->method( 'get_release_by_tag' )
			->willReturn(
				array(
					'tag_name' => 'v1.0.0',
					'assets'   => array(
						array(
							'name'         => 'plugin.zip',
							'size'         => 1024,
							'content_type' => 'application/zip',
						),
					),
				)
			);

		new Browser(
			array(
				'action_prefix' => $this->action_prefix,
			),
			$mock_api
		);

		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$_POST['_wpnonce'] = wp_create_nonce( "{$this->action_prefix}_nonce" );
		$_POST['nonce']    = $_POST['_wpnonce'];
		$_POST['file_url'] = 'github-release://owner/repo/v1.0.0/plugin.zip';

		try {
			$this->_handleAjax( "{$this->action_prefix}_test_file" );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
		}

		$this->assertTrue( $response['success'] );
		$this->assertSame( 'ready', $response['data']['status'] );
		$this->assertSame( 1024, $response['data']['size'] );
		$this->assertSame( 'application/zip', $response['data']['type'] );
		$this->assertSame( 'plugin.zip', $response['data']['name'] );
	}

	public function test_ajax_test_file_with_nonexistent_asset(): void {
		remove_all_actions( "wp_ajax_{$this->action_prefix}_test_file" );
		remove_all_actions( "wp_ajax_nopriv_{$this->action_prefix}_test_file" );

		$mock_api = $this->createMock( IPlatformAPI::class );
		$mock_api->method( 'get_release_by_tag' )
			->willReturn(
				array(
					'tag_name' => 'v1.0.0',
					'assets'   => array(
						array(
							'name'         => 'other.zip',
							'size'         => 1024,
							'content_type' => 'application/zip',
						),
					),
				)
			);

		new Browser(
			array(
				'action_prefix' => $this->action_prefix,
			),
			$mock_api
		);

		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$_POST['_wpnonce'] = wp_create_nonce( "{$this->action_prefix}_nonce" );
		$_POST['nonce']    = $_POST['_wpnonce'];
		$_POST['file_url'] = 'github-release://owner/repo/v1.0.0/missing.zip';

		try {
			$this->_handleAjax( "{$this->action_prefix}_test_file" );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
		}

		$this->assertFalse( $response['success'] );
		$this->assertStringContainsString( 'not found', $response['data']['message'] );
	}

	public function test_ajax_test_file_clears_cache_before_check(): void {
		remove_all_actions( "wp_ajax_{$this->action_prefix}_test_file" );
		remove_all_actions( "wp_ajax_nopriv_{$this->action_prefix}_test_file" );

		$mock_api = $this->createMock( IPlatformAPI::class );
		$mock_api->expects( $this->once() )
			->method( 'clear_cache' )
			->with( 'release_owner/repo_v1.0.0' );

		$mock_api->method( 'get_release_by_tag' )
			->willReturn(
				array(
					'tag_name' => 'v1.0.0',
					'assets'   => array(
						array(
							'name'         => 'plugin.zip',
							'size'         => 1024,
							'content_type' => 'application/zip',
						),
					),
				)
			);

		new Browser(
			array(
				'action_prefix' => $this->action_prefix,
			),
			$mock_api
		);

		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$_POST['_wpnonce'] = wp_create_nonce( "{$this->action_prefix}_nonce" );
		$_POST['nonce']    = $_POST['_wpnonce'];
		$_POST['file_url'] = 'github-release://owner/repo/v1.0.0/plugin.zip';

		try {
			$this->_handleAjax( "{$this->action_prefix}_test_file" );
		} catch ( WPAjaxDieContinueException $e ) {
			// Mock expectation verified.
		}
	}
}
