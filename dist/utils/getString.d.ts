import { IStringKeys } from '../interfaces';
/**
 * Get translated string by key from backend configuration
 * Falls back to user-friendly defaults if translation is not found
 */
export declare const getString: (key: keyof IStringKeys) => string;
