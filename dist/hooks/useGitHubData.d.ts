import { GitHubService } from '../services/GitHubService';
import { IRepo, IRelease } from '../interfaces';
import { TUseGitHubDataReturn } from '../types';
/**
 * Hook to handle GitHub data fetching operations
 * Manages API calls, loading states, and error handling
 */
export declare const useGitHubData: (service: GitHubService, isMountedRef: React.MutableRefObject<boolean>, setRepos: (repos: IRepo[]) => void, repoReleases: {
    [key: string]: IRelease[];
}, setRepoReleases: React.Dispatch<React.SetStateAction<{
    [key: string]: IRelease[];
}>>, releaseErrors: {
    [key: string]: string | null;
}, setReleaseErrors: React.Dispatch<React.SetStateAction<{
    [key: string]: string | null;
}>>, setLoadingRepos: (loading: boolean) => void, setLoadingRepo: (loading: string | null) => void, setError: (error: string | null) => void) => TUseGitHubDataReturn;
