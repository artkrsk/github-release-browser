import { GitHubService } from '../services/GitHubService';
import { IBranch, IContentItem } from '../interfaces';
import { TUseDirectoryDataReturn } from '../types';
/**
 * Hook to handle directory data fetching operations
 * Manages API calls for branches, contents, and repo info
 */
export declare const useDirectoryData: (service: GitHubService, isMountedRef: React.MutableRefObject<boolean>, setBranches: React.Dispatch<React.SetStateAction<IBranch[]>>, setSelectedBranch: React.Dispatch<React.SetStateAction<string | null>>, setDirectoryContents: React.Dispatch<React.SetStateAction<IContentItem[]>>, setLoadingBranches: React.Dispatch<React.SetStateAction<boolean>>, setLoadingContents: React.Dispatch<React.SetStateAction<boolean>>, setError: React.Dispatch<React.SetStateAction<string | null>>) => TUseDirectoryDataReturn;
