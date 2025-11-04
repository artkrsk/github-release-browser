/**
 * Error constants for consistent error handling
 *
 * Note: These constants reference string keys that are translated
 * via the WordPress i18n system in the backend PHP code.
 * The actual translated values are available via getString()
 */

/** String keys for error messages */
export const ERROR_MESSAGE_KEYS = {
  TOKEN_MISSING: 'error.desc.general',
  TOKEN_INVALID: 'error.desc.invalidToken',
  NETWORK_ERROR: 'error.desc.networkError',
  RATE_LIMIT_EXCEEDED: 'error.desc.rateLimit',
  REPOSITORY_NOT_FOUND: 'error.desc.repositoryNotFound',
  RELEASE_NOT_FOUND: 'error.desc.releaseNotFound',
  UNKNOWN_ERROR: 'error.desc.general'
} as const

/** String keys for error titles */
export const ERROR_TITLE_KEYS = {
  TOKEN_MISSING: 'error.welcome.title',
  TOKEN_INVALID: 'error.title.invalidToken',
  NETWORK_ERROR: 'error.title.networkError',
  RATE_LIMIT_EXCEEDED: 'error.title.rateLimit',
  REPOSITORY_NOT_FOUND: 'error.title.repositoryNotFound',
  RELEASE_NOT_FOUND: 'error.title.releaseNotFound',
  UNKNOWN_ERROR: 'error.title.general'
} as const

/** String keys for error descriptions */
export const ERROR_DESCRIPTION_KEYS = {
  TOKEN_MISSING: 'error.welcome.description',
  TOKEN_INVALID: 'error.desc.invalidToken',
  NETWORK_ERROR: 'error.desc.networkError',
  RATE_LIMIT_EXCEEDED: 'error.desc.rateLimit',
  REPOSITORY_NOT_FOUND: 'error.desc.repositoryNotFound',
  RELEASE_NOT_FOUND: 'error.desc.releaseNotFound',
  UNKNOWN_ERROR: 'error.desc.general'
} as const

/** CSS class names for error states */
export const ERROR_CSS_CLASSES = {
  SETUP: 'github-release-browser-browser__setup',
  ERROR: 'github-release-browser-browser__error',
  SETUP_TITLE: 'github-release-browser-browser__setup-title',
  SETUP_MESSAGE: 'github-release-browser-browser__setup-message',
  SETUP_ACTIONS: 'github-release-browser-browser__setup-actions',
  ERROR_MESSAGE: 'github-release-browser-browser__error-message',
  ERROR_ICON: 'github-release-browser-icon_error'
} as const

/** String keys for UI strings */
export const UI_STRING_KEYS = {
  TRY_AGAIN: 'common.tryAgain',
  LOADING_REPOSITORIES: 'loading.repositories',
  NO_REPOSITORIES: 'repositories.noneFound',
  NO_RESULTS: 'repositories.noResults',
  SELECT_REPOSITORY: 'repositories.select',
  SEARCH_REPOSITORIES: 'repositories.searchPlaceholder',
  REFRESH_REPOSITORIES: 'repositories.refresh',
  BACK_TO_REPOSITORIES: 'assets.backToRepos',
  INSERT_INTO_DOWNLOAD: 'actions.insertIntoDownload',
  UPGRADE_TO_PRO: 'common.upgradeToPro'
} as const

/** Legacy constants for backward compatibility - @deprecated Use UI_STRING_KEYS instead */
export const UI_STRINGS = {
  TRY_AGAIN: 'Try Again',
  LOADING_REPOSITORIES: 'Loading repositories...',
  NO_REPOSITORIES: 'No repositories found',
  NO_RESULTS: 'No repositories match your search',
  SELECT_REPOSITORY: 'Select Repository',
  SEARCH_REPOSITORIES: 'Search repositories...',
  REFRESH_REPOSITORIES: 'Refresh repositories',
  BACK_TO_REPOSITORIES: 'Back to repositories',
  INSERT_INTO_DOWNLOAD: 'Insert into download',
  UPGRADE_TO_PRO: 'Upgrade to Pro'
} as const