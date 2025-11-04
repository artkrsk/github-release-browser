import { ISelectedAsset } from './ISelectedAsset'

export interface IBrowserConfig {
  apiUrl: string
  nonce: string
  actionPrefix: string
  protocol?: string
  onSelectAsset: (asset: ISelectedAsset) => void
  features?: { useLatestRelease?: boolean; [key: string]: any }
  upgradeUrl?: string
  strings?: { [key: string]: string }
  textDomain?: string
  assetsUrl?: string
  cachePrefix?: string
  tokenKey?: string
}
