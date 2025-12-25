/**
 * Translation key interface for the GitHub Release Browser translation system
 * Defines all available translation keys used throughout the application
 */
export interface IStringKeys {
    'actions.insertIntoDownload': string;
    'errors.networkError': string;
    'errors.unknownError': string;
    'repositories.searchPlaceholder': string;
    'repositories.select': string;
    'repositories.refresh': string;
    'repositories.noResults': string;
    'repositories.noneFound': string;
    'releases.noReleases': string;
    'releases.createOne': string;
    'releases.useLatest': string;
    'releases.latestDescription': string;
    'releases.title': string;
    'assets.backToRepos': string;
    'assets.assetsIn': string;
    'assets.latest': string;
    'assets.noAssets': string;
    'assets.asset': string;
    'assets.assets': string;
    'loading.repositories': string;
    'common.tryAgain': string;
    'common.retry': string;
    'common.getPro': string;
    'common.upgradeToPro': string;
    'common.loading': string;
    'time.today': string;
    'time.yesterday': string;
    'time.daysAgo': string;
    'time.weeksAgo': string;
    'time.monthsAgo': string;
    'time.yearsAgo': string;
    'error.title.invalidToken': string;
    'error.title.networkError': string;
    'error.title.rateLimit': string;
    'error.title.repositoryNotFound': string;
    'error.title.releaseNotFound': string;
    'error.title.general': string;
    'error.desc.invalidToken': string;
    'error.desc.networkError': string;
    'error.desc.rateLimit': string;
    'error.desc.repositoryNotFound': string;
    'error.desc.releaseNotFound': string;
    'error.desc.general': string;
    'error.welcome.title': string;
    'error.welcome.description': string;
    'error.goToSettings': string;
    'error.failedToFetchReleases': string;
    'error.archiveUrlFailed': string;
    'error.refreshFailed': string;
    'directory.branch': string;
    'directory.branchDefault': string;
    'directory.root': string;
    'directory.noFolders': string;
    'directory.useCurrentFolder': string;
    'directory.contentMode': string;
    'directory.modeReleases': string;
    'directory.modeDirectory': string;
}
export type StringKey = keyof IStringKeys;
