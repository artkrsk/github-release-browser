import type React from 'react';
import { TSourceMode } from '../types';
export interface ISourceModeToggleProps {
    mode: TSourceMode;
    onModeChange: (mode: TSourceMode) => void;
    disabled?: boolean;
}
/**
 * Toggle between Releases and Directory browsing modes
 */
export declare const SourceModeToggle: React.FC<ISourceModeToggleProps>;
