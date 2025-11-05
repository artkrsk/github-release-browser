<?php

namespace Arts\GH\ReleaseBrowser\Adapters\WordPress;

use Arts\GH\ReleaseBrowser\Browser;

/**
 * PHP Stream Wrapper for GitHub Release Protocol
 *
 * Enables native PHP file functions to work with custom protocol URLs:
 * - file_exists()
 * - fopen()
 * - file_get_contents()
 * - filesize()
 * - is_file()
 * - etc.
 *
 * @link https://www.php.net/manual/en/class.streamwrapper.php
 */
class StreamWrapper {
	/**
	 * Current stream position
	 * @var int
	 */
	public $position = 0;

	/**
	 * File data buffer
	 * @var string|null
	 */
	private $data = null;

	/**
	 * File metadata
	 * @var array|null
	 */
	private $metadata = null;

	/**
	 * Stream context
	 * @var resource
	 */
	public $context;

	/**
	 * Browser instance (set via register_wrapper)
	 * @var Browser|null
	 */
	private static $browser = null;

	/**
	 * Protocol name (set via register_wrapper)
	 * @var string
	 */
	private static $protocol = 'github-release';

	/**
	 * Register the stream wrapper with PHP
	 *
	 * @param Browser $browser Browser instance for resolving files
	 * @param string  $protocol Protocol name (without ://)
	 * @return bool Success status
	 */
	public static function register_wrapper( Browser $browser, string $protocol = 'github-release' ): bool {
		self::$browser  = $browser;
		self::$protocol = $protocol;

		// Unregister if already registered
		if ( in_array( $protocol . '://', stream_get_wrappers(), true ) ) {
			stream_wrapper_unregister( $protocol );
		}

		return stream_wrapper_register( $protocol, __CLASS__ );
	}

	/**
	 * Unregister the stream wrapper
	 *
	 * @param string $protocol Protocol name (without ://)
	 * @return bool Success status
	 */
	public static function unregister_wrapper( string $protocol = 'github-release' ): bool {
		if ( in_array( $protocol . '://', stream_get_wrappers(), true ) ) {
			return stream_wrapper_unregister( $protocol );
		}
		return false;
	}

	/**
	 * Opens file or URL
	 *
	 * @param string $path Path to open
	 * @param string $mode Mode (r, w, a, etc.)
	 * @param int    $options Options bitmask
	 * @param string $opened_path Opened path (reference)
	 * @return bool Success status
	 */
	public function stream_open( $path, $mode, $options, &$opened_path ): bool {
		// Only support read mode
		if ( strpos( $mode, 'r' ) === false ) {
			return false;
		}

		try {
			// Fetch file data
			$result = $this->fetch_file_data( $path );

			if ( ! $result ) {
				return false;
			}

			$this->data     = $result['data'];
			$this->metadata = $result['metadata'];
			$this->position = 0;

			return true;
		} catch ( \Exception $e ) {
			return false;
		}
	}

	/**
	 * Read from stream
	 *
	 * @param int $count Number of bytes to read
	 * @return string Data read
	 */
	public function stream_read( $count ): string {
		$ret             = substr( $this->data, $this->position, $count );
		$this->position += strlen( $ret );
		return $ret;
	}

	/**
	 * Write to stream (not supported)
	 *
	 * @param string $data Data to write
	 * @return int Always 0 (not supported)
	 */
	public function stream_write( $data ): int {
		return 0; // Read-only
	}

	/**
	 * Get current position
	 *
	 * @return int Current position
	 */
	public function stream_tell(): int {
		return $this->position;
	}

	/**
	 * Check if at end of file
	 *
	 * @return bool EOF status
	 */
	public function stream_eof(): bool {
		return $this->position >= strlen( $this->data );
	}

	/**
	 * Seek to position
	 *
	 * @param int $offset Offset to seek to
	 * @param int $whence SEEK_SET, SEEK_CUR, or SEEK_END
	 * @return bool Success status
	 */
	public function stream_seek( $offset, $whence ): bool {
		$length = strlen( $this->data );

		switch ( $whence ) {
			case SEEK_SET:
				$this->position = $offset;
				break;
			case SEEK_CUR:
				$this->position += $offset;
				break;
			case SEEK_END:
				$this->position = $length + $offset;
				break;
			default:
				return false;
		}

		return true;
	}

	/**
	 * Get stream metadata (for stat(), filesize(), etc.)
	 *
	 * @return array Stat array
	 */
	public function stream_stat(): array {
		return $this->get_stat_array();
	}

	/**
	 * Get URL metadata (for file_exists(), is_file(), etc.)
	 *
	 * @param string $path Path to stat
	 * @param int    $flags Flags bitmask
	 * @return array|false Stat array or false
	 */
	public function url_stat( $path, $flags ) {
		try {
			// Try to fetch metadata only
			$result = $this->fetch_file_metadata( $path );

			if ( ! $result ) {
				return false;
			}

			$this->metadata = $result;
			return $this->get_stat_array();
		} catch ( \Exception $e ) {
			return false;
		}
	}

