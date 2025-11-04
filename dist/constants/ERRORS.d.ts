/**
 * Error constants for consistent error handling
 *
 * Note: These constants reference string keys that are translated
 * via the WordPress i18n system in the backend PHP code.
 * The actual translated values are available via getString()
 */
/** String keys for error messages */
export declare const ERROR_MESSAGE_KEYS: {
    readonly TOKEN_MISSING: "error.desc.general";
    readonly TOKEN_INVALID: "error.desc.invalidToken";
    readonly NETWORK_ERROR: "error.desc.networkError";
    readonly RATE_LIMIT_EXCEEDED: "error.desc.rateLimit";
    readonly REPOSITORY_NOT_FOUND: "error.desc.repositoryNotFound";
    readonly RELEASE_NOT_FOUND: "error.desc.releaseNotFound";
    readonly UNKNOWN_ERROR: "error.desc.general";
};
/** String keys for error titles */
export declare const ERROR_TITLE_KEYS: {
    readonly TOKEN_MISSING: "error.welcome.title";
    readonly TOKEN_INVALID: "error.title.invalidToken";
    readonly NETWORK_ERROR: "error.title.networkError";
    readonly RATE_LIMIT_EXCEEDED: "error.title.rateLimit";
    readonly REPOSITORY_NOT_FOUND: "error.title.repositoryNotFound";
    readonly RELEASE_NOT_FOUND: "error.title.releaseNotFound";
    readonly UNKNOWN_ERROR: "error.title.general";
};
/** String keys for error descriptions */
export declare const ERROR_DESCRIPTION_KEYS: {
    readonly TOKEN_MISSING: "error.welcome.description";
    readonly TOKEN_INVALID: "error.desc.invalidToken";
    readonly NETWORK_ERROR: "error.desc.networkError";
    readonly RATE_LIMIT_EXCEEDED: "error.desc.rateLimit";
    readonly REPOSITORY_NOT_FOUND: "error.desc.repositoryNotFound";
    readonly RELEASE_NOT_FOUND: "error.desc.releaseNotFound";
    readonly UNKNOWN_ERROR: "error.desc.general";
};
/** CSS class names for error states */
export declare const ERROR_CSS_CLASSES: {
    readonly SETUP: "github-release-browser-browser__setup";
    readonly ERROR: "github-release-browser-browser__error";
    readonly SETUP_TITLE: "github-release-browser-browser__setup-title";
    readonly SETUP_MESSAGE: "github-release-browser-browser__setup-message";
    readonly SETUP_ACTIONS: "github-release-browser-browser__setup-actions";
    readonly ERROR_MESSAGE: "github-release-browser-browser__error-message";
    readonly ERROR_ICON: "github-release-browser-icon_error";
};
/** String keys for UI strings */
export declare const UI_STRING_KEYS: {
    readonly TRY_AGAIN: "common.tryAgain";
    readonly LOADING_REPOSITORIES: "loading.repositories";
    readonly NO_REPOSITORIES: "repositories.noneFound";
    readonly NO_RESULTS: "repositories.noResults";
    readonly SELECT_REPOSITORY: "repositories.select";
    readonly SEARCH_REPOSITORIES: "repositories.searchPlaceholder";
    readonly REFRESH_REPOSITORIES: "repositories.refresh";
    readonly BACK_TO_REPOSITORIES: "assets.backToRepos";
    readonly INSERT_INTO_DOWNLOAD: "actions.insertIntoDownload";
    readonly UPGRADE_TO_PRO: "common.upgradeToPro";
};
/** Legacy constants for backward compatibility - @deprecated Use UI_STRING_KEYS instead */
export declare const UI_STRINGS: {
    readonly TRY_AGAIN: "Try Again";
    readonly LOADING_REPOSITORIES: "Loading repositories...";
    readonly NO_REPOSITORIES: "No repositories found";
    readonly NO_RESULTS: "No repositories match your search";
    readonly SELECT_REPOSITORY: "Select Repository";
    readonly SEARCH_REPOSITORIES: "Search repositories...";
    readonly REFRESH_REPOSITORIES: "Refresh repositories";
    readonly BACK_TO_REPOSITORIES: "Back to repositories";
    readonly INSERT_INTO_DOWNLOAD: "Insert into download";
    readonly UPGRADE_TO_PRO: "Upgrade to Pro";
};
