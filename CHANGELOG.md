# Changelog

`composer.json` `version`, `package.json` `version`, the entry below and the git tag move together.

## 2.1.0

### Added

- `request_timeout` Browser config key: seconds allowed for each GitHub API call. Unset keeps the
  HTTP client's 30 seconds. A plugin that resolves a release while a customer waits on a download can
  fail fast instead of holding a PHP worker. `download_asset_to_file()` keeps its own `$timeout`.

## 2.0.0

Failures stop pretending to be results. Breaking for every caller of `IPlatformAPI`; see the upgrade
notes at the end.

### Changed

- Every `IPlatformAPI` method that talks to GitHub returns its value or a `\WP_Error` whose data is
  `['status' => int]` when an HTTP response caused it. Before, failure looked like `[]` ("no releases"),
  `remaining: 0`, `private: false`, `''`, or the unresolved API URL. The codes are listed on
  `IPlatformAPI` and in `docs/developers.md`.
- `test_connection()` returns `true` or a `\WP_Error` naming the cause.
- `get_contents()` returns `invalid_path` / `not_a_directory` instead of `[]` for a bad path or a file.
- `IHttpClient::get()` returns `Response|\WP_Error`: a transport failure is WordPress's own
  `http_request_failed` error instead of an invented `Response(500)`.
- AJAX failures are `wp_send_json_error( {message, code, status} )` for every handler.
  `get_user_repos` no longer reports an error inside a success response (`{repos: {error: true}}`).
- `get_releases()` caches the first page only, so `clear_releases_cache()` clears everything it covers.
- The `clear_cache` AJAX handler checks the configured `capability` like the others, not
  `manage_options`.

### Added

- `clear_release_cache( $repo, $tag )` and `clear_account_cache()` on `IPlatformAPI`, so no caller has
  to build a transient key.
- `docs/developers.md`: the public contract, error codes and frozen identifiers.
- `@since` on the `IPlatformAPI` methods and `Browser`'s public API.

### Removed

- `IPlatformAPI::clear_cache( $pattern )`. It took an exact transient key; use
  `clear_release_cache()`, `clear_releases_cache()`, `clear_branches_cache()` or `clear_account_cache()`.

### Fixed

- `download_asset_to_file()` with `max_bytes` refused nothing: WordPress truncates a capped stream to
  exactly that size and still reports 200, so an oversized asset came back as a truncated file. It now
  returns `file_too_large`.
- `ajax_get_download_url` went around the injected platform adapter with its own HTTP client and fell
  back to returning the API URL it was given; it now calls `get_download_url()` and reports the error.
- A token, rate-limit or network failure while resolving a release in `test_file` was reported as
  "release not found".
- The UI bundle was always enqueued as version `1.0.0`, so browsers kept stale copies across
  releases; it is now versioned by file modification time.

### Upgrading from 1.x

- Check every `IPlatformAPI` result with `is_wp_error()` before using it. `empty()` and `'' ===` no
  longer detect failure, and a `\WP_Error` is truthy.
- Replace hand-built `delete_transient( '{prefix}release_{repo}_{tag}' )` with
  `clear_release_cache( $repo, $tag )`.
- A `method_exists( $api, 'download_asset_to_file' )` guard can go: every 2.x build has it.
- Pin `arts/github-release-browser` to `^2.0` instead of `@dev`.

## 1.1.3

### Fixed

- `test_file` reports a file as ready only when GitHub would serve it (a signed download URL is
  issued), not merely when the asset is listed.
- `test_file` clears the cache key that `latest` actually reads.

## 1.1.2

### Changed

- `get_rate_limit()` and its AJAX handler accept an optional token, checked uncached, so a token being
  validated before it is saved reports its own limit.

## 1.1.1

### Fixed

- Styles for `release-list__error`, `branch-selector__dropdown` and `directory__root-option`, which the
  components rendered but the Sass never defined.

## 1.1.0

### Security

- AJAX handlers required only `read`, which every logged-in user holds; they now require the
  `capability` config (default `manage_options`), which also gates the admin enqueue that localizes the
  nonce. All `wp_ajax_nopriv_` registrations are removed.
- `get_download_url` attached the configured token to a caller-supplied URL with no host check; it now
  refuses anything but `https://api.github.com`.

### Added

- `IPlatformAPI::download_asset_to_file()` streams a release asset to a local file.

### Fixed

- `AssetResolver::find_asset()` skips synthesized source-archive assets (ids `<= 0`) when matching a
  pattern.

## 1.0.2

### Added

- Directory browsing behind `enable_directories`: `get_branches()`, `get_contents()`,
  `get_archive_url()`, `get_repo_info()` and the `github-dir://` protocol.
- `IPlatformAPI`, with the platform adapter injectable through `Browser`'s second constructor argument.
- `clear_releases_cache()` and `clear_branches_cache()`, and refresh buttons in the UI.
- The built UI bundle ships in `src/php/libraries`, so a `--no-dev` Composer install needs no build.

### Security

- `get_contents()` rejects path traversal through `validate_file()`.

## 1.0.0

Initial release: browse a repository's releases and assets from the WordPress media modal and insert
a `github-release://` URI, with the GitHub token kept server-side.
