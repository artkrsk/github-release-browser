import { IAssetListProps, IAsset } from '../interfaces'
import { formatFileSize } from '../utils/format'
import { getString } from '../utils/getString'

const { Card, CardBody } = wp.components

export const AssetList = ({
  assets,
  repository,
  releaseTag,
  isLatest,
  selectedAsset,
  onSelectAsset,
  strings = {}
}: IAssetListProps) => {
  const handleCardClick = (asset: IAsset) => {
    if (selectedAsset?.id === asset.id) {
      onSelectAsset(null)
    } else {
      onSelectAsset(asset)
    }
  }

  return (
    <div className="github-release-browser-asset-list">
      <h3 className="github-release-browser-asset-list__heading">
        {isLatest
          ? `${strings.assetsIn || getString('assets.assetsIn')} ${repository} (${strings.latest || getString('assets.latest')})`
          : `${strings.assetsIn || getString('assets.assetsIn')} ${repository} (${releaseTag})`}
      </h3>

      {assets.length === 0 && (
        <p className="github-release-browser-asset-list__empty">{strings.noAssetsInRelease || getString('assets.noAssets')}</p>
      )}

      {assets.map((asset) => {
        const isSelected = selectedAsset?.id === asset.id

        return (
          <Card
            key={asset.id}
            className={`github-release-browser-asset-card ${isSelected ? 'github-release-browser-card_selected' : ''}`}
            onClick={() => handleCardClick(asset)}
          >
            <CardBody className="github-release-browser-card__body">
              <div className="github-release-browser-card__content">
                <div className="github-release-browser-card__info">
                  <div className="github-release-browser-card__title">{asset.name}</div>
                  <div className="github-release-browser-card__meta">
                    {formatFileSize(asset.size)} • {asset.content_type}
                  </div>
                </div>
                {isSelected && (
                  <span className="github-release-browser-card__check">
                    <span className="dashicons dashicons-yes"></span>
                  </span>
                )}
              </div>
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
}
