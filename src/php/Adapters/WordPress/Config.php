<?php

namespace Arts\GH\ReleaseBrowser\Adapters\WordPress;

use Arts\GH\ReleaseBrowser\Core\Interfaces\IConfig;

/**
 * WordPress Config adapter
 * Implements IConfig using WordPress options and constants
 */
class Config implements IConfig {
	private array $config;

	public function __construct( array $config = array() ) {
		$this->config = wp_parse_args(
			$config,
			array(
				'token_key'    => 'github_token',
				'cache_prefix' => 'gh_browser_',
				'protocol'     => 'github-release://',
			)
		);
	}

	public function get( string $key, $default = null ) {
		return $this->config[ $key ] ?? $default;
	}
}
