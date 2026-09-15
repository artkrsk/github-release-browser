<?php

namespace Arts\GH\ReleaseBrowser\Tests\Integration\Ajax;

use Arts\GH\ReleaseBrowser\Browser;
use WP_Ajax_UnitTestCase;
use WPAjaxDieContinueException;
use WPAjaxDieStopException;

/**
 * Integration tests for ajax_get_download_url — the handler that attaches the configured GitHub
 * token as a Bearer header. Two properties matter most here and had no coverage before this suite:
 * the capability floor is driven by config (not hardcoded, not silently `read`), and the token is
 * never sent anywhere but api.github.com.
 *
 * @group ajax
 */
class GetDownloadUrlTest extends WP_Ajax_UnitTestCase {

	private string $action_prefix = 'test_download_url_ajax';

	/** A syntactically valid GitHub API asset URL — used whenever the host check isn't what's under test. */
	private const VALID_ASSET_URL = 'https://api.github.com/repos/owner/repo/releases/assets/123';

	public function tear_down(): void {
		remove_all_filters( 'pre_http_request' );
		parent::tear_down();
	}

	private function clear_handlers(): void {
		remove_all_actions( "wp_ajax_{$this->action_prefix}_get_download_url" );
		remove_all_actions( "wp_ajax_nopriv_{$this->action_prefix}_get_download_url" );
	}

	private function set_nonce(): void {
		$_POST['_wpnonce'] = wp_create_nonce( "{$this->action_prefix}_nonce" );
		$_POST['nonce']    = $_POST['_wpnonce'];
	}

	/**
	 * Fails the test if a request to the asset URL under test is ever attempted — proves a guard
	 * short-circuits before any request. Scoped to the exact URLs this file exercises, not every
	 * request: WP core's own background checks (e.g. wp_version_check()) can fire mid-test and must
	 * pass through untouched, or this filter would fail tests unrelated to what it's guarding.
	 */
	private function forbid_http_requests(): void {
		add_filter(
			'pre_http_request',
			function ( $preempt, $parsed_args, $url ) {
				if ( 0 !== strpos( $url, self::VALID_ASSET_URL ) && false === strpos( $url, 'evil.example.com' ) && false === strpos( $url, 'api.github.com' ) ) {
					return $preempt;
				}

				$this->fail( "No HTTP request should have been attempted, got: {$url}" );
			},
			10,
			3
		);
	}

	public function test_without_nonce_fails(): void {
		$this->clear_handlers();
		new Browser( array( 'action_prefix' => $this->action_prefix ) );

		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$_POST['asset_url'] = self::VALID_ASSET_URL;

		$this->expectException( WPAjaxDieStopException::class );
		$this->expectExceptionMessage( '-1' );

		$this->_handleAjax( "{$this->action_prefix}_get_download_url" );
	}

	public function test_logged_out_returns_error(): void {
		$this->clear_handlers();
		$this->forbid_http_requests();
		new Browser( array( 'action_prefix' => $this->action_prefix ) );

		wp_set_current_user( 0 );
		$this->set_nonce();
		$_POST['asset_url'] = self::VALID_ASSET_URL;

		try {
			$this->_handleAjax( "{$this->action_prefix}_get_download_url" );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
		}

		$this->assertFalse( $response['success'] );
		$this->assertSame( 'Unauthorized', $response['data']['message'] );
	}

	/**
	 * The floor moved up from `read` (which every subscriber holds) — a subscriber must still be
	 * refused, even with the default `manage_options` configured capability.
	 */
	public function test_subscriber_is_refused_with_default_capability(): void {
		$this->clear_handlers();
		$this->forbid_http_requests();
		new Browser( array( 'action_prefix' => $this->action_prefix ) );

		$user_id = $this->factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $user_id );
		$this->set_nonce();
		$_POST['asset_url'] = self::VALID_ASSET_URL;

		try {
			$this->_handleAjax( "{$this->action_prefix}_get_download_url" );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
		}