	/**
	 * Build stat array compatible with PHP's stat()
	 *
	 * @return array Stat array
	 */
	private function get_stat_array(): array {
		$size  = $this->metadata['size'] ?? strlen( $this->data ?? '' );
		$mtime = $this->metadata['mtime'] ?? time();

		return array(
			0         => 0,     // dev
			1         => 0,     // ino
			2         => 0100444, // mode (regular file, read-only)
			3         => 1,     // nlink
			4         => 0,     // uid
			5         => 0,     // gid
			6         => 0,     // rdev
			7         => $size, // size
			8         => $mtime, // atime
			9         => $mtime, // mtime
			10        => $mtime, // ctime
			11        => -1,    // blksize
			12        => -1,    // blocks
			'dev'     => 0,
			'ino'     => 0,
			'mode'    => 0100444,
			'nlink'   => 1,
			'uid'     => 0,
			'gid'     => 0,
			'rdev'    => 0,
			'size'    => $size,
			'atime'   => $mtime,
			'mtime'   => $mtime,
			'ctime'   => $mtime,
			'blksize' => -1,
			'blocks'  => -1,
		);
	}

	/**
	 * Fetch file data from GitHub release
	 *
	 * @param string $path Protocol URL
	 * @return array|false Array with 'data' and 'metadata' keys or false
	 */
	private function fetch_file_data( string $path ) {
		if ( ! self::$browser ) {
			return false;
		}

		// Parse the URL
		$parsed = self::$browser->get_uri_parser()->parse( $path );

		if ( is_wp_error( $parsed ) ) {
			return false;
		}

		// Get the release
		$release = $this->resolve_release( $parsed );

		if ( is_wp_error( $release ) || ! $release ) {
			return false;
		}

		// Find the asset
		$asset = self::$browser->get_asset_resolver()->find_asset_in_release(
			$release,
			$parsed['asset']
		);

		if ( ! $asset ) {
			return false;
		}

		// Download the file
		$download_url = $this->get_download_url( $asset['url'] );

		if ( ! $download_url ) {
			return false;
		}

		// Fetch file contents
		$response = wp_remote_get( $download_url );

		if ( is_wp_error( $response ) ) {
			return false;
		}

		$data = wp_remote_retrieve_body( $response );

		return array(
			'data'     => $data,
			'metadata' => array(
				'size'  => $asset['size'],
				'mtime' => strtotime( $asset['updated_at'] ?? 'now' ),
				'name'  => $asset['name'],
				'type'  => $asset['content_type'],
			),
		);
	}

	/**
	 * Fetch only file metadata (faster, for file_exists() checks)
	 *
	 * @param string $path Protocol URL
	 * @return array|false Metadata array or false
	 */
	private function fetch_file_metadata( string $path ) {
		if ( ! self::$browser ) {
			return false;
		}

		// Parse the URL
		$parsed = self::$browser->get_uri_parser()->parse( $path );

		if ( is_wp_error( $parsed ) ) {
			return false;
		}

		// Get the release
		$release = $this->resolve_release( $parsed );

		if ( is_wp_error( $release ) || ! $release ) {
			return false;
		}

		// Find the asset
		$asset = self::$browser->get_asset_resolver()->find_asset_in_release(
			$release,
			$parsed['asset']
		);

		if ( ! $asset ) {
			return false;
		}

		return array(
			'size'  => $asset['size'],
			'mtime' => strtotime( $asset['updated_at'] ?? 'now' ),
			'name'  => $asset['name'],
			'type'  => $asset['content_type'],
		);
	}

	/**
	 * Resolve release using Browser's resolve_release logic
	 *
	 * @param array $parsed Parsed URL data
	 * @return array|\WP_Error Release data or error
	 */
	private function resolve_release( $parsed ) {
		return self::$browser->resolve_release( $parsed );
	}

	/**
	 * Get download URL for asset
	 *
	 * @param string $asset_url GitHub asset API URL
	 * @return string|false Download URL or false
	 */
	private function get_download_url( string $asset_url ) {
		$http_client = new HttpClient();
		$config      = new \ReflectionProperty( self::$browser, 'config' );
		$config->setAccessible( true );
		$config_data = $config->getValue( self::$browser );

		$token   = $config_data['github_token'] ?? '';
		$headers = array( 'Accept' => 'application/octet-stream' );

		if ( $token ) {
			$headers['Authorization'] = "Bearer {$token}";
		}

		$response = $http_client->get( $asset_url, $headers, array( 'redirection' => 0 ) );

		// GitHub returns 302 redirect to S3
		if ( $response->status_code === 302 && isset( $response->headers['location'] ) ) {
			return $response->headers['location'];
		}

		return $asset_url;
	}
}
