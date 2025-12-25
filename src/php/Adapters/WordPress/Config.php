<?php

namespace Arts\GH\ReleaseBrowser\Adapters\WordPress;

use Arts\GH\ReleaseBrowser\Core\Interfaces\IConfig;

/**
 * WordPress Config adapter
 * Implements IConfig - simple array-based config
 */
class Config implements IConfig {
	/** @var array<string, mixed> */
	private array $config;

	/**
	 * Constructor
	 *
	 * @param array<string, mixed> $config Configuration array.
	 */
	public function __construct( array $config = array() ) {
		/** @var array<string, mixed> $parsed */
		$parsed       = wp_parse_args(
			$config,
			array(
				'github_token' => '',
				'cache_prefix' => 'gh_browser_',
				'protocol'     => 'github-release://',
			)
		);
		$this->config = $parsed;
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
