import type React from 'react'
import { IBranch } from '../interfaces'
import { getString } from '../utils/getString'

const { SelectControl, Spinner } = wp.components

export interface IBranchSelectorProps {
  branches: IBranch[]
  selectedBranch: string | null
  onSelectBranch: (branch: string) => void
  loading?: boolean
  defaultBranch?: string
}

/**
 * Branch selector dropdown
 */
export const BranchSelector: React.FC<IBranchSelectorProps> = ({
  branches,
  selectedBranch,
  onSelectBranch,
  loading = false,
  defaultBranch
}) => {
  const options = branches.length > 0
    ? branches.map((branch) => ({
        label: branch.name === defaultBranch ? `${branch.name} (${getString('directory.branchDefault')})` : branch.name,
        value: branch.name
      }))
    : [{ label: getString('common.loading'), value: '' }]

  return (
    <div className="github-release-browser-branch-selector">
      <SelectControl
        label={getString('directory.branch')}
        value={selectedBranch || ''}
        options={options}
        onChange={onSelectBranch}
        disabled={loading || branches.length === 0}
        __next40pxDefaultSize
        __nextHasNoMarginBottom
        className="github-release-browser-branch-selector__dropdown"
      />
    </div>
  )
}
