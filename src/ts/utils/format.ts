import { SIZE_UNITS } from '../constants'
import { getString } from './getString'

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const units = [...SIZE_UNITS]
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

/**
 * Format date in a readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

/**
 * Format relative time
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return getString('time.today')
  if (diffDays === 1) return getString('time.yesterday')
  if (diffDays < 7) return getString('time.daysAgo').replace('%d', diffDays.toString())
  if (diffDays < 30) return getString('time.weeksAgo').replace('%d', Math.floor(diffDays / 7).toString())
  if (diffDays < 365) return getString('time.monthsAgo').replace('%d', Math.floor(diffDays / 30).toString())
  return getString('time.yearsAgo').replace('%d', Math.floor(diffDays / 365).toString())
}
