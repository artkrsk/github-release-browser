<?php
/**
 * PHPUnit Bootstrap for Integration Tests
 *
 * This bootstrap is designed to run inside wp-env container with full WordPress loaded.
 * Run via: pnpm env:cli -- bash -c "cd /var/www/html/wp-content/plugins/github-release-browser && vendor/bin/phpunit -c phpunit-integration.xml"
 */

// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped

$_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( ! $_tests_dir ) {
	$_tests_dir = rtrim( sys_get_temp_dir(), '/\\' ) . '/wordpress-tests-lib';
}

// Forward custom PHPUnit Polyfills configuration to PHPUnit bootstrap file.
$_phpunit_polyfills_path = dirname( __DIR__, 2 ) . '/vendor/yoast/phpunit-polyfills/phpunitpolyfills-autoload.php';
if ( file_exists( $_phpunit_polyfills_path ) ) {
	define( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH', $_phpunit_polyfills_path );
}

if ( ! file_exists( "{$_tests_dir}/includes/functions.php" ) ) {
	echo "Could not find {$_tests_dir}/includes/functions.php\n";
	echo "Please ensure WP_TESTS_DIR is set correctly or WordPress test library is installed.\n";
	echo "\n";
	echo "For wp-env, the test library should be available at /tmp/wordpress-tests-lib\n";
	exit( 1 );
}

// Give access to tests_add_filter() function.
require_once "{$_tests_dir}/includes/functions.php";

/**
 * Manually load the plugin being tested.
 */
function _manually_load_plugin() {
	// Load plugin autoloader.
	require_once dirname( __DIR__, 2 ) . '/vendor/autoload.php';
}

tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );

// Start up the WP testing environment.
require "{$_tests_dir}/includes/bootstrap.php";
