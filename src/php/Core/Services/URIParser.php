<?php

namespace Arts\GH\ReleaseBrowser\Core\Services;

/**
 * URI parser for GitHub release and directory protocols
 *
 * Parses and builds URIs like:
 * - Release: github-release://owner/repo/v1.0.0/asset.zip
 * - Directory: github-dir://owner/repo/branch/path/to/folder
 */
class URIParser {
	private string $protocol;
	private string $dir_protocol;

	/**
	 * Constructor
	 *
	 * @param string $protocol     Release protocol prefix.
	 * @param string $dir_protocol Directory protocol prefix.
	 */
	public function __construct( string $protocol = 'github-release://', string $dir_protocol = 'github-dir://' ) {
		$this->protocol     = $protocol;
		$this->dir_protocol = $dir_protocol;
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
	 * @return array{valid: bool, repo?: string, release?: string, asset?: string|null}|\WP_Error Parsed components or WP_Error on failure.
	 */
	public function parse( string $uri ): array|\WP_Error {
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
	 * @param array{repo: string, release?: string, asset?: string} $parts URI components.
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

	/**
	 * Check if URI uses GitHub directory protocol
	 *
	 * @param string $uri URI to check.
	 * @return bool True if URI uses the directory protocol.
	 */
	public function is_github_dir( string $uri ): bool {
		return strpos( $uri, $this->dir_protocol ) === 0;
	}

	/**
	 * Parse directory URI into components
	 *
	 * Format: github-dir://owner/repo/branch/path/to/folder
	 *
	 * @param string $uri URI to parse.
	 * @return array{valid: bool, repo?: string, branch?: string, path?: string}|\WP_Error Parsed components or WP_Error on failure.
	 */
	public function parse_dir( string $uri ): array|\WP_Error {
		if ( strpos( $uri, $this->dir_protocol ) !== 0 ) {
			if ( function_exists( 'is_wp_error' ) ) {
				return new \WP_Error( 'invalid_protocol', 'Invalid GitHub directory URI protocol' );
			}
			return array( 'valid' => false );
		}

		$path  = substr( $uri, strlen( $this->dir_protocol ) );
		$parts = explode( '/', $path );

		if ( count( $parts ) < 3 ) {
			if ( function_exists( 'is_wp_error' ) ) {
				return new \WP_Error( 'invalid_format', 'Invalid GitHub directory URI format (requires owner/repo/branch)' );
			}
			return array( 'valid' => false );
		}

		$repo   = "{$parts[0]}/{$parts[1]}";
		$branch = $parts[2];
		// Join remaining parts as path (can be empty for root)
		$dir_path = count( $parts ) > 3 ? implode( '/', array_slice( $parts, 3 ) ) : '';

		return array(
			'valid'  => true,
			'repo'   => $repo,
			'branch' => $branch,
			'path'   => $dir_path,
		);
	}

	/**
	 * Build directory URI from components
	 *
	 * @param array{repo: string, branch: string, path?: string} $parts URI components.
	 * @return string Built URI.
	 */
	public function build_dir( array $parts ): string {
		$uri  = $this->dir_protocol;
		$uri .= $parts['repo'];
		$uri .= '/' . $parts['branch'];

		if ( isset( $parts['path'] ) && $parts['path'] !== '' ) {
			$uri .= '/' . $parts['path'];
		}

		return $uri;
	}
}
