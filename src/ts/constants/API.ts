export const DEFAULT_PROTOCOL = 'github-release://'
export const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB']
export const API_ACTIONS = {
  GET_RELEASES: 'get_releases',
  GET_RATE_LIMIT: 'get_rate_limit',
  GET_USER_REPOS: 'get_user_repos',
  CLEAR_CACHE: 'clear_cache',
  PARSE_URI: 'parse_uri',
  GET_DOWNLOAD_URL: 'get_download_url',
} as const
