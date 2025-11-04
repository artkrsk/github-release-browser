import type React from 'react'
import { IErrorStateProps } from '../interfaces/IErrorStateProps'
import { getString } from '../utils/getString'

const { Button } = wp.components

/**
 * Detect error type using explicit string matching
 */
export function detectErrorType(error: string): 'token_missing' | 'token_invalid' | 'general' {
  // Remove any leading numbers and clean the error message
  const cleanError = error.replace(/^\d+/, '').trim()
  const lowerError = cleanError.toLowerCase()

  // Token missing errors
  if (
    lowerError.includes('not configured') ||
    lowerError.includes('token not configured') ||
    lowerError.includes('missing') ||
    lowerError.includes('required') ||
    lowerError.includes('configure your github personal access token') ||
    lowerError.includes('personal access token') ||
    (lowerError.includes('configure') && lowerError.includes('token'))
  ) {
    return 'token_missing'
  }

  // Token invalid errors
  if (
    lowerError.includes('invalid') &&
    lowerError.includes('token')
  ) {
    return 'token_invalid'
  }

  return 'general'
}

/**
 * Error state component with retry functionality
 */
export const ErrorState: React.FC<IErrorStateProps> = ({
  error,
  onRetry,
  className = '',
  children
}) => {
  // Use configurable error detection from global config
  const errorType = detectErrorType(error)

  // Get settings URL from global config
  const settingsUrl = window.githubReleaseBrowserConfig?.settingsUrl

  return (
    <div className={`github-release-browser-browser__error ${className}`}>
      {children || (
        <>
          {errorType === 'token_missing' ? (
            <>
              <h3 className="github-release-browser-browser__setup-title">
                {getString('error.welcome.title')}
              </h3>
              <p className="github-release-browser-browser__setup-message">
                {getString('error.welcome.description')}
              </p>
              <div className="github-release-browser-browser__setup-actions">
                {settingsUrl && (
                  <Button
                    variant="primary"
                    onClick={() => window.open(settingsUrl, '_blank')}
                  >
                    {getString('error.goToSettings')}
                  </Button>
                )}
                <Button variant="secondary" onClick={onRetry}>
                  {getString('common.tryAgain')}
                </Button>
              </div>
            </>
          ) : errorType === 'token_invalid' ? (
            <>
              <h3 className="github-release-browser-browser__setup-title">
                {getString('error.title.invalidToken')}
              </h3>
              <p className="github-release-browser-browser__setup-message">
                {getString('error.desc.invalidToken')}
              </p>
              <div className="github-release-browser-browser__setup-actions">
                {settingsUrl && (
                  <Button
                    variant="primary"
                    onClick={() => window.open(settingsUrl, '_blank')}
                  >
                    {getString('error.goToSettings')}
                  </Button>
                )}
                <Button variant="secondary" onClick={onRetry}>
                  {getString('common.tryAgain')}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="github-release-browser-browser__error-message">
                <span className="github-release-browser-icon_error"></span>
                {error}
              </div>
              <Button variant="secondary" onClick={onRetry}>
                {getString('common.tryAgain')}
              </Button>
            </>
          )}
        </>
      )}
    </div>
  )
}
