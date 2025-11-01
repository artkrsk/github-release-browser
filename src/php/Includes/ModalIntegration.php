<?php
namespace Arts\GH\ReleaseBrowser\Includes;

use Arts\GH\ReleaseBrowser\Browser;

/**
 * Modal Integration class for WordPress media library
 */
class ModalIntegration {
	/** @var Browser Used to access GitHub API for rate limit information */
	private Browser $browser;
	private array $config;

	public function __construct( array $config, Browser $browser ) {
		$this->config  = $config;
		$this->browser = $browser;
	}

	public function init(): void {
		add_filter( 'media_upload_tabs', array( $this, 'add_github_tab' ) );
		add_action( 'media_upload_github_releases', array( $this, 'render_browser' ) );
	}

	public function add_github_tab( array $tabs ): array {
		$tabs['github_releases'] = __( 'GitHub Releases', 'github-release-browser' );
		return $tabs;
	}

	public function render_browser(): void {
		wp_iframe( array( $this, 'browser_iframe_content' ) );
	}

	public function browser_iframe_content(): void {
		// Enqueue scripts and styles for iframe
		do_action( 'admin_enqueue_scripts' );
		do_action( 'admin_print_styles' );
		do_action( 'admin_print_scripts' );

		// Add WordPress body classes
		echo '<body class="wp-admin wp-core-ui">';

		// Create the root element for React
		echo '<div id="github-release-browser-root"></div>';

		// Prepare config for JavaScript (same as in Frontend)
		$js_config = array(
			'apiUrl'       => admin_url( 'admin-ajax.php' ),
			'nonce'        => wp_create_nonce( $this->config['action_prefix'] . '_nonce' ),
			'actionPrefix' => $this->config['action_prefix'] ?? 'github_release_browser',
			'protocol'     => $this->config['protocol'] ?? 'github-release://',
			'features'     => $this->config['features'] ?? array(),
			'upgradeUrl'   => $this->config['upgrade_url'] ?? '',
			'strings'      => $this->config['strings'] ?? array(),
			'textDomain'   => $this->config['text_domain'] ?? 'github-release-browser',
		);

		// Pass configuration via JavaScript
		echo '<script type="text/javascript">';
		echo 'window.githubReleaseBrowserConfig = ' . wp_json_encode( $js_config ) . ';';
		echo '</script>';

		echo '</body>';
	}

	/**
	 * Get the browser instance
	 */
	public function get_browser(): Browser {
		return $this->browser;
	}
}
