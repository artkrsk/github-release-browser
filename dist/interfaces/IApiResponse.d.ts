import type { IRepo } from './IRepo';
import type { IRelease } from './IRelease';
import type { IRateLimit } from './IRateLimit';
/**
 * API Response interface for GitHub Service
 */
export interface IApiResponse {
    success: boolean;
    data: {
        repos?: IRepo[];
        releases?: IRelease[];
        rate_limit?: IRateLimit;
        download_url?: string;
        message?: string;
        /** Error code of a failed request (`token_missing`, `not_found`, ...) */
        code?: string;
        /** HTTP status GitHub answered a failed request with, 0 when none */
        status?: number;
        [key: string]: unknown;
    };
}
