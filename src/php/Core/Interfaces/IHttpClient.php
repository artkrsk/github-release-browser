<?php

namespace Arts\GH\ReleaseBrowser\Core\Interfaces;

interface IHttpClient {
	/**
	 * Make GET request to URL
	 *
	 * @param string                                                                                     $url     URL to request.
	 * @param array<string, string>                                                                      $headers HTTP headers.
	 * @param array{timeout?: int, redirection?: int, stream?: bool, filename?: string, max_bytes?: int} $options Request options.
	 *        `stream` + `filename` write the body to disk instead of memory; the returned Response then
	 *        carries an empty `body` and the caller reads the file. Release assets are multi-MB, so any
	 *        caller fetching one must stream rather than buffer it. `max_bytes` cuts the body off at
	 *        that many bytes without changing the status, so a caller that must detect an oversized
	 *        response asks for one byte more than it accepts.
	 * @return \Arts\GH\ReleaseBrowser\Core\Types\Response|\WP_Error Any HTTP response, whatever its status; a
	 *         `\WP_Error` only when the transport failed before one arrived.
	 */
	public function get( string $url, array $headers = array(), array $options = array() ): \Arts\GH\ReleaseBrowser\Core\Types\Response|\WP_Error;
}
