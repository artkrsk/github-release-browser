import { IAsset } from './IAsset'

/**
 * Props for AssetList component
 */
export interface IAssetListProps {
  assets: IAsset[]
  repository: string
  releaseTag: string
  isLatest: boolean
  selectedAsset: IAsset | null
  onSelectAsset: (asset: IAsset | null) => void
  strings?: Record<string, string>
}
