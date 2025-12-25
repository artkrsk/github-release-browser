<?php
namespace Arts\GH\ReleaseBrowser;

use Arts\GH\ReleaseBrowser\Core\Services\GitHubAPI;
use Arts\GH\ReleaseBrowser\Core\Services\URIParser;
use Arts\GH\ReleaseBrowser\Core\Services\AssetResolver;
use Arts\GH\ReleaseBrowser\Core\Interfaces\IPlatformAPI;
use Arts\GH\ReleaseBrowser\Adapters\WordPress\HttpClient;
use Arts\GH\ReleaseBrowser\Adapters\WordPress\Cache;
use Arts\GH\ReleaseBrowser\Adapters\WordPress\Config;
use Arts\GH\ReleaseBrowser\Includes\Frontend;
use Arts\GH\ReleaseBrowser\Includes\ModalIntegration;

/**
 * Main Browser class for GitHub Release Browser
 * Coordinates all services and provides access to core functionality
 *
 * @phpstan-type BrowserConfig array{
 *   cache_prefix: string,
 *   github_token: string,
 *   protocol: string,
 *   enable_latest_release: bool,
 *   settings_url: string,
 *   strings: array<string, string>,
 *   action_prefix?: string,
 *   features?: array<string, mixed>,
 *   upgrade_url?: string,
 *   text_domain?: string,
 *   assets_url?: string
 * }
 */
class Browser {
	/** @var BrowserConfig */
	private array $config;
	private IPlatformAPI $github_api;
	private URIParser $uri_parser;
	private AssetResolver $asset_resolver;
	private ?Frontend $frontend      = null;
	private ?ModalIntegration $modal = null;

