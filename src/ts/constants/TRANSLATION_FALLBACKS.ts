/**
 * Default fallback translations for development and testing
 * These are used when translation keys are not found in the backend configuration
 */

export const TRANSLATION_FALLBACKS: Record<string, string> = {
  // Repository related
  'repositories.noResults': 'No repositories match your search',
  'repositories.noneFound': 'No repositories found',
  'repositories.select': 'Select Repository',
  'repositories.refresh': 'Refresh repositories',
  'repositories.searchPlaceholder': 'Search repositories...',

  // Common UI strings
  'common.tryAgain': 'Try Again',
  'common.retry': 'Retry →',
  'common.getPro': 'Get Pro',
  'common.upgradeToPro': 'Upgrade to Pro',
  'common.loading': 'Loading...',

  // Actions
  'actions.insertIntoDownload': 'Insert into download',

  // Loading states
  'loading.repositories': 'Loading repositories...',

  // Error states
  'error.welcome.title': 'Welcome to Release Browser',
  'error.welcome.description': 'To browse and insert files from your GitHub releases, you need to configure your GitHub Personal Access Token.',
  'error.title.invalidToken': 'Invalid GitHub Token',
  'error.desc.invalidToken': 'Your GitHub Personal Access Token is invalid or has been revoked. Please update your token in the settings.',
  'error.failedToFetchReleases': 'Failed to fetch releases.',
  'error.goToSettings': 'Go to Settings',
  'error.archiveUrlFailed': 'Failed to get archive URL',
  'error.refreshFailed': 'Failed to refresh',

  // Time formatting for format utility
  'time.today': 'today',
  'time.yesterday': 'yesterday',
  'time.daysAgo': '%d days ago',
  'time.weeksAgo': '%d weeks ago',
  'time.monthsAgo': '%d months ago',
  'time.yearsAgo': '%d years ago',

  // Assets
  'assets.backToRepos': 'Back to repositories',
  'assets.assetsIn': 'Assets in',
  'assets.latest': 'latest',
  'assets.noAssets': 'No assets found in this release',
  'assets.asset': 'asset',
  'assets.assets': 'assets',

  // Releases
  'releases.noReleases': 'No releases found.',
  'releases.createOne': 'Create one →',
  'releases.useLatest': 'Use Latest Release',
  'releases.latestDescription': 'Automatically serve the latest published release',
  'releases.title': 'Releases',

  // Directory browsing
  'directory.root': 'Root',
  'directory.noFolders': 'No folders in this directory',
  'directory.useCurrentFolder': 'Use current folder',
  'directory.branch': 'Branch',
  'directory.branchDefault': 'default',
  'directory.contentMode': 'Content Mode',
  'directory.modeReleases': 'Releases',
  'directory.modeDirectory': 'Directory'
};