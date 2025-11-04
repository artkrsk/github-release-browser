import { IRelease, IRateLimit, IRepo } from '../interfaces'
import { IApiResponse } from '../interfaces/IApiResponse'
import { API_ACTIONS } from '../constants'
import { getString } from '../utils/getString'

export class GitHubService {
  private apiUrl: string
  private nonce: string
  private actionPrefix: string

  constructor(config: { apiUrl: string; nonce: string; actionPrefix: string }) {
    this.apiUrl = config.apiUrl
    this.nonce = config.nonce
    this.actionPrefix = config.actionPrefix
  }

  private getAction(action: string): string {
    return `${this.actionPrefix}_${action}`
  }

  private async makeRequest(action: string, data: Record<string, unknown> = {}): Promise<IApiResponse> {
    const formData = new FormData()

    // Add nonce
    formData.append('nonce', this.nonce)

    // Add action
    formData.append('action', this.getAction(action))

    // Add data
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        formData.append(key, String(data[key]))
      }
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin'
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.data?.message || 'Unknown error occurred')
    }

    return result as IApiResponse
  }

  async getReleases(repo: string, page = 1): Promise<IRelease[]> {
    const result = await this.makeRequest(API_ACTIONS.GET_RELEASES, { repo, page })
    return result.data.releases || []
  }

  async getRateLimit(): Promise<IRateLimit> {
    const result = await this.makeRequest(API_ACTIONS.GET_RATE_LIMIT)
    return result.data.rate_limit as IRateLimit
  }

  async parseUri(uri: string): Promise<Record<string, unknown>> {
    const result = await this.makeRequest('parse_uri', { uri })
    return result.data
  }

  async getDownloadUrl(assetUrl: string): Promise<string> {
    const result = await this.makeRequest('get_download_url', { asset_url: assetUrl })
    return result.data.download_url as string
  }

  async getUserRepos(): Promise<IRepo[]> {
    const result = await this.makeRequest('get_user_repos')

    // Check if backend returned an error structure
    if (result.data.repos && 'error' in result.data.repos) {
      const error = result.data.repos as any
      let errorMessage = error.message || 'Unknown error occurred'

      // Use more user-friendly messages for specific error codes
      if (error.error_code === 'token_missing') {
        errorMessage = getString('error.welcome.description')
      } else if (error.error_code === 'token_invalid') {
        errorMessage = getString('error.desc.invalidToken')
      }

      throw new Error(errorMessage)
    }

    return result.data.repos || []
  }

  async clearCache(): Promise<void> {
    await this.makeRequest('clear_cache')
  }
}
