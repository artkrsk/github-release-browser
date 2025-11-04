/**
 * Translation key interface for the GitHub Release Browser translation system
 * Defines all available translation keys used throughout the application
 */
export interface IStringKeys {
  // Actions
  'actions.insertIntoDownload': string;

  // Errors
  'errors.networkError': string;
  'errors.unknownError': string;

  // Repositories
  'repositories.searchPlaceholder': string;
  'repositories.select': string;
  'repositories.refresh': string;
  'repositories.noResults': string;
  'repositories.noneFound': string;

  // Releases
  'releases.noReleases': string;
  'releases.createOne': string;
  'releases.useLatest': string;
  'releases.latestDescription': string;
  'releases.title': string;

  // Assets
  'assets.backToRepos': string;
  'assets.assetsIn': string;
  'assets.latest': string;
  'assets.noAssets': string;
  'assets.asset': string;
  'assets.assets': string;

  // Loading
  'loading.repositories': string;

  // Common
  'common.tryAgain': string;
  'common.retry': string;
  'common.getPro': string;
  'common.upgradeToPro': string;

  // Time formatting
  'time.today': string;
  'time.yesterday': string;
  'time.daysAgo': string;
  'time.weeksAgo': string;
  'time.monthsAgo': string;
  'time.yearsAgo': string;

  // Error titles
  'error.title.invalidToken': string;
  'error.title.networkError': string;
  'error.title.rateLimit': string;
  'error.title.repositoryNotFound': string;
  'error.title.releaseNotFound': string;
  'error.title.general': string;

  // Error descriptions
  'error.desc.invalidToken': string;
  'error.desc.networkError': string;
  'error.desc.rateLimit': string;
  'error.desc.repositoryNotFound': string;
  'error.desc.releaseNotFound': string;
  'error.desc.general': string;

  // Welcome message
  'error.welcome.title': string;
  'error.welcome.description': string;
  'error.goToSettings': string;

  // Error messages
  'error.failedToFetchReleases': string;
}

// Export type for use in components
export type StringKey = keyof IStringKeys;