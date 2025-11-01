<?php

namespace Arts\GH\ReleaseBrowser\Core\Interfaces;

interface ICache {
	public function get( string $key);
	public function set( string $key, $value, int $ttl = 3600): bool;
	public function delete( string $key): bool;
	public function clearKeys( array $keys): bool;
}