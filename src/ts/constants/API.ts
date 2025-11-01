export const DEFAULT_PROTOCOL = 'github-release://'
export const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB']
export const API_ACTIONS = {
  GET_RELEASES: 'get_releases',
  GET_RATE_LIMIT: 'get_rate_limit',
} as const

export const DEFAULT_CONFIG = {
  protocol: DEFAULT_PROTOCOL,
  features: {
    useLatestRelease: true,
  },
  strings: {
    loading: 'Loading...',
    error: 'An error occurred',
    noReleases: 'No releases found',
    noAssets: 'No assets found',
    selectRepo: 'Select a repository',
    selectRelease: 'Select a release',
    selectAsset: 'Select an asset',
    download: 'Download',
    back: 'Back',
    search: 'Search',
    rateLimit: 'API Rate Limit',
    remaining: 'remaining',
    of: 'of',
    requests: 'requests',
  },
} as const
