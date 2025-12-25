<?php

namespace Arts\GH\ReleaseBrowser\Tests\Integration\Adapters;

use Arts\GH\ReleaseBrowser\Adapters\WordPress\Cache;
use WP_UnitTestCase;

/**
 * Integration tests for WordPress Cache adapter
 *
 * Tests the Cache adapter with real WordPress transient functions.
 */
class CacheTest extends WP_UnitTestCase {

	private Cache $cache;
	private string $test_prefix = 'integration_test_';

	public function set_up(): void {
		parent::set_up();
		$this->cache = new Cache( $this->test_prefix );
	}

	public function tear_down(): void {
		global $wpdb;

		// Clean up all test transients.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$wpdb->query(
			$wpdb->prepare(
				"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
				'_transient_' . $this->test_prefix . '%',
				'_transient_timeout_' . $this->test_prefix . '%'
			)
		);

		parent::tear_down();
	}

	public function test_set_and_get_returns_string_value(): void {
		$result = $this->cache->set( 'test_string', 'hello world', 3600 );

		$this->assertTrue( $result );
		$this->assertSame( 'hello world', $this->cache->get( 'test_string' ) );
	}

	public function test_set_and_get_returns_array_value(): void {
		$data = array(
			'tag_name' => 'v1.0.0',
			'assets'   => array(
				array( 'name' => 'file.zip' ),
			),
		);

		$this->cache->set( 'test_array', $data, 3600 );

		$this->assertSame( $data, $this->cache->get( 'test_array' ) );
	}

	public function test_set_and_get_returns_object_value(): void {
		$data = (object) array(
			'id'   => 123,
			'name' => 'test',
		);

		$this->cache->set( 'test_object', $data, 3600 );

		$retrieved = $this->cache->get( 'test_object' );
		$this->assertEquals( $data, $retrieved );
	}

	public function test_get_nonexistent_key_returns_false(): void {
		$this->assertFalse( $this->cache->get( 'nonexistent_key' ) );
	}

	public function test_delete_removes_cached_value(): void {
		$this->cache->set( 'to_delete', 'value', 3600 );
		$this->assertSame( 'value', $this->cache->get( 'to_delete' ) );

		$result = $this->cache->delete( 'to_delete' );

		$this->assertTrue( $result );
		$this->assertFalse( $this->cache->get( 'to_delete' ) );
	}

	public function test_delete_nonexistent_key_returns_false(): void {
		$this->assertFalse( $this->cache->delete( 'nonexistent_key' ) );
	}

	public function test_clear_keys_removes_multiple_values(): void {
		$this->cache->set( 'key1', 'value1', 3600 );
		$this->cache->set( 'key2', 'value2', 3600 );
		$this->cache->set( 'key3', 'value3', 3600 );

		$result = $this->cache->clear_keys( array( 'key1', 'key2' ) );

		$this->assertTrue( $result );
		$this->assertFalse( $this->cache->get( 'key1' ) );
		$this->assertFalse( $this->cache->get( 'key2' ) );
		$this->assertSame( 'value3', $this->cache->get( 'key3' ) );
	}

	public function test_clear_keys_with_empty_array(): void {
		$this->cache->set( 'preserved', 'value', 3600 );

		$result = $this->cache->clear_keys( array() );

		$this->assertTrue( $result );
		$this->assertSame( 'value', $this->cache->get( 'preserved' ) );
	}

	public function test_cache_respects_prefix(): void {
		$cache1 = new Cache( 'prefix_a_' );
		$cache2 = new Cache( 'prefix_b_' );

		$cache1->set( 'shared_key', 'value_a', 3600 );
		$cache2->set( 'shared_key', 'value_b', 3600 );

		$this->assertSame( 'value_a', $cache1->get( 'shared_key' ) );
		$this->assertSame( 'value_b', $cache2->get( 'shared_key' ) );

		// Cleanup.
		$cache1->delete( 'shared_key' );
		$cache2->delete( 'shared_key' );
	}

	public function test_overwrite_existing_value(): void {
		$this->cache->set( 'overwrite_test', 'original', 3600 );
		$this->cache->set( 'overwrite_test', 'updated', 3600 );

		$this->assertSame( 'updated', $this->cache->get( 'overwrite_test' ) );
	}

	public function test_cache_with_special_characters_in_key(): void {
		$key = 'owner/repo_releases_1';

		$this->cache->set( $key, 'test_value', 3600 );

		$this->assertSame( 'test_value', $this->cache->get( $key ) );
	}

	public function test_cache_stores_in_database(): void {
		global $wpdb;

		$this->cache->set( 'db_test', 'stored_value', 3600 );

		// Verify directly in database.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$result = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT option_value FROM {$wpdb->options} WHERE option_name = %s",
				'_transient_' . $this->test_prefix . 'db_test'
			)
		);

		$this->assertNotNull( $result );
		$this->assertSame( 'stored_value', maybe_unserialize( $result ) );
	}
}