	/**
	 * Constructor
	 *
	 * @param array<string, mixed> $config Configuration array.
	 * @param IPlatformAPI|null    $platform_adapter Optional platform adapter (defaults to GitHubAPI).
	 */
	public function __construct( array $config, ?IPlatformAPI $platform_adapter = null ) {
		/** @var BrowserConfig $parsed_config */
		$parsed_config = wp_parse_args(
			$config,
			array(
				'cache_prefix'          => 'gh_browser_',
				'github_token'          => '',
				'protocol'              => 'github-release://',
				'enable_latest_release' => false, // Set to false for lite version
				'settings_url'          => admin_url( 'options-general.php?page=edd-settings&tab=extensions' ),
				'strings'               => array(
					'actions.insertIntoDownload'     => esc_html__( 'Insert into download', 'github-release-browser' ),
					'errors.networkError'            => esc_html__( 'Network error occurred', 'github-release-browser' ),
					'repositories.searchPlaceholder' => esc_html__( 'Search repositories...', 'github-release-browser' ),
					'repositories.select'            => esc_html__( 'Select Repository', 'github-release-browser' ),
					'repositories.refresh'           => esc_html__( 'Refresh repositories', 'github-release-browser' ),
					'repositories.noResults'         => esc_html__( 'No repositories match your search', 'github-release-browser' ),
					'repositories.noneFound'         => esc_html__( 'No repositories found', 'github-release-browser' ),
					'releases.noReleases'            => esc_html__( 'No releases found.', 'github-release-browser' ),
					'releases.createOne'             => esc_html__( 'Create one →', 'github-release-browser' ),
					'releases.useLatest'             => esc_html__( 'Use Latest Release', 'github-release-browser' ),
					'releases.latestDescription'     => esc_html__( 'Automatically serve the latest published release', 'github-release-browser' ),
					'releases.title'                 => esc_html__( 'Releases', 'github-release-browser' ),
					'assets.backToRepos'             => esc_html__( 'Back to repositories', 'github-release-browser' ),
					'assets.assetsIn'                => esc_html__( 'Assets in', 'github-release-browser' ),
					'assets.latest'                  => esc_html__( 'latest', 'github-release-browser' ),
					'assets.noAssets'                => esc_html__( 'No assets found in this release', 'github-release-browser' ),
					'assets.asset'                   => esc_html__( 'asset', 'github-release-browser' ),
					'assets.assets'                  => esc_html__( 'assets', 'github-release-browser' ),
					'loading.repositories'           => esc_html__( 'Loading repositories...', 'github-release-browser' ),
					'common.tryAgain'                => esc_html__( 'Try Again', 'github-release-browser' ),
					'common.getPro'                  => esc_html__( 'Get Pro', 'github-release-browser' ),
					'common.upgradeToPro'            => esc_html__( 'Upgrade to Pro', 'github-release-browser' ),
					// Error titles
					'error.title.invalidToken'       => esc_html__( 'Invalid GitHub Token', 'github-release-browser' ),
					'error.title.networkError'       => esc_html__( 'Network Error', 'github-release-browser' ),
					'error.title.rateLimit'          => esc_html__( 'Rate Limit Exceeded', 'github-release-browser' ),
					'error.title.repositoryNotFound' => esc_html__( 'Repository Not Found', 'github-release-browser' ),
					'error.title.releaseNotFound'    => esc_html__( 'Release Not Found', 'github-release-browser' ),
					'error.title.general'            => esc_html__( 'Error', 'github-release-browser' ),
					// Error descriptions
					'error.desc.invalidToken'        => esc_html__( 'Your GitHub Personal Access Token is invalid or has been revoked. Please update your token in the settings.', 'github-release-browser' ),
					'error.desc.networkError'        => esc_html__( 'Unable to connect to GitHub. Please check your internet connection and try again.', 'github-release-browser' ),
					'error.desc.rateLimit'           => esc_html__( 'GitHub API rate limit exceeded. Please wait a while before trying again.', 'github-release-browser' ),
					'error.desc.repositoryNotFound'  => esc_html__( 'The requested repository was not found or is not accessible.', 'github-release-browser' ),
					'error.desc.releaseNotFound'     => esc_html__( 'No releases found for this repository.', 'github-release-browser' ),
					'error.desc.general'             => esc_html__( 'An unknown error occurred. Please try again.', 'github-release-browser' ),
					// Additional error messages
					'errors.unknownError'            => esc_html__( 'Unknown error occurred', 'github-release-browser' ),
					// Time formatting
					'time.today'                     => esc_html__( 'today', 'github-release-browser' ),
					'time.yesterday'                 => esc_html__( 'yesterday', 'github-release-browser' ),
					/* translators: %s: number of days */
					'time.daysAgo'                   => esc_html__( '%d days ago', 'github-release-browser' ),
					/* translators: %s: number of weeks */
					'time.weeksAgo'                  => esc_html__( '%d weeks ago', 'github-release-browser' ),
					/* translators: %s: number of months */
					'time.monthsAgo'                 => esc_html__( '%d months ago', 'github-release-browser' ),
					/* translators: %s: number of years */
					'time.yearsAgo'                  => esc_html__( '%d years ago', 'github-release-browser' ),
					// Welcome message
					'error.welcome.title'            => esc_html__( 'Welcome to Release Browser', 'github-release-browser' ),
					'error.welcome.description'      => esc_html__( 'To browse and insert files from your GitHub releases, you need to configure your GitHub Personal Access Token.', 'github-release-browser' ),
					'error.goToSettings'             => esc_html__( 'Go to Settings', 'github-release-browser' ),
				),
			)
		);
		$this->config  = $parsed_config;

		// Initialize platform adapter (defaults to GitHub if not provided)
		$this->github_api = $platform_adapter ?? new GitHubAPI(
			new HttpClient(),
			new Cache( $this->config['cache_prefix'] ),
			new Config( array( 'github_token' => $this->config['github_token'] ) )
		);

		$this->uri_parser     = new URIParser( $this->config['protocol'] );
		$this->asset_resolver = new AssetResolver();

		// Register AJAX handlers
		$this->register_ajax_handlers();

		// Initialize frontend (auto-enqueues assets)
		$this->frontend = new Frontend( $this->config );
		$this->frontend->init();
	}

