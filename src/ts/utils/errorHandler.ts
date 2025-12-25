import { getString } from './getString'

/**
 * Error handling utilities
 */

/**
 * Handle API errors with specific messages
 */
export const handleApiError = (
  error: any,
  defaultMessage: string = getString('error.unknownError')
): string => {
  if (error?.message) {
    return error.message
  }

  if (error?.data?.message) {
    return error.data.message
  }

  return defaultMessage
}
