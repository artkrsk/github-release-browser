/**
 * Repository interface for GitHub API
 */
export interface IRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  private: boolean
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