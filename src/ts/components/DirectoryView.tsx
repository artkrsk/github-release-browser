import type React from 'react'
import { IBranch, IContentItem } from '../interfaces'
import { BranchSelector } from './BranchSelector'
import { DirectoryBrowser } from './DirectoryBrowser'
import { getString } from '../utils/getString'

const { Button } = wp.components

export interface IDirectoryViewProps {
  selectedRepo: string | null
  branches: IBranch[]
  selectedBranch: string | null
  currentPath: string
  selectedFolderPath: string | null
  directoryContents: IContentItem[]
  loadingBranches: boolean
  loadingContents: boolean
  onSelectBranch: (branch: string) => void
  onNavigate: (path: string) => void
  onSelectFolder: (path: string) => void
  onBack: () => void
  defaultBranch?: string
}

/**
 * Directory browsing view container
 */
export const DirectoryView: React.FC<IDirectoryViewProps> = ({
  selectedRepo,
  branches,
  selectedBranch,
  currentPath,
  selectedFolderPath,
  directoryContents,
  loadingBranches,
  loadingContents,
  onSelectBranch,
  onNavigate,
  onSelectFolder,
  onBack,
  defaultBranch
}) => {
  return (
    <div className="github-release-browser-directory-view">
      <div className="github-release-browser-browser__header">
        <div className="github-release-browser-browser__controls">
          <Button
            variant="tertiary"
            icon="arrow-left-alt"
            onClick={onBack}
            label={getString('assets.backToRepos')}
            className="github-release-browser-browser__back-button"
          />
          <h2>{selectedRepo}</h2>
        </div>
      </div>

      <BranchSelector
        branches={branches}
        selectedBranch={selectedBranch}
        onSelectBranch={onSelectBranch}
        loading={loadingBranches}
        defaultBranch={defaultBranch}
      />

      <DirectoryBrowser
        contents={directoryContents}
        currentPath={currentPath}
        selectedFolderPath={selectedFolderPath}
        onNavigate={onNavigate}
        onSelectFolder={onSelectFolder}
        loading={loadingContents}
        repositoryName={selectedRepo || ''}
      />
    </div>
  )
}
