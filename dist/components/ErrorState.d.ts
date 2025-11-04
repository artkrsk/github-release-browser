import type React from 'react';
import { IErrorStateProps } from '../interfaces/IErrorStateProps';
/**
 * Detect error type using explicit string matching
 */
export declare function detectErrorType(error: string): 'token_missing' | 'token_invalid' | 'general';
/**
 * Error state component with retry functionality
 */
export declare const ErrorState: React.FC<IErrorStateProps>;
