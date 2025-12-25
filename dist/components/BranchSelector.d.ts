import type React from 'react';
import { IBranch } from '../interfaces';
export interface IBranchSelectorProps {
    branches: IBranch[];
    selectedBranch: string | null;
    onSelectBranch: (branch: string) => void;
    loading?: boolean;
    defaultBranch?: string;
}
/**
 * Branch selector dropdown
 */
export declare const BranchSelector: React.FC<IBranchSelectorProps>;
