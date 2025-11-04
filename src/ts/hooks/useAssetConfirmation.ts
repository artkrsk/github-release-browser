import { useCallback } from 'react'
import { IAsset, IRelease } from '../interfaces'
import { IBrowserConfig } from '../interfaces'
import { TUseAssetConfirmationReturn } from '../types'

/**
 * Hook to handle asset confirmation and selection workflow
 * Manages asset validation and callback execution
 */
export const useAssetConfirmation = (
  selectedRepo: string | null,
  selectedRelease: IRelease | 'latest' | null,
  selectedAssetObj: IAsset | null,
  config: IBrowserConfig
) => {
  const handleConfirmAsset = useCallback(() => {
    if (!selectedAssetObj || !selectedRepo || !selectedRelease) {
      return
    }

    const releaseTag = selectedRelease === 'latest' ? 'latest' : selectedRelease.tag_name

    if (config.onSelectAsset) {
      config.onSelectAsset({
        repo: selectedRepo,
        release: releaseTag,
        asset: selectedAssetObj,
        downloadUrl: selectedAssetObj.browser_download_url
      })
    }
  }, [selectedAssetObj, selectedRepo, selectedRelease, config])

  const canConfirmAsset = Boolean(
    selectedAssetObj &&
    selectedRepo &&
    selectedRelease
  )

  return {
    handleConfirmAsset,
    canConfirmAsset
  } as TUseAssetConfirmationReturn
}