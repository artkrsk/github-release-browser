import { IAsset } from './IAsset'

/**
 * Payload handed to `onSelectAsset`. For a directory selection `release` is the branch,
 * `asset` is synthetic and its `name` holds the full `github-dir://` URI, and `downloadUrl` is the archive URL.
 */
export interface ISelectedAsset {
  repo: string
  release: string
  asset: IAsset
  downloadUrl: string
}