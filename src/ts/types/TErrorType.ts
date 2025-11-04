/**
 * Error classification types for consistent error handling
 */

/** Error types for different error scenarios */
export type TErrorType =
  | 'token_missing'
  | 'token_invalid'
  | 'network'
  | 'rate_limit'
  | 'repository_not_found'
  | 'release_not_found'
  | 'unknown'

/** Error context information */
export interface TErrorContext {
  /** Type of error */
  type: TErrorType
  /** Error message */
  message: string
  /** Whether the error is retryable */
  retryable: boolean
  /** CSS class name for error display */
  className: string
  /** Title for error display */
  title?: string
  /** Description for error display */
  description?: string
}