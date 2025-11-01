import { ISelectedAsset } from './IGitHub'

export interface IBrowserConfig {
  apiUrl: string
  nonce: string
  actionPrefix: string
  protocol?: string
  onSelectAsset: (asset: ISelectedAsset) => void
  features?: { useLatestRelease?: boolean; [key: string]: boolean }
  upgradeUrl?: string
  strings?: Record<string, string>
  textDomain?: string
  assetsUrl?: string
  cachePrefix?: string
  tokenKey?: string
}
