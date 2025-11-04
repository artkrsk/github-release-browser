import { IRelease } from './IRelease'

/**
 * Props for ReleaseList component
 */
export interface IReleaseListProps {
  releases: IRelease[]
  selectedRelease: string | null
  onSelectRelease: (release: IRelease | 'latest') => void
  repository?: string
  strings?: Record<string, string>
  features?: { useLatestRelease?: boolean; [key: string]: any }
  upgradeUrl?: string
  error?: string | null
  onRetry?: () => void
}
