<?php

namespace Arts\GH\ReleaseBrowser\Core\Interfaces;

interface IHttpClient {
	/**
	 * Make GET request to URL
	 *
	 * @param string                                  $url     URL to request.
	 * @param array<string, string>                   $headers HTTP headers.
	 * @param array{timeout?: int, redirection?: int} $options Request options.
	 * @return \Arts\GH\ReleaseBrowser\Core\Types\Response Response object.
	 */
	public function get( string $url, array $headers = array(), array $options = array() ): \Arts\GH\ReleaseBrowser\Core\Types\Response;
}
