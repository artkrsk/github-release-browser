<?php

namespace Arts\GH\ReleaseBrowser\Core\Services;

/**
 * URI parser for GitHub release protocol
 *
 * Parses and builds URIs like: github-release://owner/repo/v1.0.0/asset.zip
 */
class URIParser {
	private $protocol;

	/**
	 * Constructor
	 *
	 * @param string $protocol Protocol prefix.
	 */
	public function __construct( string $protocol = 'github-release://' ) {
		$this->protocol = $protocol;
	}

	/**
	 * Check if URI uses GitHub protocol
	 *
	 * @param string $uri URI to check.
	 * @return bool True if URI uses the configured protocol.
	 */
	public function is_github_file( string $uri ): bool {
		return strpos( $uri, $this->protocol ) === 0;
	}

	/**
	 * Parse URI into components
	 *
	 * @param string $uri URI to parse.
	 * @return array|\WP_Error Parsed components or WP_Error on failure.
	 */
	public function parse( string $uri ) {
		if ( strpos( $uri, $this->protocol ) !== 0 ) {
			if ( function_exists( 'is_wp_error' ) ) {
				return new \WP_Error( 'invalid_protocol', 'Invalid GitHub file URI protocol' );
			}
			return array( 'valid' => false );
		}

		$path  = substr( $uri, strlen( $this->protocol ) );
		$parts = explode( '/', $path );

		if ( count( $parts ) < 2 ) {
			if ( function_exists( 'is_wp_error' ) ) {
				return new \WP_Error( 'invalid_format', 'Invalid GitHub file URI format' );
			}
			return array( 'valid' => false );
		}

		$repo    = "{$parts[0]}/{$parts[1]}";
		$release = $parts[2] ?? 'latest';
		$asset   = $parts[3] ?? null;

		return array(
			'valid'   => true,
			'repo'    => $repo,
			'release' => $release,
			'asset'   => $asset,
		);
	}

	/**
	 * Build URI from components
	 *
	 * @param array $parts URI components.
	 * @return string Built URI.
	 */
	public function build( array $parts ): string {
		$uri  = $this->protocol;
		$uri .= $parts['repo'];

		if ( isset( $parts['release'] ) && $parts['release'] !== 'latest' ) {
			$uri .= '/' . $parts['release'];
		}

		if ( isset( $parts['asset'] ) ) {
			$uri .= '/' . $parts['asset'];
		}

		return $uri;
	}
}
