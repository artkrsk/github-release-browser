<?php

namespace Arts\GH\ReleaseBrowser\Adapters\WordPress;

use Arts\GH\ReleaseBrowser\Core\Interfaces\IHttpClient;
use Arts\GH\ReleaseBrowser\Core\Types\Response;

/**
 * WordPress HTTP Client adapter
 * Implements IHttpClient using WordPress's wp_remote_get
 */
class HttpClient implements IHttpClient {
	/**
	 * Make GET request to URL
	 *
	 * @param string $url     URL to request.
	 * @param array  $headers HTTP headers.
	 * @param array  $options Request options.
	 * @return Response Response object.
	 */
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

		// Convert headers to array (WordPress returns CaseInsensitiveDictionary)
		$headers_array = is_array( $response_headers ) ? $response_headers : $response_headers->getAll();

		return new Response(
			$response_code,
			$response_body,
			$headers_array
		);
	}
}
