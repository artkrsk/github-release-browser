<?php

namespace Arts\GH\ReleaseBrowser\Tests\Unit\Types;

use Arts\GH\ReleaseBrowser\Core\Types\Response;
use PHPUnit\Framework\TestCase;

/**
 * Tests for Response type
 */
class ResponseTest extends TestCase {
	protected function setUp(): void {
		parent::setUp();
		\Brain\Monkey\setUp();
	}

	protected function tearDown(): void {
		\Brain\Monkey\tearDown();
		parent::tearDown();
	}

	public function test_creates_response_with_all_properties(): void {
		$response = new Response(
			200,
			'{"success":true}',
			array( 'Content-Type' => 'application/json' )
		);

		$this->assertSame( 200, $response->status_code );
		$this->assertSame( '{"success":true}', $response->body );
		$this->assertSame( array( 'Content-Type' => 'application/json' ), $response->headers );
	}

	public function test_creates_response_with_empty_body(): void {
		$response = new Response( 204, '', array() );

		$this->assertSame( 204, $response->status_code );
		$this->assertSame( '', $response->body );
		$this->assertSame( array(), $response->headers );
	}

	public function test_creates_response_with_error_status(): void {
		$response = new Response(
			404,
			'Not Found',
			array( 'Content-Type' => 'text/plain' )
		);

		$this->assertSame( 404, $response->status_code );
		$this->assertSame( 'Not Found', $response->body );
	}

	public function test_creates_response_with_multiple_headers(): void {
		$headers = array(
			'Content-Type'   => 'application/json',
			'Cache-Control'  => 'no-cache',
			'X-RateLimit'    => '5000',
			'X-RateRemaining' => '4999',
		);

		$response = new Response( 200, '{}', $headers );

		$this->assertSame( $headers, $response->headers );
		$this->assertSame( 'application/json', $response->headers['Content-Type'] );
		$this->assertSame( '5000', $response->headers['X-RateLimit'] );
	}

	public function test_creates_response_with_redirect_status(): void {
		$response = new Response(
			302,
			'',
			array( 'location' => 'https://example.com/redirect' )
		);

		$this->assertSame( 302, $response->status_code );
		$this->assertArrayHasKey( 'location', $response->headers );
		$this->assertSame( 'https://example.com/redirect', $response->headers['location'] );
	}

	public function test_creates_response_with_server_error(): void {
		$response = new Response(
			500,
			'Internal Server Error',
			array()
		);

		$this->assertSame( 500, $response->status_code );
		$this->assertSame( 'Internal Server Error', $response->body );
	}

	public function test_response_properties_are_public(): void {
		$response = new Response( 200, 'test', array() );

		// Should be able to access properties directly
		$this->assertTrue( property_exists( $response, 'status_code' ) );
		$this->assertTrue( property_exists( $response, 'body' ) );
		$this->assertTrue( property_exists( $response, 'headers' ) );
	}

	public function test_creates_response_with_json_body(): void {
		$json = json_encode( array(
			'data' => array( 'id' => 1, 'name' => 'test' ),
			'success' => true,
		) );

		$response = new Response(
			200,
			$json,
			array( 'Content-Type' => 'application/json' )
		);

		$this->assertSame( $json, $response->body );
		$decoded = json_decode( $response->body, true );
		$this->assertTrue( $decoded['success'] );
		$this->assertSame( 'test', $decoded['data']['name'] );
	}
}
