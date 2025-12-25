<?php

namespace Arts\GH\ReleaseBrowser\Includes;

use Arts\GH\ReleaseBrowser\Browser;

/**
 * Modal Integration class for WordPress media library
 *
 * @phpstan-import-type BrowserConfig from \Arts\GH\ReleaseBrowser\Browser
 */
class ModalIntegration {
	private Browser $browser;
	/** @var BrowserConfig */
	private array $config;

	/**
	 * Constructor
	 *
	 * @param array<string, mixed> $config  Configuration array.
	 * @param Browser              $browser Browser instance.
	 */
	public function __construct( array $config, Browser $browser ) {
		/** @var BrowserConfig $config */
		$this->config  = $config;
		$this->browser = $browser;
	}

	/**
	 * Initialize modal integration hooks
	 */
	public function init(): void {
		add_filter( 'media_upload_tabs', array( $this, 'add_github_tab' ) );
		add_action( 'media_upload_github_releases', array( $this, 'render_browser' ) );
	}

	/**
	 * Add GitHub tab to media upload tabs
	 *
	 * @param array<string, string> $tabs Existing tabs.
	 * @return array<string, string> Modified tabs.
	 */
	public function add_github_tab( array $tabs ): array {
		$tabs['github_releases'] = __( 'GitHub Releases', 'github-release-browser' );
		return $tabs;
	}

	/**
	 * Render browser in iframe
	 */
	public function render_browser(): void {
		wp_iframe( array( $this, 'browser_iframe_content' ) );
	}

	/**
	 * Output browser iframe content
	 */
	public function browser_iframe_content(): void {
		$action_prefix = isset( $this->config['action_prefix'] ) && is_string( $this->config['action_prefix'] )
			? $this->config['action_prefix']
			: 'github_release_browser';

		// Build features array for JavaScript
		$features = $this->config['features'] ?? array();
		if ( isset( $this->config['enable_directories'] ) ) {
			$features['directories'] = (bool) $this->config['enable_directories'];
		}
		if ( isset( $this->config['enable_latest_release'] ) ) {
			$features['useLatestRelease'] = (bool) $this->config['enable_latest_release'];
		}

		// Prepare config for JavaScript
		$js_config = array(
			'apiUrl'       => admin_url( 'admin-ajax.php' ),
			'nonce'        => wp_create_nonce( $action_prefix . '_nonce' ),
			'actionPrefix' => $action_prefix,
			'protocol'     => $this->config['protocol'] ?? 'github-release://',
			'dirProtocol'  => $this->config['dir_protocol'] ?? 'github-dir://',
			'features'     => $features,
			'upgradeUrl'   => $this->config['upgrade_url'] ?? '',
			'strings'      => $this->config['strings'] ?? array(),
			'textDomain'   => $this->config['text_domain'] ?? 'github-release-browser',
			'settingsUrl'  => $this->config['settings_url'] ?? admin_url( 'options-general.php' ),
		);

		// Enqueue scripts and styles
		do_action( 'admin_enqueue_scripts' );

		// Localize script with config
		wp_localize_script( 'github-release-browser', 'githubReleaseBrowserConfig', $js_config );

		// Print styles in head
		do_action( 'admin_print_styles' );
		?>

		<body class="wp-admin wp-core-ui">
			<div id="github-release-browser-root"></div>

			<?php
			// Print scripts in footer (after root element exists)
			do_action( 'admin_print_footer_scripts' );
			?>
		</body>
		<?php
	}

	/**
	 * Get the browser instance
	 *
	 * @return Browser Browser instance.
	 */
	public function get_browser(): Browser {
		return $this->browser;
	}
}
