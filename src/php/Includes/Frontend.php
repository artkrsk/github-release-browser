<?php
namespace Arts\GH\ReleaseBrowser\Includes;

/**
 * Frontend class for handling asset enqueuing
 *
 * @phpstan-type BrowserConfig array{
 *   action_prefix?: string,
 *   protocol?: string,
 *   features?: array<string, mixed>,
 *   upgrade_url?: string,
 *   strings?: array<string, string>,
 *   text_domain?: string,
 *   settings_url?: string,
 *   assets_url?: string
 * }
 */
class Frontend {
	private string $assets_url;
	/** @var BrowserConfig */
	private array $config;

	/** Prevents duplicate enqueuing across multiple instances */
	private static bool $enqueued = false;

	/**
	 * Constructor
	 *
	 * @param array<string, mixed> $config Configuration array.
	 */
	public function __construct( array $config ) {
		/** @var BrowserConfig $config */
		$this->config = $config;

		// Allow custom asset URL to be passed in config
		if ( isset( $config['assets_url'] ) && is_string( $config['assets_url'] ) ) {
			$this->assets_url = $config['assets_url'];
		} else {
			// Default to plugins_url if used as a plugin
			$this->assets_url = plugins_url( 'libraries/github-release-browser/', dirname( __DIR__ ) . '/Browser.php' );
		}
	}

	/**
	 * Initialize frontend hooks
	 */
	public function init(): void {
		if ( self::$enqueued ) {
			return;
		}

		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		self::$enqueued = true;
	}

	/**
	 * Enqueue frontend scripts and styles
	 */
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

		// Pass configuration to JavaScript
		wp_localize_script(
			'github-release-browser',
			'githubReleaseBrowserConfig',
			$js_config
		);
	}
}
