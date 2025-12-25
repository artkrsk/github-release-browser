import type React from 'react';
import { IBranch, IContentItem } from '../interfaces';
export interface IDirectoryViewProps {
    selectedRepo: string | null;
    branches: IBranch[];
    selectedBranch: string | null;
    currentPath: string;
    selectedFolderPath: string | null;
    directoryContents: IContentItem[];
    loadingBranches: boolean;
    loadingContents: boolean;
    onSelectBranch: (branch: string) => void;
    onNavigate: (path: string) => void;
    onSelectFolder: (path: string) => void;
    onBack: () => void;
    defaultBranch?: string;
}
/**
 * Directory browsing view container
 */
export declare const DirectoryView: React.FC<IDirectoryViewProps>;
