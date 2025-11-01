<?php
namespace Arts\GH\ReleaseBrowser\Core\Types;

class Response {
	public $statusCode;
	public $body;
	public $headers;

	public function __construct( int $statusCode, string $body, array $headers ) {
		$this->statusCode = $statusCode;
		$this->body       = $body;
		$this->headers    = $headers;
	}
}
