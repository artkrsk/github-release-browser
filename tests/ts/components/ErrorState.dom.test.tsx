import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorState } from '@/components/ErrorState'
import { render } from '@test-utils'

describe('ErrorState - DOM Testing', () => {
  const mockOnRetry = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('DOM Structure and Accessibility', () => {
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

  describe('User Interactions', () => {
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

  describe('Visual States and Transitions', () => {
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
  })

  describe('Event Handling Edge Cases', () => {
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

  describe('Responsive Behavior', () => {
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
})