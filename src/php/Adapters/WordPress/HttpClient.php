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
	 * @param string                                  $url     URL to request.
	 * @param array<string, string>                   $headers HTTP headers.
	 * @param array{timeout?: int, redirection?: int} $options Request options.
	 * @return Response Response object.
	 */
	public function get( string $url, array $headers = array(), array $options = array() ): Response {
		$timeout     = $options['timeout'] ?? 30;
		$redirection = $options['redirection'] ?? 5;

		$args = array(
			'headers'     => $headers,
			'timeout'     => $timeout,
			'redirection' => $redirection,
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
		$raw_headers = is_array( $response_headers ) ? $response_headers : $response_headers->getAll();
		/** @var array<string, string> $headers_array */
		$headers_array = array();
		foreach ( $raw_headers as $key => $value ) {
			if ( is_string( $key ) && is_string( $value ) ) {
				$headers_array[ $key ] = $value;
			}
		}

		return new Response(
			is_int( $response_code ) ? $response_code : 500,
			$response_body,
			$headers_array
		);
	}
}
