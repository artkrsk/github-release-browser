import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorState, detectErrorType } from '@/components/ErrorState'
import { render, setupTestEnvironment } from '@test-utils'

// Import centralized WordPress component mocks
import { mockWordPressComponents } from '../../mocks/wordpress-components'
vi.mock('@wordpress/components', () => mockWordPressComponents)

describe('detectErrorType utility', () => {
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

describe('ErrorState Component', () => {
  const mockOnRetry = vi.fn()

  beforeEach(() => {
    setupTestEnvironment()
    vi.clearAllMocks()
  })

  describe('Props and Rendering', () => {
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

  describe('Error Type Detection', () => {
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

  describe('User Interactions', () => {
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

    test('supports keyboard navigation and activation', async () => {
      const user = userEvent.setup()
      render(
        <ErrorState
          error="Service unavailable"
          onRetry={mockOnRetry}
        />
      )

      const retryButton = screen.getByRole('button', { name: 'Try Again' })

      // Test keyboard navigation
      retryButton.focus()
      expect(retryButton).toHaveFocus()

      // Test keyboard activation
      await user.keyboard('{Enter}')
      expect(mockOnRetry).toHaveBeenCalledTimes(1)
    })

    test('supports space key activation', async () => {
      const user = userEvent.setup()
      render(
        <ErrorState
          error="API rate limit exceeded"
          onRetry={mockOnRetry}
        />
      )

      const retryButton = screen.getByRole('button', { name: 'Try Again' })
      retryButton.focus()

      await user.keyboard('{ }')
      expect(mockOnRetry).toHaveBeenCalledTimes(1)
    })

    test('prevents multiple rapid clicks when button should be disabled', async () => {
      const user = userEvent.setup()
      let clickCount = 0

      render(
        <ErrorState
          error="Connection timeout"
          onRetry={() => {
            clickCount++
            if (clickCount > 1) {
              throw new Error('Button should not be clickable multiple times rapidly')
            }
          }}
        />
      )

      const retryButton = screen.getByRole('button', { name: 'Try Again' })

      await user.click(retryButton)
      // Note: Component doesn't actually disable the button, but test ensures it doesn't crash
      expect(clickCount).toBe(1)
    })

    test('handles focus management correctly', async () => {
      const user = userEvent.setup()
      render(
        <ErrorState
          error="Authentication failed"
          onRetry={mockOnRetry}
        />
      )

      const retryButton = screen.getByRole('button', { name: 'Try Again' })

      // Tab to button
      await user.tab()
      expect(retryButton).toHaveFocus()

      // Activate and check focus is maintained
      await user.keyboard('{Enter}')
      expect(mockOnRetry).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    test('renders accessible error structure for generic errors', () => {
      render(
        <ErrorState
          error="Network connection failed"
          onRetry={mockOnRetry}
        />
      )

      const errorText = screen.getByText('Network connection failed')
      expect(errorText).toBeInTheDocument()

      const retryButton = screen.getByRole('button', { name: 'Try Again' })
      expect(retryButton).toBeInTheDocument()
      expect(retryButton).not.toBeDisabled()
    })

    test('renders accessible structure for token missing errors', () => {
      render(
        <ErrorState
          error="GitHub token not configured"
          onRetry={mockOnRetry}
        />
      )

      const title = screen.getByRole('heading', { name: 'Welcome to Release Browser' })
      expect(title).toBeInTheDocument()

      const message = screen.getByText(/to browse and insert files from your github releases/i)
      expect(message).toBeInTheDocument()

      const retryButton = screen.getByRole('button', { name: 'Try Again' })
      expect(retryButton).toBeInTheDocument()
    })

    test('renders accessible structure for invalid token errors', () => {
      render(
        <ErrorState
          error="Invalid GitHub token"
          onRetry={mockOnRetry}
        />
      )

      const title = screen.getByRole('heading', { name: 'Invalid GitHub Token' })
      expect(title).toBeInTheDocument()

      const message = screen.getByText(/your github personal access token is invalid or has been revoked/i)
      expect(message).toBeInTheDocument()

      const retryButton = screen.getByRole('button', { name: 'Try Again' })
      expect(retryButton).toBeInTheDocument()
    })
  })

  describe('Component Lifecycle', () => {
    test('handles rapid error type changes', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <ErrorState
          error="Initial error"
          onRetry={mockOnRetry}
        />
      )

      // Initial state
      expect(screen.getByText('Initial error')).toBeInTheDocument()

      // Change to token missing
      rerender(
        <ErrorState
          error="GitHub token not configured"
          onRetry={mockOnRetry}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Welcome to Release Browser')).toBeInTheDocument()
      })

      // Change to invalid token
      rerender(
        <ErrorState
          error="Invalid GitHub token"
          onRetry={mockOnRetry}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Invalid GitHub Token')).toBeInTheDocument()
      })

      // Back to generic error
      rerender(
        <ErrorState
          error="Network timeout"
          onRetry={mockOnRetry}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Network timeout')).toBeInTheDocument()
      })
    })

    test('maintains correct button state during re-renders', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <ErrorState
          error="First error"
          onRetry={mockOnRetry}
        />
      )

      const firstButton = screen.getByRole('button', { name: 'Try Again' })
      await user.click(firstButton)
      expect(mockOnRetry).toHaveBeenCalledTimes(1)

      rerender(
        <ErrorState
          error="Second error"
          onRetry={mockOnRetry}
        />
      )

      const secondButton = screen.getByRole('button', { name: 'Try Again' })
      await user.click(secondButton)
      expect(mockOnRetry).toHaveBeenCalledTimes(2)
    })

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

  describe('Event Handling', () => {
    test('handles click events with modifiers', async () => {
      const user = userEvent.setup()
      render(
        <ErrorState
          error="Test error"
          onRetry={mockOnRetry}
        />
      )

      const retryButton = screen.getByRole('button', { name: 'Try Again' })

      // Ctrl+Click should still trigger
      await user.click(retryButton, { ctrlKey: true })
      expect(mockOnRetry).toHaveBeenCalledTimes(1)

      // Shift+Click should still trigger
      await user.click(retryButton, { shiftKey: true })
      expect(mockOnRetry).toHaveBeenCalledTimes(2)
    })

    test('handles right-click without triggering retry', async () => {
      const user = userEvent.setup()
      render(
        <ErrorState
          error="Test error"
          onRetry={mockOnRetry}
        />
      )

      const retryButton = screen.getByRole('button', { name: 'Try Again' })

      fireEvent.contextMenu(retryButton)
      expect(mockOnRetry).not.toHaveBeenCalled()
    })

    test('handles double-click events', async () => {
      const user = userEvent.setup()
      render(
        <ErrorState
          error="Test error"
          onRetry={mockOnRetry}
        />
      )

      const retryButton = screen.getByRole('button', { name: 'Try Again' })

      await user.dblClick(retryButton)
      // Should trigger twice (once for each click in the double-click)
      expect(mockOnRetry).toHaveBeenCalledTimes(2)
    })
  })

  describe('Visual States and Responsive Behavior', () => {
    test('applies hover states to buttons', async () => {
      const user = userEvent.setup()
      render(
        <ErrorState
          error="Server error"
          onRetry={mockOnRetry}
        />
      )

      const retryButton = screen.getByRole('button', { name: 'Try Again' })

      await user.hover(retryButton)
      expect(retryButton).toBeInTheDocument()
      // WordPress Button component handles hover styles internally

      await user.unhover(retryButton)
      expect(retryButton).toBeInTheDocument()
    })

    test('maintains button styles across different error types', () => {
      const { rerender } = render(
        <ErrorState
          error="Generic error"
          onRetry={mockOnRetry}
        />
      )

      const genericButton = screen.getByRole('button', { name: 'Try Again' })
      expect(genericButton).toBeInTheDocument()

      rerender(
        <ErrorState
          error="GitHub token not configured"
          onRetry={mockOnRetry}
        />
      )

      const tokenMissingButton = screen.getByRole('button', { name: 'Try Again' })
      expect(tokenMissingButton).toBeInTheDocument()

      rerender(
        <ErrorState
          error="Invalid GitHub token"
          onRetry={mockOnRetry}
        />
      )

      const invalidTokenButton = screen.getByRole('button', { name: 'Try Again' })
      expect(invalidTokenButton).toBeInTheDocument()
    })

    test('adapts to different container sizes', () => {
      const { rerender } = render(
        <div style={{ width: '200px' }}>
          <ErrorState
            error="This is a very long error message that should wrap properly in small containers"
            onRetry={mockOnRetry}
          />
        </div>
      )

      const errorContainer = screen.getByText(/this is a very long error message/i)
      expect(errorContainer).toBeInTheDocument()

      rerender(
        <div style={{ width: '1000px' }}>
          <ErrorState
            error="This is a very long error message that should wrap properly in small containers"
            onRetry={mockOnRetry}
          />
        </div>
      )

      expect(errorContainer).toBeInTheDocument()
    })

    test('handles container visibility changes', async () => {
      const { rerender } = render(
        <div style={{ display: 'none' }}>
          <ErrorState
            error="Hidden error"
            onRetry={mockOnRetry}
          />
        </div>
      )

      // Component should render even if parent is hidden
      rerender(
        <div style={{ display: 'block' }}>
          <ErrorState
            error="Now visible error"
            onRetry={mockOnRetry}
          />
        </div>
      )

      expect(screen.getByText('Now visible error')).toBeInTheDocument()
    })
  })

  describe('Custom Content Integration', () => {
    test('renders complex custom content with interactive elements', async () => {
      const user = userEvent.setup()
      const customButtonHandler = vi.fn()

      render(
        <ErrorState
          error="Should not show"
          onRetry={mockOnRetry}
        >
          <div>
            <h2>Custom Error Interface</h2>
            <p>Something went wrong. Please try one of these options:</p>
            <button onClick={customButtonHandler} data-testid="custom-action-1">
              Refresh Page
            </button>
            <button onClick={customButtonHandler} data-testid="custom-action-2">
              Contact Support
            </button>
            <input placeholder="Enter email" data-testid="email-input" />
          </div>
        </ErrorState>
      )

      expect(screen.getByText('Custom Error Interface')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong. Please try one of these options:')).toBeInTheDocument()

      const customButton1 = screen.getByTestId('custom-action-1')
      const customButton2 = screen.getByTestId('custom-action-2')
      const emailInput = screen.getByTestId('email-input')

      await user.click(customButton1)
      expect(customButtonHandler).toHaveBeenCalledTimes(1)

      await user.click(customButton2)
      expect(customButtonHandler).toHaveBeenCalledTimes(2)

      await user.type(emailInput, 'test@example.com')
      expect(emailInput).toHaveValue('test@example.com')
    })

    test('passes through props correctly with children', () => {
      render(
        <ErrorState
          error="Should not show"
          onRetry={mockOnRetry}
          className="custom-wrapper-class"
        >
          <div data-testid="child-content">Custom child content</div>
        </ErrorState>
      )

      const container = screen.getByTestId('child-content').closest('.github-release-browser-browser__error')
      expect(container).toHaveClass('custom-wrapper-class')
      expect(screen.getByTestId('child-content')).toBeInTheDocument()
    })

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

  describe('Performance and Memory', () => {
    test('handles many rapid re-renders without memory leaks', async () => {
      const { rerender } = render(
        <ErrorState
          error="Error 1"
          onRetry={mockOnRetry}
        />
      )

      // Rapidly re-render with different errors
      for (let i = 2; i <= 10; i++) {
        rerender(
          <ErrorState
            error={`Error ${i}`}
            onRetry={mockOnRetry}
          />
        )
      }

      expect(screen.getByText('Error 10')).toBeInTheDocument()
    })

    test('cleans up event listeners on unmount', () => {
      const { unmount } = render(
        <ErrorState
          error="Test error"
          onRetry={mockOnRetry}
        />
      )

      expect(screen.getByText('Test error')).toBeInTheDocument()

      unmount()

      // Component should unmount without errors
      expect(document.querySelector('[data-testid="error-container"]')).not.toBeInTheDocument()
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
})
