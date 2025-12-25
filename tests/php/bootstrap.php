<?php
/**
 * PHPUnit Bootstrap File
 */

// Load Composer autoloader
require_once __DIR__ . '/../../vendor/autoload.php';

// Initialize Brain Monkey for WordPress function mocking
Brain\Monkey\setUp();

// Mock WP_Error class for WordPress compatibility
if ( ! class_exists( 'WP_Error' ) ) {
	class WP_Error {
		private string $code;
		private string $message;
		private $data;

		public function __construct( string $code = '', string $message = '', $data = '' ) {
			$this->code    = $code;
			$this->message = $message;
			$this->data    = $data;
		}

		public function get_error_code(): string {
			return $this->code;
		}

		public function get_error_message( string $code = '' ): string {
			return $this->message;
		}

		public function get_error_data( string $code = '' ) {
			return $this->data;
		}
	}
}

// Register Brain Monkey tearDown to run after each test
register_shutdown_function(function () {
    Brain\Monkey\tearDown();
});
