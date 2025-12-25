/**
 * Content item interface for GitHub Contents API
 */
export interface IContentItem {
    name: string;
    path: string;
    sha: string;
    size: number;
    type: 'file' | 'dir' | 'symlink' | 'submodule';
    download_url: string | null;
    html_url: string;
}
