import type React from 'react'
import { IFeatureBadgeProps } from '../interfaces'

/**
 * Feature/Pro badge - matches original EDD ProBadge styling
 */
export const FeatureBadge: React.FC<IFeatureBadgeProps> = ({
  feature,
  className = ''
}) => {
  return (
    <span className={className ? `github-release-browser-pro-badge ${className}` : 'github-release-browser-pro-badge'}>
      {feature}
    </span>
  )
}
