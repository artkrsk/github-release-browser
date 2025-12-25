/**
 * Rate limit interface for GitHub API
 */
export interface IRateLimit {
    resources: {
        core: {
            limit: number;
            remaining: number;
            reset: number;
            used: number;
        };
        search: {
            limit: number;
            remaining: number;
            reset: number;
            used: number;
        };
        graphql: {
            limit: number;
            remaining: number;
            reset: number;
            used: number;
        };
    };
    rate: {
        limit: number;
        remaining: number;
        reset: number;
        used: number;
    };
}
