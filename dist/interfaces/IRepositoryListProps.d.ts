import { IRepo, IRelease } from '../interfaces';
import { IBrowserConfig } from './IBrowserConfig';
/**
 * Props for RepositoryList component
 */
export interface IRepositoryListProps {
    /** List of repositories to display */
    repos: IRepo[];
    /** Filtered search query */
    searchQuery: string;
    /** Currently expanded repository */
    expandedRepo: string | null;
    /** Currently selected repository */
    selectedRepo: string | null;
    /** Releases data by repository */
    repoReleases: {
        [key: string]: IRelease[];
    };
    /** Release errors by repository */
    releaseErrors: {
        [key: string]: string | null;
    };
    /** Currently loading repository */
    loadingRepo: string | null;
    /** Selected release tag */
    selectedReleaseTag: string | null;
    /** Function to call when repository is toggled */
    onRepoToggle: (repoFullName: string) => void;
    /** Function to call when release is selected */
    onSelectRelease: (repo: string, release: IRelease | 'latest') => void;
    /** Function to call to fetch releases for a repo */
    fetchReleasesForRepo: (repoFullName: string) => void;
    /** Browser app configuration */
    config: IBrowserConfig;
}