	/**
	 * Get platform API service
	 *
	 * @return IPlatformAPI Platform API instance (defaults to GitHubAPI).
	 */
	public function get_github_api(): IPlatformAPI {
		return $this->github_api;
	}

	/**
	 * Get URI parser service
	 *
	 * @return URIParser URI parser instance.
	 */
	public function get_uri_parser(): URIParser {
		return $this->uri_parser;
	}

	/**
	 * Get asset resolver service
	 *
	 * @return AssetResolver Asset resolver instance.
	 */
	public function get_asset_resolver(): AssetResolver {
		return $this->asset_resolver;
	}

	/**
	 * Register modal integration for WordPress media library
	 */
	public function register_modal_integration(): void {
		if ( ! $this->modal ) {
			$this->modal = new ModalIntegration( $this->config, $this );
			$this->modal->init();
		}
	}

	/**
	 * Get action prefix from config
	 */
	private function get_action_prefix(): string {
		return $this->config['action_prefix'] ?? 'github_release_browser';
	}

	/**
	 * Register AJAX handlers for GitHub API calls
	 */
	private function register_ajax_handlers(): void {
		$action_prefix = $this->get_action_prefix();

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

		// Get user repositories
		add_action( "wp_ajax_{$action_prefix}_get_user_repos", array( $this, 'ajax_get_user_repos' ) );
		add_action( "wp_ajax_nopriv_{$action_prefix}_get_user_repos", array( $this, 'ajax_get_user_repos' ) );

		// Clear cache
		add_action( "wp_ajax_{$action_prefix}_clear_cache", array( $this, 'ajax_clear_cache' ) );
		add_action( "wp_ajax_nopriv_{$action_prefix}_clear_cache", array( $this, 'ajax_clear_cache' ) );

		// Test file
		add_action( "wp_ajax_{$action_prefix}_test_file", array( $this, 'ajax_test_file' ) );
		add_action( "wp_ajax_nopriv_{$action_prefix}_test_file", array( $this, 'ajax_test_file' ) );
	}

	/**
	 * AJAX handler for testing file availability
	 */
	public function ajax_test_file(): void {
		$action_prefix = $this->get_action_prefix();
		check_ajax_referer( "{$action_prefix}_nonce", 'nonce' );

		if ( ! current_user_can( 'read' ) ) {
			wp_send_json_error( array( 'message' => 'Unauthorized' ) );
		}

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitized below
		$raw_file_url = $_POST['file_url'] ?? '';
		$file_url     = is_string( $raw_file_url ) ? sanitize_text_field( wp_unslash( $raw_file_url ) ) : '';

		if ( empty( $file_url ) || ! $this->uri_parser->is_github_file( $file_url ) ) {
			wp_send_json_error( array( 'message' => 'Invalid GitHub file URL' ) );
		}

		$parsed = $this->uri_parser->parse( $file_url );

		if ( is_wp_error( $parsed ) ) {
			wp_send_json_error( array( 'message' => $parsed->get_error_message() ) );
		}

		$repo    = $parsed['repo'] ?? '';
		$tag     = $parsed['release'] ?? 'latest';
		$pattern = isset( $parsed['asset'] ) && is_string( $parsed['asset'] ) ? $parsed['asset'] : null;

		// Clear cache to force fresh API request for token validation
		$this->github_api->clear_cache( "release_{$repo}_{$tag}" );

		// Try to resolve the release
		$release = $this->resolve_release( $parsed );

		if ( is_wp_error( $release ) ) {
			wp_send_json_error(
				array(
					'message' => $release->get_error_message(),
					'code'    => $release->get_error_code(),
				)
			);
		}

		// Find asset in release
		$asset = $this->asset_resolver->find_asset_in_release( $release, $pattern );

		if ( ! $asset ) {
			$asset_name = $pattern ?? 'default';
			wp_send_json_error( array( 'message' => "Asset {$asset_name} not found in release" ) );
		}

		wp_send_json_success(
			array(
				'status' => 'ready',
				'size'   => $asset['size'] ?? 0,
				'type'   => $asset['content_type'] ?? '',
				'name'   => $asset['name'] ?? '',
			)
		);
	}

