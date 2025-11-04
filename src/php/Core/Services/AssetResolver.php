<?php

namespace Arts\GH\ReleaseBrowser\Core\Services;

/**
 * Resolves GitHub release assets
 *
 * Finds assets by pattern matching, extracts download URLs, and formats file sizes.
 */
class AssetResolver {
	/**
	 * Find asset in release by name or pattern
	 *
	 * @param array       $release Release data.
	 * @param string|null $identifier Asset name or shell-style pattern.
	 * @return array|null Asset data or null.
	 */
	public function find_asset_in_release( array $release, string $identifier = null ): ?array {
		return $this->find_asset( $release, $identifier );
	}

	/**
	 * Find asset in release by pattern
	 *
	 * @param array       $release Release data.
	 * @param string|null $pattern Shell-style pattern (fnmatch) like "*.zip" or "plugin-*.tar.gz".
	 * @return array|null Asset data or null.
	 */
	public function find_asset( array $release, string $pattern = null ): ?array {
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

	/**
	 * Get download URL from asset
	 *
	 * @param array $asset Asset data.
	 * @return string Download URL.
	 */
	public function get_download_url( array $asset ): string {
		return $asset['browser_download_url'] ?? '';
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
