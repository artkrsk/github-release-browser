import { IAsset } from './IAsset';
/**
 * Selected asset interface for asset selection workflow
 */
export interface ISelectedAsset {
    repo: string;
    release: string;
    asset: IAsset;
    downloadUrl: string;
}
