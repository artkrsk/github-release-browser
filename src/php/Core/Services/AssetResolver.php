<?php

namespace Arts\GH\ReleaseBrowser\Core\Services;

class AssetResolver {
	public function findAsset( array $release, string $pattern = null ): ?array {
		if ( ! isset( $release['assets'] ) || ! is_array( $release['assets'] ) ) {
			return null;
		}

		if ( ! $pattern ) {
			return $release['assets'][0] ?? null;
		}

		foreach ( $release['assets'] as $asset ) {
			if ( fnmatch( $pattern, $asset['name'] ) ) {
				return $asset;
			}
		}

		return null;
	}

	public function getDownloadUrl( array $asset ): string {
		return $asset['browser_download_url'] ?? '';
	}

	public function formatSize( int $bytes ): string {
		$units     = array( 'B', 'KB', 'MB', 'GB', 'TB' );
		$unitIndex = 0;

		while ( $bytes >= 1024 && $unitIndex < count( $units ) - 1 ) {
			$bytes /= 1024;
			$unitIndex++;
		}

		return round( $bytes, 2 ) . ' ' . $units[ $unitIndex ];
	}
}