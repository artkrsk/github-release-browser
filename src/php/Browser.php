<?php
namespace Arts\GH\ReleaseBrowser;

use Arts\GH\ReleaseBrowser\Core\Services\GitHubAPI;
use Arts\GH\ReleaseBrowser\Core\Services\URIParser;
use Arts\GH\ReleaseBrowser\Core\Services\AssetResolver;
use Arts\GH\ReleaseBrowser\Adapters\WordPress\HttpClient;
use Arts\GH\ReleaseBrowser\Adapters\WordPress\Cache;
use Arts\GH\ReleaseBrowser\Adapters\WordPress\Config;
use Arts\GH\ReleaseBrowser\Includes\Frontend;
use Arts\GH\ReleaseBrowser\Includes\ModalIntegration;

/**
 * Main Browser class for GitHub Release Browser
 * Coordinates all services and provides access to core functionality
 */
class Browser {
	private array $config;
	private GitHubAPI $github_api;
	private URIParser $uri_parser;
	private AssetResolver $asset_resolver;
	private ?Frontend $frontend      = null;
	private ?ModalIntegration $modal = null;

	public function __construct( array $config ) {
		$this->config = wp_parse_args(
			$config,
			array(
				'cache_prefix' => 'gh_browser_',
				'token_key'    => 'github_token',
				'protocol'     => 'github-release://',
			)
		);

		// Initialize core services
		$this->github_api = new GitHubAPI(
			new HttpClient(),
			new Cache( $this->config['cache_prefix'] ),
			new Config( array( 'token_key' => $this->config['token_key'] ) )
		);

		$this->uri_parser     = new URIParser( $this->config['protocol'] );
		$this->asset_resolver = new AssetResolver();

		// Register AJAX handlers
		$this->register_ajax_handlers();

		// Initialize frontend (auto-enqueues assets)
		$this->frontend = new Frontend( $this->config );
		$this->frontend->init();
	}

	public function get_github_api(): GitHubAPI {
		return $this->github_api;
	}

	public function get_uri_parser(): URIParser {
		return $this->uri_parser;
	}

	public function get_asset_resolver(): AssetResolver {
		return $this->asset_resolver;
	}

	public function register_modal_integration(): void {
		if ( ! $this->modal ) {
			$this->modal = new ModalIntegration( $this->config, $this );
			$this->modal->init();
		}
	}

	/**
	 * Register AJAX handlers for GitHub API calls
	 */
	private function register_ajax_handlers(): void {
		$action_prefix = $this->config['action_prefix'] ?? 'github_release_browser';

		// Get releases
		add_action( "wp_ajax_{$action_prefix}_get_releases", array( $this, 'ajax_get_releases' ) );
		add_action( "wp_ajax_nopriv_{$action_prefix}_get_releases", array( $this, 'ajax_get_releases' ) );

		// Get rate limit
		add_action( "wp_ajax_{$action_prefix}_get_rate_limit", array( $this, 'ajax_get_rate_limit' ) );
		add_action( "wp_ajax_nopriv_{$action_prefix}_get_rate_limit", array( $this, 'ajax_get_rate_limit' ) );

		// Parse URI
		add_action( "wp_ajax_{$action_prefix}_parse_uri", array( $this, 'ajax_parse_uri' ) );
		add_action( "wp_ajax_nopriv_{$action_prefix}_parse_uri", array( $this, 'ajax_parse_uri' ) );

		// Get asset download URL
		add_action( "wp_ajax_{$action_prefix}_get_download_url", array( $this, 'ajax_get_download_url' ) );
		add_action( "wp_ajax_nopriv_{$action_prefix}_get_download_url", array( $this, 'ajax_get_download_url' ) );
	}

	/**
	 * AJAX handler for getting releases
	 */
	public function ajax_get_releases(): void {
		$action_prefix = $this->config['action_prefix'] ?? 'github_release_browser';
		check_ajax_referer( "{$action_prefix}_nonce", 'nonce' );

		// Check user capabilities
		if ( ! current_user_can( 'read' ) ) {
			wp_send_json_error( array( 'message' => 'Unauthorized' ) );
		}

		$repo = sanitize_text_field( $_POST['repo'] ?? '' );
		$page = intval( $_POST['page'] ?? 1 );

		if ( empty( $repo ) ) {
			wp_send_json_error( array( 'message' => 'Repository name is required' ) );
		}

		try {
			$releases = $this->github_api->getReleases( $repo, $page );
			wp_send_json_success( array( 'releases' => $releases ) );
		} catch ( \Exception $e ) {
			wp_send_json_error( array( 'message' => $e->getMessage() ) );
		}
	}

	/**
	 * AJAX handler for getting rate limit
	 */
	public function ajax_get_rate_limit(): void {
		$action_prefix = $this->config['action_prefix'] ?? 'github_release_browser';
		check_ajax_referer( "{$action_prefix}_nonce", 'nonce' );

		// Check user capabilities
		if ( ! current_user_can( 'read' ) ) {
			wp_send_json_error( array( 'message' => 'Unauthorized' ) );
		}

		try {
			$rate_limit = $this->github_api->getRateLimit();
			wp_send_json_success( array( 'rate_limit' => $rate_limit ) );
		} catch ( \Exception $e ) {
			wp_send_json_error( array( 'message' => $e->getMessage() ) );
		}
	}

	/**
	 * AJAX handler for parsing URI
	 */
	public function ajax_parse_uri(): void {
		$action_prefix = $this->config['action_prefix'] ?? 'github_release_browser';
		check_ajax_referer( "{$action_prefix}_nonce", 'nonce' );

		// Check user capabilities
		if ( ! current_user_can( 'read' ) ) {
			wp_send_json_error( array( 'message' => 'Unauthorized' ) );
		}

		$uri = sanitize_text_field( $_POST['uri'] ?? '' );

		if ( empty( $uri ) ) {
			wp_send_json_error( array( 'message' => 'URI is required' ) );
		}

		try {
			$parsed = $this->uri_parser->parse( $uri );
			wp_send_json_success( array( 'parsed' => $parsed ) );
		} catch ( \Exception $e ) {
			wp_send_json_error( array( 'message' => $e->getMessage() ) );
		}
	}

	/**
	 * AJAX handler for getting download URL
	 */
	public function ajax_get_download_url(): void {
		$action_prefix = $this->config['action_prefix'] ?? 'github_release_browser';
		check_ajax_referer( "{$action_prefix}_nonce", 'nonce' );

		// Check user capabilities
		if ( ! current_user_can( 'read' ) ) {
			wp_send_json_error( array( 'message' => 'Unauthorized' ) );
		}

		$asset_url = sanitize_text_field( $_POST['asset_url'] ?? '' );

		if ( empty( $asset_url ) ) {
			wp_send_json_error( array( 'message' => 'Asset URL is required' ) );
		}

		try {
			$download_url = $this->asset_resolver->getDownloadUrl( array( 'browser_download_url' => $asset_url ) );
			wp_send_json_success( array( 'download_url' => $download_url ) );
		} catch ( \Exception $e ) {
			wp_send_json_error( array( 'message' => $e->getMessage() ) );
		}
	}
}
