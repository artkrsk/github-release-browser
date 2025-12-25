<?php

namespace Arts\GH\ReleaseBrowser\Core\Services;

/**
 * Resolves GitHub release assets
 *
 * Finds assets by pattern matching, extracts download URLs, and formats file sizes.
 *
 * @phpstan-type AssetData array{name: string, browser_download_url: string, size: int, content_type: string}
 * @phpstan-type ReleaseData array{assets?: array<AssetData>}
 */
class AssetResolver {
	/**
	 * Find asset in release by name or pattern
	 *
	 * @param array<string, mixed> $release    Release data.
	 * @param string|null          $identifier Asset name or shell-style pattern.
	 * @return array<string, mixed>|null Asset data or null.
	 */
	public function find_asset_in_release( array $release, ?string $identifier = null ): ?array {
		return $this->find_asset( $release, $identifier );
	}

	/**
	 * Find asset in release by pattern
	 *
	 * @param array<string, mixed> $release Release data.
	 * @param string|null          $pattern Shell-style pattern (fnmatch) like "*.zip" or "plugin-*.tar.gz".
	 * @return array<string, mixed>|null Asset data or null.
	 */
	public function find_asset( array $release, ?string $pattern = null ): ?array {
		if ( ! isset( $release['assets'] ) || ! is_array( $release['assets'] ) ) {
			return null;
		}

		if ( ! $pattern ) {
			/** @var array<string, mixed>|null */
			return $release['assets'][0] ?? null;
		}

		foreach ( $release['assets'] as $asset ) {
			if ( is_array( $asset ) && isset( $asset['name'] ) && is_string( $asset['name'] ) && fnmatch( $pattern, $asset['name'] ) ) {
				/** @var array<string, mixed> */
				return $asset;
			}
		}

		return null;
	}

	/**
	 * Get download URL from asset
	 *
	 * @param array<string, mixed> $asset Asset data.
	 * @return string Download URL.
	 */
	public function get_download_url( array $asset ): string {
		return isset( $asset['browser_download_url'] ) && is_string( $asset['browser_download_url'] ) ? $asset['browser_download_url'] : '';
	}

	/**
	 * Format bytes to human-readable size using binary units (1024-based: KB, MB, GB, etc.)
	 *
	 * @param int $bytes Size in bytes.
	 * @return string Formatted size string.
	 */
	public function format_size( int $bytes ): string {
		$units      = array( 'B', 'KB', 'MB', 'GB', 'TB' );
		$unit_index = 0;

		while ( $bytes >= 1024 && $unit_index < count( $units ) - 1 ) {
			$bytes /= 1024;
			++$unit_index;
		}

		return round( $bytes, 2 ) . ' ' . $units[ $unit_index ];
	}
}
