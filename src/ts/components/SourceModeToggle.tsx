import type React from 'react'
import { TSourceMode } from '../types'

const { __experimentalToggleGroupControl: ToggleGroupControl, __experimentalToggleGroupControlOption: ToggleGroupControlOption } = wp.components

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
      <ToggleGroupControl
        value={mode}
        onChange={(value) => onModeChange(value as TSourceMode)}
        isBlock
        label="Content Mode"
        hideLabelFromVision
        __next40pxDefaultSize
        __nextHasNoMarginBottom
        className="github-release-browser-source-toggle__control"
      >
        <ToggleGroupControlOption value="releases" label="Releases" />
        <ToggleGroupControlOption value="directory" label="Directory" />
      </ToggleGroupControl>
    </div>
  )
}
