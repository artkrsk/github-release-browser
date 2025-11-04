<?php

namespace Arts\GH\ReleaseBrowser\Core\Interfaces;

interface IHttpClient {
	/**
	 * Make GET request to URL
	 *
	 * @param string $url     URL to request.
	 * @param array  $headers HTTP headers.
	 * @param array  $options Request options.
	 * @return mixed Response object.
	 */
	public function get( string $url, array $headers = array(), array $options = array() );
}
