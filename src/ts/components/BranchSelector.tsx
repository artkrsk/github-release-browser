import type React from 'react'
import { IBranch } from '../interfaces'

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
  if (loading) {
    return (
      <div className="github-release-browser-branch-selector">
        <Spinner />
      </div>
    )
  }

  const options = branches.map((branch) => ({
    label: branch.name === defaultBranch ? `${branch.name} (default)` : branch.name,
    value: branch.name
  }))

  return (
    <div className="github-release-browser-branch-selector">
      <SelectControl
        label="Branch"
        value={selectedBranch || ''}
        options={options}
        onChange={onSelectBranch}
        className="github-release-browser-branch-selector__dropdown"
      />
    </div>
  )
}
