<?php

namespace Arts\GH\ReleaseBrowser\Adapters\WordPress;

use Arts\GH\ReleaseBrowser\Core\Interfaces\ICache;

/**
 * WordPress Cache adapter
 * Implements ICache using WordPress transients
 */
class Cache implements ICache {
	private string $prefix;

	public function __construct( string $prefix = 'gh_browser_' ) {
		$this->prefix = $prefix;
	}

	public function get( string $key ) {
		return get_transient( $this->prefix . $key );
	}

	public function set( string $key, $value, int $ttl = 3600 ): bool {
		return set_transient( $this->prefix . $key, $value, $ttl );
	}

	public function delete( string $key ): bool {
		return delete_transient( $this->prefix . $key );
	}

	public function clearKeys( array $keys ): bool {
		$prefixedKeys = array_map(
			function( $key ) {
				return $this->prefix . $key;
			},
			$keys
		);

		foreach ( $prefixedKeys as $key ) {
			delete_transient( $key );
		}

		return true;
	}
}
