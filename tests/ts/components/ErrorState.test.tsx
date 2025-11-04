import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorState, detectErrorType } from '@/components/ErrorState'
import { render, setupTestEnvironment } from '@test-utils'

// Mock WordPress components
vi.mock('@wordpress/components', () => ({
  Button: ({ children, onClick, variant, className, ...props }: {
    children?: React.ReactNode
    onClick?: () => void
    variant?: string
    className?: string
  }) => (
    <button
      onClick={onClick}
      data-variant={variant}
      className={`wp-button wp-button-${variant || 'default'} ${className || ''}`}
      data-testid={`button-${variant || 'default'}`}
      {...props}
    >
      {children}
    </button>
  )
}))

describe('detectErrorType', () => {
  test('returns "token_missing" for "not configured" messages', () => {
    expect(detectErrorType('GitHub Personal Access Token not configured')).toBe('token_missing')
    expect(detectErrorType('Token not configured')).toBe('token_missing')
    expect(detectErrorType('NOT CONFIGURED')).toBe('token_missing')
  })

  test('returns "token_missing" for "missing" messages', () => {
    expect(detectErrorType('GitHub token is missing')).toBe('token_missing')
    expect(detectErrorType('Missing token from settings')).toBe('token_missing')
    expect(detectErrorType('Token MISSING')).toBe('token_missing')
  })

  test('returns "token_missing" for "required" messages', () => {
    expect(detectErrorType('GitHub token is required')).toBe('token_missing')
    expect(detectErrorType('Token is REQUIRED for this operation')).toBe('token_missing')
  })

  test('returns "token_missing" for "personal access token" messages', () => {
    expect(detectErrorType('Configure your GitHub Personal Access Token')).toBe('token_missing')
    expect(detectErrorType('You need to configure your GitHub Personal Access Token')).toBe('token_missing')
    expect(detectErrorType('GitHub PERSONAL ACCESS TOKEN is needed')).toBe('token_missing')
  })

  test('returns "token_missing" for combined "configure" and "token" messages', () => {
    expect(detectErrorType('Configure your token to access this feature')).toBe('token_missing')
    expect(detectErrorType('You must configure your token')).toBe('token_missing')
    expect(detectErrorType('Please CONFIGURE your TOKEN')).toBe('token_missing')
  })

  test('returns "token_invalid" for messages containing both "invalid" and "token"', () => {
    expect(detectErrorType('Invalid GitHub token provided')).toBe('token_invalid')
    expect(detectErrorType('GitHub token has been revoked and is invalid')).toBe('token_invalid')
    expect(detectErrorType('INVALID TOKEN detected')).toBe('token_invalid')
    expect(detectErrorType('Token is invalid')).toBe('token_invalid')
  })

  test('returns "general" for messages without token keywords', () => {
    expect(detectErrorType('Network connection failed')).toBe('general')
    expect(detectErrorType('Invalid request format')).toBe('general')
    expect(detectErrorType('Token expired but not revoked')).toBe('general')
    expect(detectErrorType('Please configure your repository settings')).toBe('general')
    expect(detectErrorType('Service unavailable')).toBe('general')
  })

  test('handles error messages with leading numbers', () => {
    expect(detectErrorType('1GitHub token not configured')).toBe('token_missing')
    expect(detectErrorType('401 Unauthorized')).toBe('general')
    expect(detectErrorType('500 Internal Server Error')).toBe('general')
  })

  test('handles empty and whitespace errors', () => {
    expect(detectErrorType('')).toBe('general')
    expect(detectErrorType('   ')).toBe('general')
  })

  test('handles mixed case and spacing', () => {
    expect(detectErrorType('   GitHub  TOKEN  is  MISSING   ')).toBe('token_missing')
    expect(detectErrorType('  Invalid  TOKEN  detected  ')).toBe('token_invalid')
  })
})

