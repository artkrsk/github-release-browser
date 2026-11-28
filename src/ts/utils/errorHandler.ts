import { getString } from './getString'

/**
 * Error handling utilities
 */

/**
 * Message from a thrown Error, else from a `{ data: { message } }` response, else the default
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
