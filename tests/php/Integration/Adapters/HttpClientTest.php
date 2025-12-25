<?php

namespace Arts\GH\ReleaseBrowser\Tests\Integration\Adapters;

use Arts\GH\ReleaseBrowser\Adapters\WordPress\HttpClient;
use Arts\GH\ReleaseBrowser\Core\Types\Response;
use WP_UnitTestCase;

/**
 * Integration tests for WordPress HttpClient adapter
 *
 * Tests the HttpClient adapter with WordPress HTTP API using pre_http_request filter.
 */
class HttpClientTest extends WP_UnitTestCase {

	private HttpClient $client;

	public function set_up(): void {
		parent::set_up();
		$this->client = new HttpClient();
	}

	public function tear_down(): void {
		remove_all_filters( 'pre_http_request' );
		parent::tear_down();
	}

	public function test_get_returns_response_object(): void {
		$this->mock_http_response( 200, '{"success": true}', array( 'content-type' => 'application/json' ) );

		$response = $this->client->get( 'https://api.example.com/test' );

		$this->assertInstanceOf( Response::class, $response );
		$this->assertSame( 200, $response->status_code );
		$this->assertSame( '{"success": true}', $response->body );
	}

	public function test_get_with_custom_headers(): void {
		$captured_args = null;

		add_filter(
			'pre_http_request',
			function ( $preempt, $args, $url ) use ( &$captured_args ) {
				$captured_args = $args;
				return array(
					'response' => array( 'code' => 200 ),
					'body'     => 'OK',
					'headers'  => array(),
				);
			},
			10,
			3
		);

		$this->client->get(
			'https://api.example.com/test',
			array(
				'Authorization' => 'Bearer test-token',
				'X-Custom'      => 'custom-value',
			)
		);

		$this->assertArrayHasKey( 'headers', $captured_args );
		$this->assertSame( 'Bearer test-token', $captured_args['headers']['Authorization'] );
		$this->assertSame( 'custom-value', $captured_args['headers']['X-Custom'] );
	}

	public function test_get_with_custom_timeout(): void {
		$captured_args = null;

		add_filter(
			'pre_http_request',
			function ( $preempt, $args, $url ) use ( &$captured_args ) {
				$captured_args = $args;
				return array(
					'response' => array( 'code' => 200 ),
					'body'     => 'OK',
					'headers'  => array(),
				);
			},
			10,
			3
		);

		$this->client->get(
			'https://api.example.com/test',
			array(),
			array( 'timeout' => 60 )
		);

		$this->assertSame( 60, $captured_args['timeout'] );
	}

	public function test_get_with_custom_redirection(): void {
		$captured_args = null;

		add_filter(
			'pre_http_request',
			function ( $preempt, $args, $url ) use ( &$captured_args ) {
				$captured_args = $args;
				return array(
					'response' => array( 'code' => 200 ),
					'body'     => 'OK',
					'headers'  => array(),
				);
			},
			10,
			3
		);

		$this->client->get(
			'https://api.example.com/test',
			array(),
			array( 'redirection' => 10 )
		);

		$this->assertSame( 10, $captured_args['redirection'] );
	}

	public function test_get_handles_404_response(): void {
		$this->mock_http_response( 404, 'Not Found', array() );

		$response = $this->client->get( 'https://api.example.com/missing' );

		$this->assertSame( 404, $response->status_code );
		$this->assertSame( 'Not Found', $response->body );
	}

	public function test_get_handles_500_response(): void {
		$this->mock_http_response( 500, 'Internal Server Error', array() );

		$response = $this->client->get( 'https://api.example.com/error' );

		$this->assertSame( 500, $response->status_code );
	}

	public function test_get_handles_wp_error(): void {
		add_filter(
			'pre_http_request',
			function () {
				return new \WP_Error( 'http_request_failed', 'Connection timed out' );
			}
		);

		$response = $this->client->get( 'https://api.example.com/timeout' );

		$this->assertSame( 500, $response->status_code );
		$this->assertSame( 'Connection timed out', $response->body );
	}

	public function test_get_parses_response_headers(): void {
		$this->mock_http_response(
			200,
			'OK',
			array(
				'x-ratelimit-remaining' => '59',
				'content-type'          => 'application/json',
			)
		);

		$response = $this->client->get( 'https://api.example.com/test' );

		$this->assertArrayHasKey( 'x-ratelimit-remaining', $response->headers );
		$this->assertSame( '59', $response->headers['x-ratelimit-remaining'] );
	}

	public function test_get_with_json_body(): void {
		$json_data = array(
			'releases' => array(
				array( 'tag_name' => 'v1.0.0' ),
				array( 'tag_name' => 'v0.9.0' ),
			),
		);

		$this->mock_http_response( 200, wp_json_encode( $json_data ), array( 'content-type' => 'application/json' ) );

		$response = $this->client->get( 'https://api.github.com/repos/owner/repo/releases' );

		$this->assertSame( 200, $response->status_code );

		$decoded = json_decode( $response->body, true );
		$this->assertCount( 2, $decoded['releases'] );
	}

	public function test_default_timeout_is_30_seconds(): void {
		$captured_args = null;

		add_filter(
			'pre_http_request',
			function ( $preempt, $args, $url ) use ( &$captured_args ) {
				$captured_args = $args;
				return array(
					'response' => array( 'code' => 200 ),
					'body'     => 'OK',
					'headers'  => array(),
				);
			},
			10,
			3
		);

		$this->client->get( 'https://api.example.com/test' );

		$this->assertSame( 30, $captured_args['timeout'] );
	}

	public function test_default_redirection_is_5(): void {
		$captured_args = null;

		add_filter(
			'pre_http_request',
			function ( $preempt, $args, $url ) use ( &$captured_args ) {
				$captured_args = $args;
				return array(
					'response' => array( 'code' => 200 ),
					'body'     => 'OK',
					'headers'  => array(),
				);
			},
			10,
			3
		);

		$this->client->get( 'https://api.example.com/test' );

		$this->assertSame( 5, $captured_args['redirection'] );
	}

	/**
	 * Mock HTTP response using WordPress pre_http_request filter.
	 *
	 * @param int                   $status_code HTTP status code.
	 * @param string                $body        Response body.
	 * @param array<string, string> $headers     Response headers.
	 */
	private function mock_http_response( int $status_code, string $body, array $headers ): void {
		add_filter(
			'pre_http_request',
			function () use ( $status_code, $body, $headers ) {
				return array(
					'response' => array( 'code' => $status_code ),
					'body'     => $body,
					'headers'  => new \WpOrg\Requests\Utility\CaseInsensitiveDictionary( $headers ),
				);
			}
		);
	}
}