	/**
	 * AJAX handler for getting releases
	 */
	public function ajax_get_releases(): void {
		$action_prefix = $this->get_action_prefix();
		check_ajax_referer( "{$action_prefix}_nonce", 'nonce' );

		// Check user capabilities
		if ( ! current_user_can( 'read' ) ) {
			wp_send_json_error( array( 'message' => esc_html__( 'Unauthorized', 'github-release-browser' ) ) );
		}

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitized below
		$raw_repo = $_POST['repo'] ?? '';
		$raw_page = $_POST['page'] ?? 1;
		$repo     = is_string( $raw_repo ) ? sanitize_text_field( $raw_repo ) : '';
		$page     = is_numeric( $raw_page ) ? (int) $raw_page : 1;

		if ( empty( $repo ) ) {
			wp_send_json_error( array( 'message' => esc_html__( 'Repository name is required', 'github-release-browser' ) ) );
		}

		try {
			$releases = $this->github_api->get_releases( $repo, $page );
			wp_send_json_success( array( 'releases' => $releases ) );
		} catch ( \Exception $e ) {
			wp_send_json_error( array( 'message' => $e->getMessage() ) );
		}
	}

	/**
	 * AJAX handler for getting rate limit
	 */
	public function ajax_get_rate_limit(): void {
		$action_prefix = $this->get_action_prefix();
		check_ajax_referer( "{$action_prefix}_nonce", 'nonce' );

		// Check user capabilities
		if ( ! current_user_can( 'read' ) ) {
			wp_send_json_error( array( 'message' => esc_html__( 'Unauthorized', 'github-release-browser' ) ) );
		}

		try {
			$rate_limit = $this->github_api->get_rate_limit();
			wp_send_json_success( array( 'rate_limit' => $rate_limit ) );
		} catch ( \Exception $e ) {
			wp_send_json_error( array( 'message' => $e->getMessage() ) );
		}
	}

