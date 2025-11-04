import { ReactNode } from 'react'
import { IBrowserConfig } from './IBrowserConfig'

/**
 * Props for AppFooter component
 */
export interface IAppFooterProps {
  /** Primary button content */
  primaryButton: ReactNode
  /** Browser app configuration */
  config: IBrowserConfig
  /** Whether the action should be disabled */
  disabled?: boolean
}