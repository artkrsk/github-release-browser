<?php

namespace Arts\GH\ReleaseBrowser\Adapters\WordPress;

use Arts\GH\ReleaseBrowser\Core\Interfaces\ICache;

/**
 * WordPress Cache adapter
 * Implements ICache using WordPress transients
 */
class Cache implements ICache {
	private $prefix;

	/**
	 * Constructor
	 *
	 * @param string $prefix Cache key prefix.
	 */
	public function __construct( string $prefix = 'gh_browser_' ) {
		$this->prefix = $prefix;
	}

	/**
	 * Get cached value by key
	 *
	 * @param string $key Cache key.
	 * @return mixed Cached value or false.
	 */
	public function get( string $key ) {
		return get_transient( $this->prefix . $key );
	}

	/**
	 * Set cache value
	 *
	 * @param string $key   Cache key.
	 * @param mixed  $value Value to cache.
	 * @param int    $ttl   Time to live in seconds.
	 * @return bool Success status.
	 */
	public function set( string $key, $value, int $ttl = 3600 ): bool {
		return set_transient( $this->prefix . $key, $value, $ttl );
	}

	/**
	 * Delete cached value
	 *
	 * @param string $key Cache key.
	 * @return bool Success status.
	 */
	public function delete( string $key ): bool {
		return delete_transient( $this->prefix . $key );
	}

	/**
	 * Clear multiple cache keys
	 *
	 * @param array $keys Array of cache keys.
	 * @return bool Success status.
	 */
	public function clear_keys( array $keys ): bool {
		$prefixed_keys = array_map(
			function ( $key ) {
				return $this->prefix . $key;
			},
			$keys
		);

		foreach ( $prefixed_keys as $key ) {
			delete_transient( $key );
		}

		return true;
	}
}
