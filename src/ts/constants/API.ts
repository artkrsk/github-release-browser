export const DEFAULT_PROTOCOL = 'github-release://'
export const DEFAULT_DIR_PROTOCOL = 'github-dir://'
export const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB']
export const API_ACTIONS = {
  GET_RELEASES: 'get_releases',
  GET_RATE_LIMIT: 'get_rate_limit',
  GET_USER_REPOS: 'get_user_repos',
  CLEAR_CACHE: 'clear_cache',
  PARSE_URI: 'parse_uri',
  GET_DOWNLOAD_URL: 'get_download_url',
  GET_BRANCHES: 'get_branches',
  GET_CONTENTS: 'get_contents',
  GET_ARCHIVE_URL: 'get_archive_url',
  GET_REPO_INFO: 'get_repo_info',
} as const
