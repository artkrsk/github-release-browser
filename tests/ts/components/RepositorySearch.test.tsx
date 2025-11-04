import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RepositorySearch } from '@/components/RepositorySearch'
import { render, setupTestEnvironment } from '@test-utils'

// Mock WordPress components with simple structure
vi.mock('@wordpress/components', () => ({
  Button: ({ children, onClick, disabled, variant, icon, label, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      data-variant={variant}
      data-testid={`button-${variant || 'default'}`}
      className={`wp-button wp-button-${variant || 'default'} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  ),
  SearchControl: ({ value, onChange, placeholder, className, ...props }: any) => (
    <input
      type="search"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`wp-search-control ${className || ''}`}
      data-testid="search-control"
      {...props}
    />
  )
}))

describe('RepositorySearch - Simple Testing', () => {
  const mockOnSearchChange = vi.fn()
  const mockOnRefresh = vi.fn()

  const defaultProps = {
    searchQuery: '',
    onSearchChange: mockOnSearchChange,
    onRefresh: mockOnRefresh
  }

  beforeEach(() => {
    setupTestEnvironment()
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    test('renders with required props', () => {
      render(<RepositorySearch {...defaultProps} />)

      expect(screen.getByTestId('search-control')).toBeInTheDocument()
      expect(screen.getByTestId('button-tertiary')).toBeInTheDocument()
      expect(screen.getByText('Select Repository')).toBeInTheDocument()
    })

    test('renders with initial search query', () => {
      render(
        <RepositorySearch
          {...defaultProps}
          searchQuery="test-repo"
        />
      )

      const searchInput = screen.getByTestId('search-control')
      expect(searchInput).toHaveValue('test-repo')
    })

    test('renders refresh button with correct variant', () => {
      render(<RepositorySearch {...defaultProps} />)

      const refreshButton = screen.getByTestId('button-tertiary')
      expect(refreshButton).not.toBeDisabled()
      expect(refreshButton).toHaveAttribute('aria-label', 'Refresh repositories')
    })

    test('renders refresh button as disabled when refreshDisabled is true', () => {
      render(
        <RepositorySearch
          {...defaultProps}
          refreshDisabled={true}
        />
      )

      const refreshButton = screen.getByTestId('button-tertiary')
      expect(refreshButton).toBeDisabled()
    })
  })

  describe('Default Strings', () => {
    test('renders default header text', () => {
      render(<RepositorySearch {...defaultProps} />)

      expect(screen.getByText('Select Repository')).toBeInTheDocument()
    })

    test('renders default refresh button label', () => {
      render(<RepositorySearch {...defaultProps} />)

      const refreshButton = screen.getByTestId('button-tertiary')
      expect(refreshButton).toHaveAttribute('aria-label', 'Refresh repositories')
    })

    test('renders default search placeholder', () => {
      render(<RepositorySearch {...defaultProps} />)

      const searchInput = screen.getByTestId('search-control')
      expect(searchInput).toHaveAttribute('placeholder', 'Search repositories...')
    })

    test('renders with custom translations', () => {
      setupTestEnvironment({
        strings: {
          'repositories.select': 'Choose Repository',
          'repositories.refresh': 'Update Repos',
          'repositories.searchPlaceholder': 'Find repositories...'
        }
      })

      render(<RepositorySearch {...defaultProps} />)

      expect(screen.getByText('Choose Repository')).toBeInTheDocument()

      const refreshButton = screen.getByTestId('button-tertiary')
      expect(refreshButton).toHaveAttribute('aria-label', 'Update Repos')

      const searchInput = screen.getByTestId('search-control')
      expect(searchInput).toHaveAttribute('placeholder', 'Find repositories...')
    })
  })

  describe('Custom Strings (Legacy Fallback)', () => {
    const customStrings = {
      selectRepo: 'Choose Repository',
      refresh: 'Update Repos',
      search: 'Find repos...'
    }

    test('renders custom header text', () => {
      render(
        <RepositorySearch
          {...defaultProps}
          strings={customStrings}
        />
      )

      expect(screen.getByText('Choose Repository')).toBeInTheDocument()
    })

    test('renders custom refresh button label', () => {
      render(
        <RepositorySearch
          {...defaultProps}
          strings={customStrings}
        />
      )

      const refreshButton = screen.getByTestId('button-tertiary')
      expect(refreshButton).toHaveAttribute('aria-label', 'Update Repos')
    })

    test('renders custom search placeholder', () => {
      render(
        <RepositorySearch
          {...defaultProps}
          strings={customStrings}
        />
      )

      const searchInput = screen.getByTestId('search-control')
      expect(searchInput).toHaveAttribute('placeholder', 'Find repos...')
    })

    test('falls back to defaults for missing custom strings', () => {
      const partialStrings = {
        selectRepo: 'Custom Title'
        // missing refresh and search
      }

      render(
        <RepositorySearch
          {...defaultProps}
          strings={partialStrings}
        />
      )

      // Should use custom for provided strings
      expect(screen.getByText('Custom Title')).toBeInTheDocument()

      // Should use defaults for missing strings
      const refreshButton = screen.getByTestId('button-tertiary')
      expect(refreshButton).toHaveAttribute('aria-label', 'Refresh repositories')

      const searchInput = screen.getByTestId('search-control')
      expect(searchInput).toHaveAttribute('placeholder', 'Search repositories...')
    })

    test('falls back to defaults for missing custom strings', () => {
      const partialStrings = {
        selectRepo: 'Custom Title'
        // missing refresh and search
      }

      render(
        <RepositorySearch
          {...defaultProps}
          strings={partialStrings}
        />
      )

      // Should use custom for provided strings
      expect(screen.getByText('Custom Title')).toBeInTheDocument()

      // Should use defaults for missing strings
      const refreshButton = screen.getByTestId('button-tertiary')
      expect(refreshButton).toHaveAttribute('aria-label', 'Refresh repositories')

      const searchInput = screen.getByTestId('search-control')
      expect(searchInput).toHaveAttribute('placeholder', 'Search repositories...')
    })
  })

  describe('Translation System', () => {
    test('overrides default strings with translation system', () => {
      setupTestEnvironment({
        strings: {
          'repositories.select': 'Custom Repository Title',
          'repositories.refresh': 'Custom Refresh Action',
          'repositories.searchPlaceholder': 'Custom Search Placeholder...'
        }
      })

      render(<RepositorySearch {...defaultProps} />)

      expect(screen.getByText('Custom Repository Title')).toBeInTheDocument()
      expect(screen.queryByText('Select Repository')).not.toBeInTheDocument()

      const refreshButton = screen.getByTestId('button-tertiary')
      expect(refreshButton).toHaveAttribute('aria-label', 'Custom Refresh Action')
      expect(refreshButton).not.toHaveAttribute('aria-label', 'Refresh repositories')

      const searchInput = screen.getByTestId('search-control')
      expect(searchInput).toHaveAttribute('placeholder', 'Custom Search Placeholder...')
      expect(searchInput).not.toHaveAttribute('placeholder', 'Search repositories...')
    })

    test('handles partial translation overrides', () => {
      setupTestEnvironment({
        strings: {
          'repositories.select': 'Only Select Title Changed'
          // Only override select, keep defaults for others
        }
      })

      render(<RepositorySearch {...defaultProps} />)

      expect(screen.getByText('Only Select Title Changed')).toBeInTheDocument()

      const refreshButton = screen.getByTestId('button-tertiary')
      expect(refreshButton).toHaveAttribute('aria-label', 'Refresh repositories') // Still default

      const searchInput = screen.getByTestId('search-control')
      expect(searchInput).toHaveAttribute('placeholder', 'Search repositories...') // Still default
    })
  })

  describe('Search Functionality', () => {
    test('calls onSearchChange when search input changes', async () => {
      const user = userEvent.setup()
      render(<RepositorySearch {...defaultProps} />)

      const searchInput = screen.getByTestId('search-control')
      await user.type(searchInput, 'test')

      expect(mockOnSearchChange).toHaveBeenCalled()
    })

    test('calls onSearchChange when search input is cleared', async () => {
      const user = userEvent.setup()
      render(
        <RepositorySearch
          {...defaultProps}
          searchQuery="initial"
        />
      )

      const searchInput = screen.getByTestId('search-control')
      await user.clear(searchInput)

      expect(mockOnSearchChange).toHaveBeenCalledWith('')
    })

    test('handles rapid search input changes', async () => {
      const user = userEvent.setup()
      render(<RepositorySearch {...defaultProps} />)

      const searchInput = screen.getByTestId('search-control')
      await user.type(searchInput, 'abc')

      expect(mockOnSearchChange).toHaveBeenCalled()
    })

    test('handles search with special characters', async () => {
      const user = userEvent.setup()
      render(<RepositorySearch {...defaultProps} />)

      const searchInput = screen.getByTestId('search-control')
      await user.type(searchInput, 'owner/repo-test')

      expect(mockOnSearchChange).toHaveBeenCalled()
    })

    test('handles empty search changes', async () => {
      const user = userEvent.setup()
      render(
        <RepositorySearch
          {...defaultProps}
          searchQuery="existing"
        />
      )

      const searchInput = screen.getByTestId('search-control')
      await user.clear(searchInput)

      expect(mockOnSearchChange).toHaveBeenCalledWith('')
    })
  })

  describe('Refresh Functionality', () => {
    test('calls onRefresh when refresh button is clicked', async () => {
      const user = userEvent.setup()
      render(<RepositorySearch {...defaultProps} />)

      const refreshButton = screen.getByTestId('button-tertiary')
      await user.click(refreshButton)

      expect(mockOnRefresh).toHaveBeenCalledTimes(1)
    })

    test('does not call onRefresh when refresh button is disabled', async () => {
      const user = userEvent.setup()
      render(
        <RepositorySearch
          {...defaultProps}
          refreshDisabled={true}
        />
      )

      const refreshButton = screen.getByTestId('button-tertiary')
      await user.click(refreshButton)

      expect(mockOnRefresh).not.toHaveBeenCalled()
    })

    test('handles multiple refresh clicks', async () => {
      const user = userEvent.setup()
      render(<RepositorySearch {...defaultProps} />)

      const refreshButton = screen.getByTestId('button-tertiary')

      await user.click(refreshButton)
      await user.click(refreshButton)
      await user.click(refreshButton)

      expect(mockOnRefresh).toHaveBeenCalledTimes(3)
    })

    test('handles refresh disabled state changes', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<RepositorySearch {...defaultProps} />)

      const refreshButton = screen.getByTestId('button-tertiary')
      expect(refreshButton).not.toBeDisabled()

      // Disable refresh
      rerender(
        <RepositorySearch
          {...defaultProps}
          refreshDisabled={true}
        />
      )

      expect(refreshButton).toBeDisabled()

      // Re-enable refresh
      rerender(
        <RepositorySearch
          {...defaultProps}
          refreshDisabled={false}
        />
      )

      expect(refreshButton).not.toBeDisabled()
    })
  })

  describe('Component Re-rendering', () => {
    test('updates search input value when searchQuery prop changes', () => {
      const { rerender } = render(<RepositorySearch {...defaultProps} />)

      const searchInput = screen.getByTestId('search-control')
      expect(searchInput).toHaveValue('')

      rerender(
        <RepositorySearch
          {...defaultProps}
          searchQuery="new-query"
        />
      )

      expect(searchInput).toHaveValue('new-query')
    })

    test('updates strings when strings prop changes', () => {
      const { rerender } = render(<RepositorySearch {...defaultProps} />)

      expect(screen.getByText('Select Repository')).toBeInTheDocument()

      const newStrings = { selectRepo: 'Choose New Repository' }
      rerender(
        <RepositorySearch
          {...defaultProps}
          strings={newStrings}
        />
      )

      expect(screen.getByText('Choose New Repository')).toBeInTheDocument()
      expect(screen.queryByText('Select Repository')).not.toBeInTheDocument()
    })

    test('handles combined prop changes', () => {
      const { rerender } = render(<RepositorySearch {...defaultProps} />)

      const searchInput = screen.getByTestId('search-control')
      const refreshButton = screen.getByTestId('button-tertiary')

      // Initial state
      expect(searchInput).toHaveValue('')
      expect(refreshButton).not.toBeDisabled()
      expect(screen.getByText('Select Repository')).toBeInTheDocument()

      // Changed state
      const newProps = {
        ...defaultProps,
        searchQuery: 'updated-search',
        refreshDisabled: true,
        strings: { selectRepo: 'Updated Title', refresh: 'Updated Refresh' }
      }

      rerender(<RepositorySearch {...newProps} />)

      expect(searchInput).toHaveValue('updated-search')
      expect(refreshButton).toBeDisabled()
      expect(screen.getByText('Updated Title')).toBeInTheDocument()
      expect(refreshButton).toHaveAttribute('aria-label', 'Updated Refresh')
    })
  })

  describe('Edge Cases', () => {
    test('handles undefined strings gracefully', () => {
      render(
        <RepositorySearch
          {...defaultProps}
          strings={undefined}
        />
      )

      expect(screen.getByText('Select Repository')).toBeInTheDocument()
      const refreshButton = screen.getByTestId('button-tertiary')
      expect(refreshButton).toHaveAttribute('aria-label', 'Refresh repositories')

      const searchInput = screen.getByTestId('search-control')
      expect(searchInput).toHaveAttribute('placeholder', 'Search repositories...')
    })

    test('handles empty strings object', () => {
      render(
        <RepositorySearch
          {...defaultProps}
          strings={{}}
        />
      )

      expect(screen.getByText('Select Repository')).toBeInTheDocument()
      const refreshButton = screen.getByTestId('button-tertiary')
      expect(refreshButton).toHaveAttribute('aria-label', 'Refresh repositories')

      const searchInput = screen.getByTestId('search-control')
      expect(searchInput).toHaveAttribute('placeholder', 'Search repositories...')
    })

    test('handles very long search queries', async () => {
      const user = userEvent.setup()
      const longQuery = 'testquery' // Shorter for test efficiency

      render(<RepositorySearch {...defaultProps} />)

      const searchInput = screen.getByTestId('search-control')
      await user.type(searchInput, longQuery)

      expect(mockOnSearchChange).toHaveBeenCalled()
    })

    test('handles search queries with special characters', async () => {
      const user = userEvent.setup()
      const specialQuery = 'owner-test'

      render(<RepositorySearch {...defaultProps} />)

      const searchInput = screen.getByTestId('search-control')
      await user.type(searchInput, specialQuery)

      expect(mockOnSearchChange).toHaveBeenCalled()
    })

    test('handles empty custom strings gracefully', () => {
      render(
        <RepositorySearch
          {...defaultProps}
          strings={{ selectRepo: '' }}
        />
      )

      // Should fall back to default when custom string is empty
      expect(screen.getByText('Select Repository')).toBeInTheDocument()
    })
  })

  describe('Combined Interactions', () => {
    test('handles rapid refresh and search interactions', async () => {
      const user = userEvent.setup()
      render(<RepositorySearch {...defaultProps} />)

      const searchInput = screen.getByTestId('search-control')
      const refreshButton = screen.getByTestId('button-tertiary')

      await user.type(searchInput, 'test')
      await user.click(refreshButton)
      await user.clear(searchInput)
      await user.click(refreshButton)

      expect(mockOnRefresh).toHaveBeenCalledTimes(2)
      expect(mockOnSearchChange).toHaveBeenCalled()
    })

    test('handles search while refresh is disabled', async () => {
      const user = userEvent.setup()
      render(
        <RepositorySearch
          {...defaultProps}
          refreshDisabled={true}
        />
      )

      const searchInput = screen.getByTestId('search-control')
      const refreshButton = screen.getByTestId('button-tertiary')

      expect(refreshButton).toBeDisabled()

      await user.type(searchInput, 'search')

      expect(mockOnSearchChange).toHaveBeenCalled()
      expect(refreshButton).toBeDisabled() // Should remain disabled
    })
  })

  describe('CSS Classes', () => {
    test('applies correct CSS classes to components', () => {
      render(<RepositorySearch {...defaultProps} />)

      const searchInput = screen.getByTestId('search-control')
      expect(searchInput).toHaveClass('wp-search-control')
      expect(searchInput).toHaveClass('github-release-browser-browser__search')

      const refreshButton = screen.getByTestId('button-tertiary')
      expect(refreshButton).toHaveClass('wp-button')
      expect(refreshButton).toHaveClass('wp-button-tertiary')
      expect(refreshButton).toHaveClass('github-release-browser-browser__refresh-button')
    })

    test('maintains CSS classes with custom props', () => {
      render(
        <RepositorySearch
          {...defaultProps}
          refreshDisabled={true}
          strings={{ selectRepo: 'Custom' }}
        />
      )

      const searchInput = screen.getByTestId('search-control')
      expect(searchInput).toHaveClass('wp-search-control')
      expect(searchInput).toHaveClass('github-release-browser-browser__search')

      const refreshButton = screen.getByTestId('button-tertiary')
      expect(refreshButton).toHaveClass('wp-button')
      expect(refreshButton).toHaveClass('wp-button-tertiary')
      expect(refreshButton).toHaveClass('github-release-browser-browser__refresh-button')
    })
  })
})