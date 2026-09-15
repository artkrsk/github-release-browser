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
	 *        caller fetching one must stream rather than buffer it.
	 * @return \Arts\GH\ReleaseBrowser\Core\Types\Response Response object.
	 */
	public function get( string $url, array $headers = array(), array $options = array() ): \Arts\GH\ReleaseBrowser\Core\Types\Response;
}
