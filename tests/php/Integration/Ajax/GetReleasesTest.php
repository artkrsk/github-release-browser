<?php

namespace Arts\GH\ReleaseBrowser\Tests\Integration\Ajax;

use Arts\GH\ReleaseBrowser\Browser;
use Arts\GH\ReleaseBrowser\Core\Interfaces\IPlatformAPI;
use WP_Ajax_UnitTestCase;
use WPAjaxDieContinueException;
use WPAjaxDieStopException;

/**
 * Integration tests for ajax_get_releases handler
 *
 * @group ajax
 */
class GetReleasesTest extends WP_Ajax_UnitTestCase {

	private string $action_prefix = 'test_ajax_browser';

	public function test_ajax_get_releases_without_nonce_fails(): void {
		remove_all_actions( "wp_ajax_{$this->action_prefix}_get_releases" );
		remove_all_actions( "wp_ajax_nopriv_{$this->action_prefix}_get_releases" );

		new Browser( array( 'action_prefix' => $this->action_prefix ) );

		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$_POST['repo'] = 'owner/repo';
		$_POST['page'] = 1;

		$this->expectException( WPAjaxDieStopException::class );
		$this->expectExceptionMessage( '-1' );

		$this->_handleAjax( "{$this->action_prefix}_get_releases" );
	}

	public function test_ajax_get_releases_without_auth_returns_error(): void {
		remove_all_actions( "wp_ajax_{$this->action_prefix}_get_releases" );
		remove_all_actions( "wp_ajax_nopriv_{$this->action_prefix}_get_releases" );

		new Browser( array( 'action_prefix' => $this->action_prefix ) );

		wp_set_current_user( 0 );

		$_POST['_wpnonce'] = wp_create_nonce( "{$this->action_prefix}_nonce" );
		$_POST['nonce']    = $_POST['_wpnonce'];
		$_POST['repo']     = 'owner/repo';

		try {
			$this->_handleAjax( "{$this->action_prefix}_get_releases" );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
		}

		$this->assertFalse( $response['success'] );
		$this->assertStringContainsString( 'Unauthorized', $response['data']['message'] );
	}

	public function test_ajax_get_releases_without_repo_returns_error(): void {
		remove_all_actions( "wp_ajax_{$this->action_prefix}_get_releases" );
		remove_all_actions( "wp_ajax_nopriv_{$this->action_prefix}_get_releases" );

		new Browser( array( 'action_prefix' => $this->action_prefix ) );

		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$_POST['_wpnonce'] = wp_create_nonce( "{$this->action_prefix}_nonce" );
		$_POST['nonce']    = $_POST['_wpnonce'];

		try {
			$this->_handleAjax( "{$this->action_prefix}_get_releases" );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
		}

		$this->assertFalse( $response['success'] );
		$this->assertStringContainsString( 'required', $response['data']['message'] );
	}

	public function test_ajax_get_releases_with_valid_request(): void {
		remove_all_actions( "wp_ajax_{$this->action_prefix}_get_releases" );
		remove_all_actions( "wp_ajax_nopriv_{$this->action_prefix}_get_releases" );

		$mock_api = $this->createMock( IPlatformAPI::class );
		$mock_api->method( 'get_releases' )
			->willReturn(
				array(
					array( 'tag_name' => 'v1.0.0' ),
					array( 'tag_name' => 'v0.9.0' ),
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
		$_POST['repo']     = 'owner/repo';
		$_POST['page']     = 1;

		try {
			$this->_handleAjax( "{$this->action_prefix}_get_releases" );
		} catch ( WPAjaxDieStopException | WPAjaxDieContinueException $e ) {
			// Expected - either exception type.
		}

		$response = json_decode( $this->_last_response, true );
		$this->assertTrue( $response['success'] );
		$this->assertArrayHasKey( 'releases', $response['data'] );
		$this->assertCount( 2, $response['data']['releases'] );
	}

	public function test_ajax_get_releases_sanitizes_repo_parameter(): void {
		remove_all_actions( "wp_ajax_{$this->action_prefix}_get_releases" );
		remove_all_actions( "wp_ajax_nopriv_{$this->action_prefix}_get_releases" );

		// sanitize_text_field strips script tags entirely, leaving empty string
		// So we expect an error response, not a call to get_releases
		$mock_api = $this->createMock( IPlatformAPI::class );
		$mock_api->expects( $this->never() )
			->method( 'get_releases' );

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
		$_POST['repo']     = '<script>owner/repo</script>';
		$_POST['page']     = 1;

		try {
			$this->_handleAjax( "{$this->action_prefix}_get_releases" );
		} catch ( WPAjaxDieStopException | WPAjaxDieContinueException $e ) {
			// Expected - handler returns error for empty repo after sanitization.
		}

		$response = json_decode( $this->_last_response, true );
		$this->assertFalse( $response['success'] );
		$this->assertStringContainsString( 'required', $response['data']['message'] );
	}

	public function test_ajax_get_releases_handles_exception(): void {
		remove_all_actions( "wp_ajax_{$this->action_prefix}_get_releases" );
		remove_all_actions( "wp_ajax_nopriv_{$this->action_prefix}_get_releases" );

		$mock_api = $this->createMock( IPlatformAPI::class );
		$mock_api->method( 'get_releases' )
			->willThrowException( new \Exception( 'API Error' ) );

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
		$_POST['repo']     = 'owner/repo';

		try {
			$this->_handleAjax( "{$this->action_prefix}_get_releases" );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
		}

		$this->assertFalse( $response['success'] );
		$this->assertSame( 'API Error', $response['data']['message'] );
	}

	public function test_ajax_get_releases_converts_page_to_int(): void {
		remove_all_actions( "wp_ajax_{$this->action_prefix}_get_releases" );
		remove_all_actions( "wp_ajax_nopriv_{$this->action_prefix}_get_releases" );

		$mock_api = $this->createMock( IPlatformAPI::class );
		$mock_api->expects( $this->once() )
			->method( 'get_releases' )
			->with( 'owner/repo', 2 )
			->willReturn( array() );

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
		$_POST['repo']     = 'owner/repo';
		$_POST['page']     = '2';

		try {
			$this->_handleAjax( "{$this->action_prefix}_get_releases" );
		} catch ( WPAjaxDieStopException | WPAjaxDieContinueException $e ) {
			// Mock expectation verified.
		}
	}
}
