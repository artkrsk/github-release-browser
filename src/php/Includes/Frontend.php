<?php
namespace Arts\GH\ReleaseBrowser\Includes;

/**
 * Frontend class for handling asset enqueuing
 */
class Frontend {
	private string $assets_url;
	private array $config;
	private static bool $enqueued = false;

	public function __construct( array $config ) {
		$this->config = $config;

		// Allow custom asset URL to be passed in config
		if ( isset( $config['assets_url'] ) ) {
			$this->assets_url = $config['assets_url'];
		} else {
			// Default to plugins_url if used as a plugin
			$this->assets_url = plugins_url( 'libraries/github-release-browser/', dirname( __DIR__ ) . '/Browser.php' );
		}
	}

	public function init(): void {
		if ( self::$enqueued ) {
			return;
		}

		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		self::$enqueued = true;
	}

	public function enqueue_scripts(): void {
		static $enqueued = false;

		if ( $enqueued ) {
			return;
		}

		$enqueued = true;

		// Use the correct file name that matches the build output
		wp_enqueue_script(
			'github-release-browser',
			$this->assets_url . 'index.umd.js',
			array( 'react', 'react-dom', 'wp-element', 'wp-components', 'wp-i18n' ),
			'1.0.0',
			true
		);

		wp_enqueue_style(
			'github-release-browser',
			$this->assets_url . 'index.css',
			array(),
			'1.0.0'
		);

		// Prepare config for JavaScript
		$js_config = array(
			'apiUrl'       => admin_url( 'admin-ajax.php' ),
			'nonce'        => wp_create_nonce( $this->config['action_prefix'] . '_nonce' ),
			'actionPrefix'  => $this->config['action_prefix'] ?? 'github_release_browser',
			'protocol'     => $this->config['protocol'] ?? 'github-release://',
			'features'     => $this->config['features'] ?? array(),
			'upgradeUrl'   => $this->config['upgrade_url'] ?? '',
			'strings'      => $this->config['strings'] ?? array(),
			'textDomain'   => $this->config['text_domain'] ?? 'github-release-browser',
		);

		// Pass configuration to JavaScript
		wp_localize_script(
			'github-release-browser',
			'githubReleaseBrowserConfig',
			$js_config
		);
	}
}
