/**
 * Branch interface for GitHub API
 */
export interface IBranch {
    name: string;
    commit: {
        sha: string;
        url: string;
    };
    protected: boolean;
}
