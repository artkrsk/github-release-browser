/**
 * Interfaces for GitHub API data structures
 */

export interface IRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  watchers_count: number
  forks_count: number
  language: string | null
  updated_at: string
  created_at: string
  pushed_at: string
  default_branch: string
  owner: {
    login: string
    id: number
    avatar_url: string
    html_url: string
    type: string
  }
}

export interface IAsset {
  url: string
  id: number
  name: string
  label: string | null
  content_type: string
  state: 'uploaded' | string
  size: number
  download_count: number
  created_at: string
  updated_at: string
  browser_download_url: string
}

export interface IRelease {
  url: string
  html_url: string
  assets_url: string
  upload_url: string
  tarball_url: string
  zipball_url: string
  id: number
  tag_name: string
  target_commitish: string
  name: string | null
  body: string | null
  draft: boolean
  prerelease: boolean
  created_at: string
  published_at: string
  author: {
    login: string
    id: number
    avatar_url: string
    html_url: string
    type: string
  }
  assets: IAsset[]
}

export interface IRateLimit {
  resources: {
    core: {
      limit: number
      remaining: number
      reset: number
      used: number
    }
    search: {
      limit: number
      remaining: number
      reset: number
      used: number
    }
    graphql: {
      limit: number
      remaining: number
      reset: number
      used: number
    }
  }
  rate: {
    limit: number
    remaining: number
    reset: number
    used: number
  }
}

export interface ISelectedAsset {
  repo: string
  release: string
  asset: IAsset
  downloadUrl: string
}
