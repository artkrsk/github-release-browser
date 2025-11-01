import { IRelease, IRateLimit } from '../interfaces/IGitHub'
import { API_ACTIONS } from '../constants/API'

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

  private async makeRequest(action: string, data: Record<string, any> = {}): Promise<any> {
    const formData = new FormData()
    
    // Add nonce
    formData.append('nonce', this.nonce)
    
    // Add action
    formData.append('action', this.getAction(action))
    
    // Add data
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value)
    })

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.data?.message || 'Unknown error occurred')
    }

    return result.data
  }

  async getReleases(repo: string, page = 1): Promise<IRelease[]> {
    return this.makeRequest(API_ACTIONS.GET_RELEASES, { repo, page })
  }

  async getRateLimit(): Promise<IRateLimit> {
    return this.makeRequest(API_ACTIONS.GET_RATE_LIMIT)
  }

  async parseUri(uri: string): Promise<any> {
    return this.makeRequest('parse_uri', { uri })
  }

  async getDownloadUrl(assetUrl: string): Promise<string> {
    const result = await this.makeRequest('get_download_url', { asset_url: assetUrl })
    return result.download_url
  }
}