		$this->assertFalse( $response['success'] );
		$this->assertSame( 'Unauthorized', $response['data']['message'] );
	}

	/**
	 * Half of the pair that proves the capability comes from config rather than being hardcoded: an
	 * editor (holds `edit_posts`, not `manage_options`) is refused under the default config. The other
	 * half is the next test — split across two methods because _handleAjax() only supports one call
	 * per test.
	 */
	public function test_editor_is_refused_under_default_capability(): void {
		$this->clear_handlers();
		$this->forbid_http_requests();
		new Browser( array( 'action_prefix' => $this->action_prefix ) );

		$user_id = $this->factory()->user->create( array( 'role' => 'editor' ) );
		wp_set_current_user( $user_id );
		$this->set_nonce();
		$_POST['asset_url'] = self::VALID_ASSET_URL;

		try {
			$this->_handleAjax( "{$this->action_prefix}_get_download_url" );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
		}

		$this->assertFalse( $response['success'], 'editor must not pass the default manage_options gate' );
		$this->assertSame( 'Unauthorized', $response['data']['message'] );
	}

	/** The other half: the same editor role, admitted past the capability gate once the config names
	 * a capability it holds. A non-302 response falls back to the handler's own success path
	 * (`download_url` = the original asset URL, unrelated to this test) — which is itself proof the
	 * code reached the HTTP call at all, i.e. got past the capability check rather than refusing it. */
	public function test_editor_passes_capability_gate_when_configured_capability_matches(): void {
		$this->clear_handlers();
		new Browser(
			array(
				'action_prefix' => $this->action_prefix,
				'capability'    => 'edit_posts',
			)
		);

		$user_id = $this->factory()->user->create( array( 'role' => 'editor' ) );
		wp_set_current_user( $user_id );
		$this->set_nonce();
		$_POST['asset_url'] = self::VALID_ASSET_URL;

		add_filter(
			'pre_http_request',
			function ( $preempt, $parsed_args, $url ) {
				if ( $url !== self::VALID_ASSET_URL ) {
					return $preempt;
				}

				return new \WP_Error( 'test_short_circuit', 'stop before a real network call' );
			},
			10,
			3
		);

		try {
			$this->_handleAjax( "{$this->action_prefix}_get_download_url" );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
		}

		$this->assertTrue( $response['success'], 'a non-Unauthorized outcome proves the capability gate was passed' );
		$this->assertSame( self::VALID_ASSET_URL, $response['data']['download_url'] );
	}

	public function test_missing_asset_url_returns_error(): void {
		$this->clear_handlers();
		$this->forbid_http_requests();
		new Browser( array( 'action_prefix' => $this->action_prefix ) );

		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );
		$this->set_nonce();

		try {
			$this->_handleAjax( "{$this->action_prefix}_get_download_url" );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
		}

		$this->assertFalse( $response['success'] );
		$this->assertStringContainsString( 'required', $response['data']['message'] );
	}

	/**
	 * The fix this test suite exists to pin: the request carries the configured token as a Bearer
	 * header, so a caller-chosen destination host must be refused BEFORE that request is built —
	 * asserted here by making any HTTP attempt fail the test outright.
	 */
	public function test_non_github_host_is_refused_and_no_request_is_made(): void {
		$this->clear_handlers();
		$this->forbid_http_requests();
		new Browser(
			array(
				'action_prefix' => $this->action_prefix,
				'github_token'  => 'super-secret-token',
			)
		);

		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );
		$this->set_nonce();
		$_POST['asset_url'] = 'https://evil.example.com/steal-token?redirect=api.github.com';

		try {
			$this->_handleAjax( "{$this->action_prefix}_get_download_url" );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
		}

		$this->assertFalse( $response['success'] );
		$this->assertStringContainsString( 'GitHub API URL', $response['data']['message'] );
	}

	/** A plain http:// (not https) GitHub-looking host must also be refused — scheme matters, not just host. */
	public function test_non_https_scheme_is_refused(): void {
		$this->clear_handlers();
		$this->forbid_http_requests();
		new Browser( array( 'action_prefix' => $this->action_prefix ) );

		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );
		$this->set_nonce();
		$_POST['asset_url'] = 'http://api.github.com/repos/owner/repo/releases/assets/123';

		try {
			$this->_handleAjax( "{$this->action_prefix}_get_download_url" );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
		}

		$this->assertFalse( $response['success'] );
		$this->assertStringContainsString( 'GitHub API URL', $response['data']['message'] );
	}

	public function test_valid_request_returns_the_redirect_location(): void {
		$this->clear_handlers();
		new Browser(
			array(
				'action_prefix' => $this->action_prefix,
				'github_token'  => 'super-secret-token',
			)
		);

		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );
		$this->set_nonce();
		$_POST['asset_url'] = self::VALID_ASSET_URL;

		add_filter(
			'pre_http_request',
			function ( $preempt, $parsed_args, $url ) {
				// Let anything else through untouched — WP core's own background checks (e.g.
				// wp_version_check()) can fire mid-test and are not what this test is about.
				if ( $url !== self::VALID_ASSET_URL ) {
					return $preempt;
				}

				// Confirm the token reached exactly this request, and nowhere else.
				$this->assertSame( 'Bearer super-secret-token', $parsed_args['headers']['Authorization'] ?? null );

				return array(
					'headers'  => array( 'location' => 'https://objects.githubusercontent.com/signed-asset' ),
					'body'     => '',
					'response' => array( 'code' => 302, 'message' => 'Found' ),
					'cookies'  => array(),
					'filename' => null,
				);
			},
			10,
			3
		);

		try {
			$this->_handleAjax( "{$this->action_prefix}_get_download_url" );
		} catch ( WPAjaxDieContinueException $e ) {
			$response = json_decode( $this->_last_response, true );
		}

		$this->assertTrue( $response['success'] );
		$this->assertSame( 'https://objects.githubusercontent.com/signed-asset', $response['data']['download_url'] );
	}
}
