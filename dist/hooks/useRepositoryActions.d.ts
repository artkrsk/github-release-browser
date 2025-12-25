import { IRelease } from '../interfaces';
import { TBrowserView, TUseRepositoryActionsReturn } from '../types';
/**
 * Hook to handle repository-related actions and view transitions
 * Manages repository selection, release selection, and view state changes
 */
export declare const useRepositoryActions: (setView: (view: TBrowserView) => void, setExpandedRepo: React.Dispatch<React.SetStateAction<string | null>>, setSelectedRepo: (repo: string | null) => void, setSelectedRelease: (release: IRelease | "latest" | null) => void, setSelectedReleaseTag: (tag: string | null) => void, fetchReleasesForRepo: (repoFullName: string) => Promise<void>) => TUseRepositoryActionsReturn;
