<?php

namespace Arts\GH\ReleaseBrowser\Core\Interfaces;

interface IConfig {
	/**
	 * Get configuration value by key
	 *
	 * @param string $key           Configuration key.
	 * @param mixed  $default_value Default value if key not found.
	 * @return mixed Configuration value.
	 */
	public function get( string $key, $default_value = null );
}
