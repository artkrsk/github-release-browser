import type React from 'react';
import { IContentItem } from '../interfaces';
export interface IDirectoryBrowserProps {
    contents: IContentItem[];
    currentPath: string;
    selectedFolderPath: string | null;
    onNavigate: (path: string) => void;
    onSelectFolder: (path: string) => void;
    loading?: boolean;
    repositoryName?: string;
}
/**
 * Directory browser with breadcrumb navigation and folder selection
 */
export declare const DirectoryBrowser: React.FC<IDirectoryBrowserProps>;
