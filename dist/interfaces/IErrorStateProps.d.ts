import { ReactNode } from 'react';
/**
 * Props for ErrorState component
 */
export interface IErrorStateProps {
    /** Error message to display */
    error: string;
    /** Function to call when retry is requested */
    onRetry: () => void;
    /** Additional CSS class names */
    className?: string;
    /** Optional additional content to render */
    children?: ReactNode;
}