describe('ErrorState', () => {
  const mockOnRetry = vi.fn()

  beforeEach(() => {
    setupTestEnvironment()
    vi.clearAllMocks()
  })

  describe('Props Handling', () => {
    test('renders with required props', () => {
      render(
        <ErrorState
          error="Test error message"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Test error message')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    test('renders with translation system', () => {
      // Test with custom translation override
      setupTestEnvironment({
        strings: {
          'common.tryAgain': 'Custom Retry Text'
        }
      })

      render(
        <ErrorState
          error="Test error message"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Custom Retry Text')).toBeInTheDocument()
    })

    test('renders with custom className', () => {
      render(
        <ErrorState
          error="Test error"
          onRetry={mockOnRetry}
          className="custom-error-class"
        />
      )

      const errorContainer = document.querySelector('.github-release-browser-browser__error')
      expect(errorContainer).toHaveClass('custom-error-class')
    })

    test('renders children when provided', () => {
      render(
        <ErrorState
          error="Test error"
          onRetry={mockOnRetry}
        >
          <div data-testid="custom-children">Custom error content</div>
        </ErrorState>
      )

      expect(screen.getByTestId('custom-children')).toBeInTheDocument()
      expect(screen.queryByText('Test error')).not.toBeInTheDocument()
    })

    test('renders without optional className', () => {
      render(
        <ErrorState
          error="Test error"
          onRetry={mockOnRetry}
        />
      )

      const errorContainer = document.querySelector('.github-release-browser-browser__error')
      expect(errorContainer).toHaveClass('github-release-browser-browser__error')
    })
  })

  describe('Simple Error Detection', () => {
    test('renders token missing error for "not configured" message', () => {
      render(
        <ErrorState
          error="GitHub Personal Access Token not configured"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Welcome to Release Browser')).toBeInTheDocument()
      expect(screen.getByText('To browse and insert files from your GitHub releases, you need to configure your GitHub Personal Access Token.')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
      expect(screen.getByTestId('button-primary')).toBeInTheDocument()
    })

    test('renders token missing error for "missing" message', () => {
      render(
        <ErrorState
          error="GitHub token is missing from settings"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Welcome to Release Browser')).toBeInTheDocument()
      expect(screen.getByTestId('button-primary')).toBeInTheDocument()
    })

    test('renders Go to Settings button when settingsUrl is provided', () => {
      setupTestEnvironment({
        settingsUrl: 'https://example.com/settings'
      })

      render(
        <ErrorState
          error="GitHub token not configured"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Go to Settings')).toBeInTheDocument()
      expect(screen.getByTestId('button-primary')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    test('opens settings URL when Go to Settings button is clicked', async () => {
      const mockOpen = vi.fn()
      global.open = mockOpen

      setupTestEnvironment({
        settingsUrl: 'https://example.com/settings'
      })

      const user = userEvent.setup()
      render(
        <ErrorState
          error="GitHub token not configured"
          onRetry={mockOnRetry}
        />
      )

      const settingsButton = screen.getByText('Go to Settings')
      await user.click(settingsButton)

      expect(mockOpen).toHaveBeenCalledWith('https://example.com/settings', '_blank')
    })

    test('opens settings URL when Go to Settings button is clicked for invalid token', async () => {
      const mockOpen = vi.fn()
      global.open = mockOpen

      setupTestEnvironment({
        settingsUrl: 'https://example.com/settings'
      })

      const user = userEvent.setup()
      render(
        <ErrorState
          error="Invalid GitHub token"
          onRetry={mockOnRetry}
        />
      )

      const settingsButton = screen.getByText('Go to Settings')
      await user.click(settingsButton)

      expect(mockOpen).toHaveBeenCalledWith('https://example.com/settings', '_blank')
    })

    test('does not render Go to Settings button when settingsUrl is not provided', () => {
      setupTestEnvironment({
        settingsUrl: undefined
      })

      render(
        <ErrorState
          error="GitHub token not configured"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.queryByText('Go to Settings')).not.toBeInTheDocument()
      expect(screen.getByTestId('button-secondary')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    test('renders token invalid error for both "invalid" and "token" in message', () => {
      render(
        <ErrorState
          error="GitHub token has been revoked and is invalid"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Invalid GitHub Token')).toBeInTheDocument()
      expect(screen.getByTestId('button-secondary')).toBeInTheDocument()
    })

    test('renders token missing error for messages with personal access token', () => {
      render(
        <ErrorState
          error="To browse and insert files from your GitHub releases, you need to configure your GitHub Personal Access Token"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Welcome to Release Browser')).toBeInTheDocument()
      expect(screen.getByTestId('button-primary')).toBeInTheDocument()
    })

    test('renders token missing error for combined configure and token message', () => {
      render(
        <ErrorState
          error="You must configure your token to access this feature"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Welcome to Release Browser')).toBeInTheDocument()
      expect(screen.getByTestId('button-primary')).toBeInTheDocument()
    })

    test('handles error messages with leading numbers', () => {
      render(
        <ErrorState
          error="1To browse and insert files from your GitHub releases, you need to configure your GitHub Personal Access Token"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Welcome to Release Browser')).toBeInTheDocument()
      expect(screen.getByTestId('button-primary')).toBeInTheDocument()
    })

    test('renders generic error for messages without token keywords', () => {
      render(
        <ErrorState
          error="Network connection failed"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Network connection failed')).toBeInTheDocument()
      expect(screen.getByTestId('button-secondary')).toBeInTheDocument()
    })
  })

  describe('Legacy Error Detection (Backward Compatibility)', () => {
    test('renders token missing error for "not configured" message', () => {
      render(
        <ErrorState
          error="GitHub Personal Access Token not configured"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Welcome to Release Browser')).toBeInTheDocument()
      expect(screen.getByText('To browse and insert files from your GitHub releases, you need to configure your GitHub Personal Access Token.')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
      expect(screen.getByTestId('button-primary')).toBeInTheDocument()
    })

    test('renders token missing error with custom translations', () => {
      setupTestEnvironment({
        strings: {
          'error.welcome.title': 'Custom Welcome Title',
          'error.welcome.description': 'Custom welcome description text.',
          'common.tryAgain': 'Custom Retry Button'
        }
      })

      render(
        <ErrorState
          error="GitHub Personal Access Token not configured"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Custom Welcome Title')).toBeInTheDocument()
      expect(screen.getByText('Custom welcome description text.')).toBeInTheDocument()
      expect(screen.getByText('Custom Retry Button')).toBeInTheDocument()
      expect(screen.getByTestId('button-primary')).toBeInTheDocument()
    })

    test('renders token missing error for case-insensitive "NOT CONFIGURED"', () => {
      render(
        <ErrorState
          error="GitHub token NOT CONFIGURED in settings"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Welcome to Release Browser')).toBeInTheDocument()
      expect(screen.getByTestId('button-primary')).toBeInTheDocument()
    })

    test('renders token invalid error for "invalid" and "token" message', () => {
      render(
        <ErrorState
          error="Invalid GitHub token provided"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Invalid GitHub Token')).toBeInTheDocument()
      expect(screen.getByText('Your GitHub Personal Access Token is invalid or has been revoked. Please update your token in the settings.')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
      expect(screen.getByTestId('button-secondary')).toBeInTheDocument()
    })

    test('renders token invalid error with custom translations', () => {
      setupTestEnvironment({
        strings: {
          'error.title.invalidToken': 'Custom Invalid Token Title',
          'error.desc.invalidToken': 'Custom invalid token description.',
          'common.tryAgain': 'Custom Retry Button'
        }
      })

      render(
        <ErrorState
          error="Invalid GitHub token provided"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Custom Invalid Token Title')).toBeInTheDocument()
      expect(screen.getByText('Custom invalid token description.')).toBeInTheDocument()
      expect(screen.getByText('Custom Retry Button')).toBeInTheDocument()
      expect(screen.getByTestId('button-secondary')).toBeInTheDocument()
    })

    test('renders token invalid error for case-insensitive "INVALID" and "TOKEN"', () => {
      render(
        <ErrorState
          error="GitHub TOKEN is INVALID"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Invalid GitHub Token')).toBeInTheDocument()
      expect(screen.getByTestId('button-secondary')).toBeInTheDocument()
    })

    test('renders generic error for other error messages', () => {
      render(
        <ErrorState
          error="Network connection failed"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Network connection failed')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
      expect(screen.getByTestId('button-secondary')).toBeInTheDocument()

      // Check for error icon
      const errorIcon = document.querySelector('.github-release-browser-icon_error')
      expect(errorIcon).toBeInTheDocument()
    })

    test('renders generic error when only "invalid" is present but no "token"', () => {
      render(
        <ErrorState
          error="Invalid request format"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Invalid request format')).toBeInTheDocument()
      expect(screen.getByTestId('button-secondary')).toBeInTheDocument()
    })

    test('renders generic error when "token" is present but no "invalid"', () => {
      render(
        <ErrorState
          error="Token expired but not revoked"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Token expired but not revoked')).toBeInTheDocument()
      expect(screen.getByTestId('button-secondary')).toBeInTheDocument()
    })
  })

  describe('Button Interactions', () => {
    test('calls onRetry when retry button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <ErrorState
          error="GitHub token not configured"
          onRetry={mockOnRetry}
        />
      )

      const retryButton = screen.getByText('Try Again')
      await user.click(retryButton)

      expect(mockOnRetry).toHaveBeenCalledTimes(1)
    })

    test('calls onRetry when secondary button is clicked for invalid token', async () => {
      const user = userEvent.setup()
      render(
        <ErrorState
          error="Invalid GitHub token"
          onRetry={mockOnRetry}
        />
      )

      const retryButton = screen.getByTestId('button-secondary')
      await user.click(retryButton)

      expect(mockOnRetry).toHaveBeenCalledTimes(1)
    })

    test('calls onRetry when secondary button is clicked for generic error', async () => {
      const user = userEvent.setup()
      render(
        <ErrorState
          error="Connection timeout"
          onRetry={mockOnRetry}
        />
      )

      const retryButton = screen.getByTestId('button-secondary')
      await user.click(retryButton)

      expect(mockOnRetry).toHaveBeenCalledTimes(1)
    })

    test('handles multiple retry clicks', async () => {
      const user = userEvent.setup()
      render(
        <ErrorState
          error="Service unavailable"
          onRetry={mockOnRetry}
        />
      )

      const retryButton = screen.getByTestId('button-secondary')

      await user.click(retryButton)
      await user.click(retryButton)
      await user.click(retryButton)

      expect(mockOnRetry).toHaveBeenCalledTimes(3)
    })
  })

  describe('CSS Classes and Structure', () => {
    test('applies correct base CSS classes', () => {
      render(
        <ErrorState
          error="Test error"
          onRetry={mockOnRetry}
        />
      )

      const errorContainer = document.querySelector('.github-release-browser-browser__error')
      expect(errorContainer).toHaveClass('github-release-browser-browser__error')
    })

    test('applies custom CSS class in addition to base classes', () => {
      render(
        <ErrorState
          error="Test error"
          onRetry={mockOnRetry}
          className="additional-class"
        />
      )

      const errorContainer = document.querySelector('.github-release-browser-browser__error')
      expect(errorContainer).toHaveClass('github-release-browser-browser__error')
      expect(errorContainer).toHaveClass('additional-class')
    })

    test('renders error message in correct container', () => {
      render(
        <ErrorState
          error="Generic error message"
          onRetry={mockOnRetry}
        />
      )

      const errorContainer = screen.getByText('Generic error message')
      expect(errorContainer).toHaveClass('github-release-browser-browser__error-message')
    })

    test('renders setup title with correct CSS class', () => {
      render(
        <ErrorState
          error="Token not configured"
          onRetry={mockOnRetry}
        />
      )

      const title = screen.getByText('Welcome to Release Browser')
      expect(title).toHaveClass('github-release-browser-browser__setup-title')
    })

    test('renders setup message with correct CSS class', () => {
      render(
        <ErrorState
          error="Token not configured"
          onRetry={mockOnRetry}
        />
      )

      const message = screen.getByText('To browse and insert files from your GitHub releases, you need to configure your GitHub Personal Access Token.')
      expect(message).toHaveClass('github-release-browser-browser__setup-message')
    })

    test('renders setup actions container with correct CSS class', () => {
      render(
        <ErrorState
          error="Token not configured"
          onRetry={mockOnRetry}
        />
      )

      const actionsContainer = screen.getByText('Try Again').closest('div')
      expect(actionsContainer).toHaveClass('github-release-browser-browser__setup-actions')
    })
  })

  describe('Edge Cases', () => {
    test('handles very long error message', () => {
      const longError = 'A'.repeat(100)
      render(
        <ErrorState
          error={longError}
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText(longError)).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    test('handles error with HTML-like characters', () => {
      render(
        <ErrorState
          error="Error with &lt;script&gt; content"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Error with <script> content')).toBeInTheDocument()
    })

    test('handles error with special characters', () => {
      render(
        <ErrorState
          error="Error with special chars: !@#$%^&*()"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Error with special chars: !@#$%^&*()')).toBeInTheDocument()
    })
  })

  describe('Component Re-rendering', () => {
    test('updates error message when prop changes', () => {
      const { rerender } = render(
        <ErrorState
          error="Initial error"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Initial error')).toBeInTheDocument()

      rerender(
        <ErrorState
          error="Updated error message"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Updated error message')).toBeInTheDocument()
      expect(screen.queryByText('Initial error')).not.toBeInTheDocument()
    })

    test('changes error type when prop changes from generic to token missing', () => {
      const { rerender } = render(
        <ErrorState
          error="Generic network error"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Generic network error')).toBeInTheDocument()
      expect(screen.getByTestId('button-secondary')).toBeInTheDocument()

      rerender(
        <ErrorState
          error="GitHub token not configured"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Welcome to Release Browser')).toBeInTheDocument()
      expect(screen.getByTestId('button-primary')).toBeInTheDocument()
    })

    test('changes error type when prop changes from token missing to invalid', () => {
      const { rerender } = render(
        <ErrorState
          error="GitHub token not configured"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Welcome to Release Browser')).toBeInTheDocument()
      expect(screen.getByTestId('button-primary')).toBeInTheDocument()

      rerender(
        <ErrorState
          error="Invalid GitHub token"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Invalid GitHub Token')).toBeInTheDocument()
      expect(screen.getByTestId('button-secondary')).toBeInTheDocument()
    })
  })

  describe('Children Rendering Priority', () => {
    test('children take precedence over default error rendering', () => {
      render(
        <ErrorState
          error="This should not appear"
          onRetry={mockOnRetry}
        >
          <div data-testid="custom-content">
            <h1>Custom Error Title</h1>
            <p>Custom error description</p>
            <button data-testid="custom-retry">Custom Retry</button>
          </div>
        </ErrorState>
      )

      expect(screen.getByTestId('custom-content')).toBeInTheDocument()
      expect(screen.getByText('Custom Error Title')).toBeInTheDocument()
      expect(screen.getByText('Custom error description')).toBeInTheDocument()
      expect(screen.getByTestId('custom-retry')).toBeInTheDocument()
      expect(screen.queryByText('This should not appear')).not.toBeInTheDocument()
    })

    test('empty children still prevent default rendering', () => {
      render(
        <ErrorState
          error="This should not appear"
          onRetry={mockOnRetry}
        >
          <></>
        </ErrorState>
      )

      expect(screen.queryByText('This should not appear')).not.toBeInTheDocument()
    })

    test('text children render correctly', () => {
      render(
        <ErrorState
          error="This should not appear"
          onRetry={mockOnRetry}
        >
          Simple text content
        </ErrorState>
      )

      expect(screen.getByText('Simple text content')).toBeInTheDocument()
      expect(screen.queryByText('This should not appear')).not.toBeInTheDocument()
    })
  })

  describe('Error Detection Function Coverage', () => {
    test('covers "required" keyword for token missing detection', () => {
      render(
        <ErrorState
          error="GitHub token is required for this operation"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Welcome to Release Browser')).toBeInTheDocument()
      expect(screen.getByTestId('button-primary')).toBeInTheDocument()
    })

    test('covers whitespace handling in error detection', () => {
      render(
        <ErrorState
          error="   GitHub token not configured   "
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Welcome to Release Browser')).toBeInTheDocument()
      expect(screen.getByTestId('button-primary')).toBeInTheDocument()
    })

    test('covers combined token keywords detection', () => {
      render(
        <ErrorState
          error="Your personal access token appears to be invalid"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Welcome to Release Browser')).toBeInTheDocument()
      expect(screen.getByTestId('button-primary')).toBeInTheDocument()
    })

    test('covers generic error fallback for unknown patterns', () => {
      render(
        <ErrorState
          error="Something completely unexpected happened"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Something completely unexpected happened')).toBeInTheDocument()
      expect(screen.getByTestId('button-secondary')).toBeInTheDocument()
    })

    test('covers error with mixed case token keywords', () => {
      render(
        <ErrorState
          error="GitHub TOKEN is Missing"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Welcome to Release Browser')).toBeInTheDocument()
      expect(screen.getByTestId('button-primary')).toBeInTheDocument()
    })

    test('covers error with only configure keyword but no token', () => {
      render(
        <ErrorState
          error="Please configure your repository settings"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Please configure your repository settings')).toBeInTheDocument()
      expect(screen.getByTestId('button-secondary')).toBeInTheDocument()
    })
  })
})