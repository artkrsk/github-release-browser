<?php
/**
 * Must-Use Plugin: GitHub Release Browser Dev Harness
 * Description: Complete dev environment with Browser initialization, test page, and live reload
 */

// Load the package autoloader (from mapped github-release-browser directory)
require_once WP_PLUGIN_DIR . '/github-release-browser/vendor/autoload.php';

// Initialize Browser
add_action(
	'init',
	function () {
		$token = defined( 'GH_TOKEN' ) ? GH_TOKEN : getenv( 'GH_TOKEN' );
		$token = $token ? $token : '';

		global $github_release_browser;
		$github_release_browser = new \Arts\GH\ReleaseBrowser\Browser(
			array(
				'github_token'          => $token,
				'protocol'              => 'github-release://',
				'action_prefix'         => 'github_release_browser',
				'enable_latest_release' => true,
			)
		);

		$github_release_browser->register_modal_integration();
	}
);

// Add test page
add_action(
	'admin_menu',
	function () {
		add_menu_page(
			'Release Browser Test',
			'Browser Test',
			'manage_options',
			'github-release-browser-test',
			function () {
				wp_enqueue_media();
				add_thickbox();
				?>
				<div class="wrap">
					<h1>GitHub Release Browser Test</h1>
					<table class="form-table">
						<tr>
							<th>Selected Asset URI</th>
							<td>
								<input type="text" id="github-asset-uri" class="large-text"
								       placeholder="Select an asset from GitHub..." readonly>
								<p class="description">Click the button below to browse and select a release asset</p>
							</td>
						</tr>
					</table>
					<p>
						<a href="media-upload.php?type=github_releases&TB_iframe=true&width=900&height=600"
						   class="button button-primary thickbox">
							Browse GitHub Releases
						</a>
					</p>
				</div>
				<script>
				jQuery(document).ready(function($) {
					$('.thickbox').on('click', function(e) {
						e.preventDefault();
						tb_show('GitHub Releases', $(this).attr('href'));
					});
				});
				</script>
				<?php
			},
			'dashicons-download',
			30
		);
	}
);

// BrowserSync injection helper
function inject_browsersync_script() {
	global $pagenow;

	// Only inject in media-upload popup (iframe)
	if ( $pagenow !== 'media-upload.php' ) {
		return;
	}

	$bs_port = 3000;

	// Check if BrowserSync is running (from container to host)
	$check_host = 'host.docker.internal';
	$connection = @fsockopen( $check_host, $bs_port, $errno, $errstr, 0.5 );
	if ( ! is_resource( $connection ) ) {
		echo '<!-- BrowserSync not running -->';
		return;
	}
	fclose( $connection );

	// Use localhost for browser to fetch (browser runs on host machine)
	$bs_url = "http://localhost:{$bs_port}/browser-sync/browser-sync-client.js";
	echo '<script id="__bs_script__" src="' . esc_url( $bs_url ) . '" async></script>';
	echo '<!-- BrowserSync connected to iframe -->';
}

// Only inject in iframe (media upload modal), not admin panel
add_action( 'admin_print_footer_scripts', 'inject_browsersync_script', 999 );
