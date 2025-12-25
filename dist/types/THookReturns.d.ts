import { IRepo, IRelease, IAsset, IBranch, IContentItem } from '../interfaces';
import { TBrowserView } from './TBrowserView';
import { TSourceMode } from './TSourceMode';
/**
 * Return types for custom hooks
 */
/** Return type for useBrowserState hook */
export type TUseBrowserStateReturn = {
    view: TBrowserView;
    setView: React.Dispatch<React.SetStateAction<TBrowserView>>;
    repos: IRepo[];
    setRepos: React.Dispatch<React.SetStateAction<IRepo[]>>;
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    expandedRepo: string | null;
    setExpandedRepo: React.Dispatch<React.SetStateAction<string | null>>;
    repoReleases: {
        [key: string]: IRelease[];
    };
    setRepoReleases: React.Dispatch<React.SetStateAction<{
        [key: string]: IRelease[];
    }>>;
    releaseErrors: {
        [key: string]: string | null;
    };
    setReleaseErrors: React.Dispatch<React.SetStateAction<{
        [key: string]: string | null;
    }>>;
    loadingRepos: boolean;
    setLoadingRepos: React.Dispatch<React.SetStateAction<boolean>>;
    loadingRepo: string | null;
    setLoadingRepo: React.Dispatch<React.SetStateAction<string | null>>;
    selectedRepo: string | null;
    setSelectedRepo: React.Dispatch<React.SetStateAction<string | null>>;
    selectedReleaseTag: string | null;
    setSelectedReleaseTag: React.Dispatch<React.SetStateAction<string | null>>;
    selectedRelease: IRelease | 'latest' | null;
    setSelectedRelease: React.Dispatch<React.SetStateAction<IRelease | 'latest' | null>>;
    selectedAssetObj: IAsset | null;
    setSelectedAssetObj: React.Dispatch<React.SetStateAction<IAsset | null>>;
    error: string | null;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    sourceMode: TSourceMode;
    setSourceMode: React.Dispatch<React.SetStateAction<TSourceMode>>;
    branches: IBranch[];
    setBranches: React.Dispatch<React.SetStateAction<IBranch[]>>;
    selectedBranch: string | null;
    setSelectedBranch: React.Dispatch<React.SetStateAction<string | null>>;
    currentPath: string;
    setCurrentPath: React.Dispatch<React.SetStateAction<string>>;
    selectedFolderPath: string | null;
    setSelectedFolderPath: React.Dispatch<React.SetStateAction<string | null>>;
    directoryContents: IContentItem[];
    setDirectoryContents: React.Dispatch<React.SetStateAction<IContentItem[]>>;
    loadingBranches: boolean;
    setLoadingBranches: React.Dispatch<React.SetStateAction<boolean>>;
    loadingContents: boolean;
    setLoadingContents: React.Dispatch<React.SetStateAction<boolean>>;
    isMountedRef: React.MutableRefObject<boolean>;
};
/** Return type for useGitHubData hook */
export type TUseGitHubDataReturn = {
    fetchRepos: () => Promise<void>;
    fetchReleasesForRepo: (repoFullName: string) => Promise<void>;
    refreshRepos: () => Promise<void>;
};
/** Return type for useRepositoryActions hook */
export type TUseRepositoryActionsReturn = {
    handleRepoToggle: (repoFullName: string) => void;
    handleSelectRelease: (repo: string, release: IRelease | 'latest') => void;
    handleBackToRepos: () => void;
};
/** Return type for useAssetConfirmation hook */
export type TUseAssetConfirmationReturn = {
    handleConfirmAsset: () => void;
    canConfirmAsset: boolean;
};
/** Return type for useDirectoryData hook */
export type TUseDirectoryDataReturn = {
    fetchBranches: (repo: string) => Promise<void>;
    fetchContents: (repo: string, path: string, ref: string) => Promise<void>;
    fetchRepoInfo: (repo: string) => Promise<void>;
};
