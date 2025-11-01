<?php

namespace Arts\GH\ReleaseBrowser\Core\Services;

class URIParser {
	private string $protocol;

	public function __construct( string $protocol = 'github-release://' ) {
		$this->protocol = $protocol;
	}

	public function parse( string $uri ): array {
		if ( strpos( $uri, $this->protocol ) !== 0 ) {
			return array( 'valid' => false );
		}

		$path  = substr( $uri, strlen( $this->protocol ) );
		$parts = explode( '/', $path );

		if ( count( $parts ) < 2 ) {
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
