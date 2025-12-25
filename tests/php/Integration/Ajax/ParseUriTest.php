<?php

namespace Arts\GH\ReleaseBrowser\Tests\Integration\Ajax;

use Arts\GH\ReleaseBrowser\Browser;
use WP_Ajax_UnitTestCase;
use WPAjaxDieContinueException;
use WPAjaxDieStopException;

/**
 * Integration tests for ajax_parse_uri handler
 *
 * @group ajax
 */
class ParseUriTest extends WP_Ajax_UnitTestCase {

	private string $action_prefix = 'test_parse_uri';

	public function test_ajax_parse_uri_without_nonce_fails(): void {
		remove_all_actions( "wp_ajax_{$this->action_prefix}_parse_uri" );
		remove_all_actions( "wp_ajax_nopriv_{$this->action_prefix}_parse_uri" );

		new Browser( array( 'action_prefix' => $this->action_prefix ) );

		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$_POST['uri'] = 'github-release://owner/repo/v1.0.0';

		$this->expectException( WPAjaxDieStopException::class );
		$this->expectExceptionMessage( '-1' );

		$this->_handleAjax( "{$this->action_prefix}_parse_uri" );
	}

	public function test_ajax_parse_uri_without_auth_returns_error(): void {
		remove_all_actions( "wp_ajax_{$this->action_prefix}_parse_uri" );
		remove_all_actions( "wp_ajax_nopriv_{$this->action_prefix}_parse_uri" );

		new Browser( array( 'action_prefix' => $this->action_prefix ) );

		wp_set_current_user( 0 );

		$_POST['_wpnonce'] = wp_create_nonce( "{$this->action_prefix}_nonce" );
		$_POST['nonce']    = $_POST['_wpnonce'];
		$_POST['uri']      = 'github-release://owner/repo';

		try {
			$this->_handleAjax( "{$this->action_prefix}_parse_uri" );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
		}

		$this->assertFalse( $response['success'] );
		$this->assertStringContainsString( 'Unauthorized', $response['data']['message'] );
	}

	public function test_ajax_parse_uri_without_uri_returns_error(): void {
		remove_all_actions( "wp_ajax_{$this->action_prefix}_parse_uri" );
		remove_all_actions( "wp_ajax_nopriv_{$this->action_prefix}_parse_uri" );

		new Browser( array( 'action_prefix' => $this->action_prefix ) );

		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$_POST['_wpnonce'] = wp_create_nonce( "{$this->action_prefix}_nonce" );
		$_POST['nonce']    = $_POST['_wpnonce'];

		try {
			$this->_handleAjax( "{$this->action_prefix}_parse_uri" );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
		}

		$this->assertFalse( $response['success'] );
		$this->assertStringContainsString( 'required', $response['data']['message'] );
	}

	public function test_ajax_parse_uri_with_valid_uri(): void {
		remove_all_actions( "wp_ajax_{$this->action_prefix}_parse_uri" );
		remove_all_actions( "wp_ajax_nopriv_{$this->action_prefix}_parse_uri" );

		new Browser( array( 'action_prefix' => $this->action_prefix ) );

		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$_POST['_wpnonce'] = wp_create_nonce( "{$this->action_prefix}_nonce" );
		$_POST['nonce']    = $_POST['_wpnonce'];
		$_POST['uri']      = 'github-release://owner/repo/v1.0.0/asset.zip';

		try {
			$this->_handleAjax( "{$this->action_prefix}_parse_uri" );
		} catch ( WPAjaxDieStopException | WPAjaxDieContinueException $e ) {
			// Expected - either exception type.
		}

		$response = json_decode( $this->_last_response, true );
		$this->assertTrue( $response['success'] );
		$this->assertArrayHasKey( 'parsed', $response['data'] );
		$this->assertSame( 'owner/repo', $response['data']['parsed']['repo'] );
		$this->assertSame( 'v1.0.0', $response['data']['parsed']['release'] );
		$this->assertSame( 'asset.zip', $response['data']['parsed']['asset'] );
	}

	public function test_ajax_parse_uri_with_minimal_uri(): void {
		remove_all_actions( "wp_ajax_{$this->action_prefix}_parse_uri" );
		remove_all_actions( "wp_ajax_nopriv_{$this->action_prefix}_parse_uri" );

		new Browser( array( 'action_prefix' => $this->action_prefix ) );

		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$_POST['_wpnonce'] = wp_create_nonce( "{$this->action_prefix}_nonce" );
		$_POST['nonce']    = $_POST['_wpnonce'];
		$_POST['uri']      = 'github-release://owner/repo';

		try {
			$this->_handleAjax( "{$this->action_prefix}_parse_uri" );
		} catch ( WPAjaxDieStopException | WPAjaxDieContinueException $e ) {
			// Expected - either exception type.
		}

		$response = json_decode( $this->_last_response, true );
		$this->assertTrue( $response['success'] );
		$this->assertSame( 'owner/repo', $response['data']['parsed']['repo'] );
		$this->assertSame( 'latest', $response['data']['parsed']['release'] );
	}
}
