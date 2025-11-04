import type React from 'react'
import { ILoadingStateProps } from '../interfaces/ILoadingStateProps'
import { getString } from '../utils/getString'

const { Spinner } = wp.components

/**
 * Loading state component with spinner and message
 */
export const LoadingState: React.FC<ILoadingStateProps> = ({
  message,
  className = ''
}) => {
  const defaultMessage = message || getString('loading.repositories')

  return (
    <div className={className ? `github-release-browser-browser__loading ${className}` : 'github-release-browser-browser__loading'}>
      <Spinner />
      <p>{defaultMessage}</p>
    </div>
  )
}
