import type React from 'react'
import { IAppFooterProps } from '../interfaces/IAppFooterProps'
import { getString } from '../utils/getString'

const { Button } = wp.components

/**
 * Footer component with primary action and upgrade link
 */
export const AppFooter: React.FC<IAppFooterProps> = ({
  primaryButton,
  config,
  disabled = false
}) => {
  const features = config.features || {}
  const hasAllProFeatures = features.useLatestRelease

  return (
    <div className="github-release-browser-browser__footer">
      {primaryButton}
      {!hasAllProFeatures && config.upgradeUrl && (
        <Button
          variant="link"
          onClick={() => window.open(config.upgradeUrl, '_blank')}
          className="github-release-browser-browser__upgrade-link"
        >
          {config.strings?.upgradeToPro || getString('common.upgradeToPro')}
        </Button>
      )}
    </div>
  )
}
