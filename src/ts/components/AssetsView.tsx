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
  onRefresh,
  config
}) => {
  const releases = selectedRelease === 'latest' ? repoReleases[selectedRepo] : null
  const assets = selectedRelease === 'latest' ? releases?.[0]?.assets || [] : selectedRelease.assets

  const releaseTag = selectedRelease === 'latest' ? 'latest' : selectedRelease.tag_name
  const heading = selectedRelease === 'latest'
    ? `${selectedRepo} (${config.strings?.latest || getString('assets.latest')})`
    : `${selectedRepo} (${releaseTag})`

  return (
    <div className="github-release-browser-browser__main">
      <div className="github-release-browser-browser__header">
        <div className="github-release-browser-browser__controls">
          <Button
            variant="tertiary"
            icon="arrow-left-alt"
            onClick={onBack}
            label={config.strings?.back || getString('assets.backToRepos')}
            className="github-release-browser-browser__back-button"
          />
          <h2>{heading}</h2>
          <Button
            variant="tertiary"
            icon="update"
            onClick={onRefresh}
            label={config.strings?.refresh || getString('repositories.refresh')}
            className="github-release-browser-browser__refresh-button"
          />
        </div>
      </div>
      <AssetList
        assets={assets}
        repository={selectedRepo}
        releaseTag={releaseTag}
        isLatest={selectedRelease === 'latest'}
        selectedAsset={selectedAsset}
        onSelectAsset={onSelectAsset}
        strings={config.strings}
      />
    </div>
  )
}
