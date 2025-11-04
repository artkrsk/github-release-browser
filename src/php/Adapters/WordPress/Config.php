<?php

namespace Arts\GH\ReleaseBrowser\Adapters\WordPress;

use Arts\GH\ReleaseBrowser\Core\Interfaces\IConfig;

/**
 * WordPress Config adapter
 * Implements IConfig - simple array-based config
 */
class Config implements IConfig {
	private $config;

	/**
	 * Constructor
	 *
	 * @param array $config Configuration array.
	 */
	public function __construct( array $config = array() ) {
		$this->config = wp_parse_args(
			$config,
			array(
				'github_token' => '',
				'cache_prefix' => 'gh_browser_',
				'protocol'     => 'github-release://',
			)
		);
	}

	/**
	 * Get configuration value by key
	 *
	 * @param string $key           Configuration key.
	 * @param mixed  $default_value Default value if key not found.
	 * @return mixed Configuration value.
	 */
	public function get( string $key, $default_value = null ) {
		return $this->config[ $key ] ?? $default_value;
	}
}
