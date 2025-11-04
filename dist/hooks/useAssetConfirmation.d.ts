import { IAsset, IRelease } from '../interfaces';
import { IBrowserConfig } from '../interfaces';
import { TUseAssetConfirmationReturn } from '../types';
/**
 * Hook to handle asset confirmation and selection workflow
 * Manages asset validation and callback execution
 */
export declare const useAssetConfirmation: (selectedRepo: string | null, selectedRelease: IRelease | "latest" | null, selectedAssetObj: IAsset | null, config: IBrowserConfig) => TUseAssetConfirmationReturn;
