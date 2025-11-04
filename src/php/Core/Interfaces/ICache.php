<?php

namespace Arts\GH\ReleaseBrowser\Core\Interfaces;

interface ICache {
	/**
	 * Get cached value by key
	 *
	 * @param string $key Cache key.
	 * @return mixed Cached value or false.
	 */
	public function get( string $key );

	/**
	 * Set cache value
	 *
	 * @param string $key   Cache key.
	 * @param mixed  $value Value to cache.
	 * @param int    $ttl   Time to live in seconds.
	 * @return bool Success status.
	 */
	public function set( string $key, $value, int $ttl = 3600 ): bool;

	/**
	 * Delete cached value
	 *
	 * @param string $key Cache key.
	 * @return bool Success status.
	 */
	public function delete( string $key ): bool;

	/**
	 * Clear multiple cache keys
	 *
	 * @param array $keys Array of cache keys.
	 * @return bool Success status.
	 */
	public function clear_keys( array $keys ): bool;
}
