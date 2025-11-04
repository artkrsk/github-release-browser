import { IAsset, IRelease } from '../interfaces'
import { IBrowserConfig } from './IBrowserConfig'

/**
 * Props for AssetsView component
 */
export interface IAssetsViewProps {
  /** Selected repository name */
  selectedRepo: string
  /** Selected release object or 'latest' */
  selectedRelease: IRelease | 'latest'
  /** Currently selected asset */
  selectedAsset: IAsset | null
  /** Repository releases data */
  repoReleases: { [key: string]: IRelease[] }
  /** Function to call when asset is selected */
  onSelectAsset: (asset: IAsset | null) => void
  /** Function to call when back is requested */
  onBack: () => void
  /** Browser app configuration */
  config: IBrowserConfig
}