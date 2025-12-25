/**
 * Props for RepositorySearch component
 */
export interface IRepositorySearchProps {
    /** Current search query value */
    searchQuery: string;
    /** Function to call when search query changes */
    onSearchChange: (query: string) => void;
    /** Function to call when refresh is requested */
    onRefresh: () => void;
    /** Whether refresh action should be disabled */
    refreshDisabled?: boolean;
    /** Custom strings for UI text */
    strings?: {
        [key: string]: string;
    };
}
