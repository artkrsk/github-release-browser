import { IAsset } from './IAsset';
/**
 * Release interface for GitHub releases
 */
export interface IRelease {
    url: string;
    html_url: string;
    assets_url: string;
    upload_url: string;
    tarball_url: string;
    zipball_url: string;
    id: number;
    tag_name: string;
    target_commitish: string;
    name: string | null;
    body: string | null;
    draft: boolean;
    prerelease: boolean;
    created_at: string;
    published_at: string;
    author: {
        login: string;
        id: number;
        avatar_url: string;
        html_url: string;
        type: string;
    };
    assets: IAsset[];
}
