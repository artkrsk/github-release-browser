import type React from 'react'
import { IAssetsViewProps } from '../interfaces/IAssetsViewProps'
import { AssetList } from './AssetList'
import { getString } from '../utils/getString'

const { Button } = wp.components

/**
 * Assets management view component
 */
export const AssetsView: React.FC<IAssetsViewProps> = ({
  selectedRepo,
  selectedRelease,
  selectedAsset,
  repoReleases,
  onSelectAsset,
  onBack,
  config
}) => {
  const releases = selectedRelease === 'latest' ? repoReleases[selectedRepo] : null
  const assets = selectedRelease === 'latest' ? releases?.[0]?.assets || [] : selectedRelease.assets

  return (
    <div className="github-release-browser-browser__main">
      <Button
        variant="tertiary"
        onClick={onBack}
        className="github-release-browser-browser__back-button"
      >
        <span className="github-release-browser-icon_back"></span>
        {config.strings?.back || getString('assets.backToRepos')}
      </Button>
      <AssetList
        assets={assets}
        repository={selectedRepo}
        releaseTag={selectedRelease === 'latest' ? 'latest' : selectedRelease.tag_name}
        isLatest={selectedRelease === 'latest'}
        selectedAsset={selectedAsset}
        onSelectAsset={onSelectAsset}
        strings={config.strings}
      />
    </div>
  )
}
