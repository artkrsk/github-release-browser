# Developer Reference

The public contract of `arts/github-release-browser` (Composer) and `@arts/github-release-browser`
(npm). It follows semver: anything below changes only in a major release, recorded in `CHANGELOG.md`.
Everything not listed here is internal.

Consumers vendor the package through Strauss, which prefixes its class names per build. Inside one
plugin, type-hint and call the classes freely; across plugins, only plain arrays, scalars and
`\WP_Error` (checked with `is_wp_error()`) are shared.

## Setup

```php
use Arts\GH\ReleaseBrowser\Browser;

$browser = new Browser(
	array(
		'github_token'  => $token,
		'capability'    => 'edit_products',
		'action_prefix' => 'my_plugin',
		'cache_prefix'  => 'my_plugin_',
		'protocol'      => 'my-plugin://',
	)
);

$browser->register_modal_integration(); // Optional: the "GitHub Releases" media-modal tab.

$api      = $browser->get_github_api();     // IPlatformAPI
$parser   = $browser->get_uri_parser();     // URIParser
$resolver = $browser->get_asset_resolver(); // AssetResolver
```

Construct it once per request, before `admin_enqueue_scripts`; the constructor registers the AJAX
handlers and the admin enqueue. Pass an `IPlatformAPI` as the second argument to target a host other
than GitHub.

| Key | Default | |
|---|---|---|
| `github_token` | `''` | Stays server-side; the UI never sees it. |
| `capability` | `manage_options` | Required by every AJAX handler and by the enqueue that hands out the nonce. |
| `action_prefix` | `github_release_browser` | AJAX actions are `{action_prefix}_{name}`, the nonce `{action_prefix}_nonce`. |
| `cache_prefix` | `gh_browser_` | Transient prefix. |
| `request_timeout` | `30` | Seconds allowed for each GitHub API call. `download_asset_to_file()` keeps its own `$timeout`. |
| `protocol` / `dir_protocol` | `github-release://` / `github-dir://` | URI schemes the UI inserts and `URIParser` reads. |
| `enable_latest_release` | `false` | Allows the `latest` tag; without it resolving `latest` is a `pro_feature` error. |
| `enable_directories` | `false` | Registers the branch and directory handlers and shows directory mode. |
| `settings_url`, `upgrade_url` | | Links the UI shows for a missing token and for locked features. |
| `strings` | English defaults | Flat map of dotted keys. Passing it replaces the whole default map. |
| `features`, `text_domain`, `assets_url` | | Extra UI feature flags, the JS text domain, and where the bundle loads from. |

## Platform API

`IPlatformAPI`: every method that talks to the platform returns its value or a `\WP_Error`. An empty
array is a genuinely empty result, never a failure, and a `\WP_Error` is truthy, so `empty()` does not
detect one.

```php
$release = $api->get_release_by_tag( 'owner/repo', 'v1.2.0' );

if ( is_wp_error( $release ) ) {
	$code   = $release->get_error_code();          // 'not_found', 'token_invalid', …
	$status = $release->get_error_data()['status'] ?? 0; // HTTP status, when a response caused it.
	return;
}
```

| Method | Returns |
|---|---|
| `get_releases( $repo, $page = 1 )` | List of releases, newest first. Releases with no uploaded assets get synthetic `Source code (zip/tar.gz)` assets with ids `-1` / `-2`. |
| `get_release_by_tag( $repo, $tag )` | One release; `not_found` when the tag has none. |
| `get_user_repos()` | Repositories the token can see. |
| `get_rate_limit( $token = '' )` | `{remaining, limit}`. An explicit token is checked uncached. |
| `get_download_url( $repo, $asset_id )` | Short-lived signed URL for a release asset. |
| `download_asset_to_file( $repo, $asset_id, $timeout = 60, $max_bytes = 0 )` | Path to a temp file the caller must delete. No file is left behind on failure. |
| `test_connection( $token = '' )` | `true`. |
| `get_branches( $repo )`, `get_contents( $repo, $path, $ref )`, `get_archive_url( $repo, $ref )`, `get_repo_info( $repo )` | Directory browsing. `get_contents()` lists directories only. |

`download_asset_to_file()` streams to disk and never sends the token to the storage host. `max_bytes`
caps what reaches the disk, not what is transferred: WordPress keeps receiving past the cap and
discards the rest, so the time spent is the same. A caller that must avoid pulling a large file checks
the asset's `size` from the release payload first.

### Error codes

| Code | Meaning |
|---|---|
| `token_missing` | The request needs a token and none is configured (401/403 without one). |
| `token_invalid` | The token was rejected (401). |
| `rate_limit_exceeded` | 429, or 403 with `x-ratelimit-remaining: 0` or `retry-after`. |
| `forbidden` | Any other 403: the token lacks access. |
| `not_found` | 404. GitHub also answers 404 for a private repository the token cannot see. |
| `api_error` | Any other non-success status. |
| `invalid_response` | A success status with a body or redirect the client cannot use. |
| `http_request_failed` | The transport failed before any response (WordPress's own code). |
| `invalid_path`, `not_a_directory` | `get_contents()`: a path with `..` segments, or a path that is a file. |
| `invalid_asset`, `download_failed`, `file_too_large` | `download_asset_to_file()`: a synthetic asset id, a failed temp file or storage response, a file over `max_bytes`. |

## Caches

Responses are cached in transients: releases, branches, contents and a release by tag for 5 minutes;
the rate limit for 1 minute; user repositories and repository info for 1 hour. Clear them through
the API, never by key:

```php
$api->clear_releases_cache( $repo );       // The releases list, so `latest` sees a new release.
$api->clear_release_cache( $repo, $tag );  // One release, by the tag exactly as it was requested.
$api->clear_branches_cache( $repo );       // Branches and repository info.
$api->clear_account_cache();               // User repositories and the configured token's rate limit.
```

Directory listings are not clearable; they expire on their own.

## AJAX

Each handler is registered as `wp_ajax_{action_prefix}_{name}` and checks the
`{action_prefix}_nonce` nonce (POST field `nonce`) and the `capability`. There are no `nopriv`
handlers.

- Always: `get_releases`, `get_rate_limit`, `parse_uri`, `get_download_url`, `get_user_repos`,
  `clear_cache`, `clear_releases_cache`, `test_file`.
- With `enable_directories`: `get_branches`, `get_contents`, `get_archive_url`, `get_repo_info`,
  `clear_branches_cache`.

Success is `{success: true, data: {…}}`. A failed nonce check is WordPress's own `-1` with HTTP 403;
every other failure is HTTP 200 with `{success: false, data: {message, code?, status?}}`, where `code`
and `status` are those of the `\WP_Error` above. `clear_cache` clears the account cache.

## Frozen identifiers

URI protocols `github-release://` / `github-dir://` · script and style handle `github-release-browser`
· JS globals `window.githubReleaseBrowserConfig` (the localized config) and
`window.ArtsGitHubReleaseBrowser` (the `BrowserApp` component; mount it into your own frame instead
of relying on the auto-mount) · DOM root `#github-release-browser-root` · media tab
`github_releases` · CSS class prefix `github-release-browser-` and CSS custom properties `--gh-rb-*`.

## What stays out

- Transient key names. They are private to `GitHubAPI`; use the clear methods.
- `HttpClient`, `Cache`, `Config` and `Response`: adapters behind the core, not entry points.
- The `ajax_*` methods on `Browser`. They are public only so WordPress can call them; integrate over
  AJAX instead.
- The React components' internals and markup, other than the identifiers above.
