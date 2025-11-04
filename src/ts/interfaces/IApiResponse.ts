// Import required types
import type { IRepo } from './IRepo'
import type { IRelease } from './IRelease'
import type { IRateLimit } from './IRateLimit'

/**
 * API Response interface for GitHub Service
 */
export interface IApiResponse {
  success: boolean
  data: {
    repos?: IRepo[] | {
      error: boolean
      error_code?: 'token_missing' | 'token_invalid' | 'unknown_error'
      message?: string
    }
    releases?: IRelease[]
    rate_limit?: IRateLimit
    download_url?: string
    message?: string
    [key: string]: unknown
  }
}