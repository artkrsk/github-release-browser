/**
 * Asset interface for GitHub release assets
 */
export interface IAsset {
  url: string
  id: number
  name: string
  label: string | null
  content_type: string
  state: 'uploaded' | string
  size: number
  download_count: number
  created_at: string
  updated_at: string
  browser_download_url: string
}