	/**
	 * AJAX handler for parsing URI
	 */
	public function ajax_parse_uri(): void {
		$action_prefix = $this->get_action_prefix();
		check_ajax_referer( "{$action_prefix}_nonce", 'nonce' );

		// Check user capabilities
		if ( ! current_user_can( 'read' ) ) {
			wp_send_json_error( array( 'message' => esc_html__( 'Unauthorized', 'github-release-browser' ) ) );
		}

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitized below
		$raw_uri = $_POST['uri'] ?? '';
		$uri     = is_string( $raw_uri ) ? sanitize_text_field( $raw_uri ) : '';

		if ( empty( $uri ) ) {
			wp_send_json_error( array( 'message' => esc_html__( 'URI is required', 'github-release-browser' ) ) );
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
		$action_prefix = $this->get_action_prefix();
		check_ajax_referer( "{$action_prefix}_nonce", 'nonce' );

		// Check user capabilities
		if ( ! current_user_can( 'read' ) ) {
			wp_send_json_error( array( 'message' => esc_html__( 'Unauthorized', 'github-release-browser' ) ) );
		}

		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitized below
		$raw_asset_url = $_POST['asset_url'] ?? '';
		$asset_url     = is_string( $raw_asset_url ) ? sanitize_text_field( $raw_asset_url ) : '';

		if ( empty( $asset_url ) ) {
			wp_send_json_error( array( 'message' => esc_html__( 'Asset URL is required', 'github-release-browser' ) ) );
		}

		try {
			// Make a request to the GitHub asset URL to follow the redirect to S3
			$token   = $this->config['github_token'];
			$headers = array( 'Accept' => 'application/octet-stream' );

			if ( $token !== '' ) {
				$headers['Authorization'] = "Bearer {$token}";
			}

			// Use HttpClient directly to follow redirect
			$http_client = new \Arts\GH\ReleaseBrowser\Adapters\WordPress\HttpClient();
			$response    = $http_client->get( $asset_url, $headers, array( 'redirection' => 0 ) );

			// GitHub returns 302 redirect to S3
			if ( $response->status_code === 302 && isset( $response->headers['location'] ) ) {
				$download_url = $response->headers['location'];
				wp_send_json_success( array( 'download_url' => $download_url ) );
			} else {
				// Fallback to the original URL if redirect fails
				wp_send_json_success( array( 'download_url' => $asset_url ) );
			}
		} catch ( \Exception $e ) {
			wp_send_json_error( array( 'message' => $e->getMessage() ) );
		}
	}

	/**
	 * AJAX handler for getting user repositories
	 */
	public function ajax_get_user_repos(): void {
		$action_prefix = $this->get_action_prefix();
		check_ajax_referer( "{$action_prefix}_nonce", 'nonce' );

		// Check user capabilities
		if ( ! current_user_can( 'read' ) ) {
			wp_send_json_error( array( 'message' => esc_html__( 'Unauthorized', 'github-release-browser' ) ) );
		}

		try {
			$repos = $this->github_api->get_user_repos();
			wp_send_json_success( array( 'repos' => $repos ) );
		} catch ( \Exception $e ) {
			wp_send_json_error( array( 'message' => $e->getMessage() ) );
		}
	}

	/**
	 * AJAX handler for clearing cache
	 */
	public function ajax_clear_cache(): void {
		$action_prefix = $this->get_action_prefix();
		check_ajax_referer( "{$action_prefix}_nonce", 'nonce' );

		// Check user capabilities
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => esc_html__( 'Unauthorized', 'github-release-browser' ) ) );
		}

		try {
			$this->github_api->clear_cache();
			wp_send_json_success( array( 'message' => esc_html__( 'Cache cleared successfully', 'github-release-browser' ) ) );
		} catch ( \Exception $e ) {
			wp_send_json_error( array( 'message' => $e->getMessage() ) );
		}
	}

	/**
	 * Resolve a release from parsed URI data
	 *
	 * @param array{valid: bool, repo?: string, release?: string, asset?: string|null} $parsed Parsed URI data.
	 * @return array<string, mixed>|\WP_Error Release data or error.
	 */
	private function resolve_release( array $parsed ): array|\WP_Error {
		$repo = $parsed['repo'] ?? '';
		$tag  = $parsed['release'] ?? 'latest';

		// Handle "latest" keyword
		if ( $tag === 'latest' ) {
			// Check if latest release feature is enabled
			if ( ! $this->config['enable_latest_release'] ) {
				return new \WP_Error(
					'pro_feature',
					esc_html__( 'Latest release feature requires pro version', 'github-release-browser' )
				);
			}

			// Fetch the most recent release
			$releases = $this->github_api->get_releases( $repo, 1 );

			if ( ! empty( $releases ) && isset( $releases[0] ) ) {
				return $releases[0];
			}

			return new \WP_Error(
				'release_not_found',
				esc_html__( 'No releases found for repository', 'github-release-browser' )
			);
		}

		// Handle specific release tags
		$release = $this->github_api->get_release_by_tag( $repo, $tag );

		if ( empty( $release ) ) {
			return new \WP_Error(
				'release_not_found',
				sprintf(
					/* translators: 1: release tag, 2: repository name */
					esc_html__( 'Release "%1$s" not found in repository "%2$s"', 'github-release-browser' ),
					$tag,
					$repo
				)
			);
		}

		return $release;
	}
}
