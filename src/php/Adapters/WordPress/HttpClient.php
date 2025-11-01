<?php

namespace Arts\GH\ReleaseBrowser\Adapters\WordPress;

use Arts\GH\ReleaseBrowser\Core\Interfaces\IHttpClient;
use Arts\GH\ReleaseBrowser\Core\Types\Response;

/**
 * WordPress HTTP Client adapter
 * Implements IHttpClient using WordPress's wp_remote_get
 */
class HttpClient implements IHttpClient {
	public function get( string $url, array $headers = array(), array $options = array() ): Response {
		$args = array(
			'headers' => $headers,
			'timeout' => $options['timeout'] ?? 30,
		);

		$response = wp_remote_get( $url, $args );

		if ( is_wp_error( $response ) ) {
			return new Response(
				500,
				'WordPress HTTP Error: ' . wp_remote_retrieve_body( $response ),
				array()
			);
		}

		$response_code    = wp_remote_retrieve_response_code( $response );
		$response_body    = wp_remote_retrieve_body( $response );
		$response_headers = wp_remote_retrieve_headers( $response );

		return new Response(
			$response_code,
			$response_body,
			$response_headers
		);
	}
}
