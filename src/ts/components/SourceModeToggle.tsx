import type React from 'react'
import { TSourceMode } from '../types'

const { Button, ButtonGroup } = wp.components

export interface ISourceModeToggleProps {
  mode: TSourceMode
  onModeChange: (mode: TSourceMode) => void
  disabled?: boolean
}

/**
 * Toggle between Releases and Directory browsing modes
 */
export const SourceModeToggle: React.FC<ISourceModeToggleProps> = ({
  mode,
  onModeChange,
  disabled = false
}) => {
  return (
    <div className="github-release-browser-source-toggle">
      <ButtonGroup>
        <Button
          variant={mode === 'releases' ? 'primary' : 'secondary'}
          onClick={() => onModeChange('releases')}
          disabled={disabled}
          className="github-release-browser-source-toggle__tab"
        >
          Releases
        </Button>
        <Button
          variant={mode === 'directory' ? 'primary' : 'secondary'}
          onClick={() => onModeChange('directory')}
          disabled={disabled}
          className="github-release-browser-source-toggle__tab"
        >
          Directory
        </Button>
      </ButtonGroup>
    </div>
  )
}
