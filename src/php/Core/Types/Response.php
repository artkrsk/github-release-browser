<?php
namespace Arts\GH\ReleaseBrowser\Core\Types;

/**
 * HTTP Response wrapper
 */
class Response {
	public $status_code;
	public $body;
	public $headers;

	/**
	 * Constructor
	 *
	 * @param int    $status_code HTTP status code.
	 * @param string $body        Response body.
	 * @param array  $headers     Response headers.
	 */
	public function __construct( int $status_code, string $body, array $headers ) {
		$this->status_code = $status_code;
		$this->body        = $body;
		$this->headers     = $headers;
	}
}
