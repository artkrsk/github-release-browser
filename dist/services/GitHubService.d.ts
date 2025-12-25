import { IRelease, IRateLimit, IRepo, IBranch, IContentItem, IRepoInfo } from '../interfaces';
export declare class GitHubService {
    private apiUrl;
    private nonce;
    private actionPrefix;
    constructor(config: {
        apiUrl: string;
        nonce: string;
        actionPrefix: string;
    });
    private getAction;
    private makeRequest;
    getReleases(repo: string, page?: number): Promise<IRelease[]>;
    getRateLimit(): Promise<IRateLimit>;
    parseUri(uri: string): Promise<Record<string, unknown>>;
    getDownloadUrl(assetUrl: string): Promise<string>;
    getUserRepos(): Promise<IRepo[]>;
    clearCache(): Promise<void>;
    clearReleasesCache(repo: string): Promise<void>;
    clearBranchesCache(repo: string): Promise<void>;
    getBranches(repo: string): Promise<IBranch[]>;
    getContents(repo: string, path: string, ref: string): Promise<IContentItem[]>;
    getArchiveUrl(repo: string, ref: string): Promise<string>;
    getRepoInfo(repo: string): Promise<IRepoInfo>;
}
