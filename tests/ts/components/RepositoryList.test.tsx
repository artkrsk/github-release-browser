import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RepositoryList } from '@/components/RepositoryList'
import { render, setupTestEnvironment, createMockBrowserConfig } from '@test-utils'

// Mock WordPress components with simple structure
vi.mock('@wordpress/components', () => ({
  Button: ({ children, onClick, disabled, variant, icon, label, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      data-variant={variant || 'default'}
      className={`wp-button wp-button-${variant || 'default'} ${className || ''}`}
      data-testid={`button-${variant || 'default'}`}
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
  ),
  Panel: ({ children, className, ...props }: any) => (
    <div
      role="region"
      className={`wp-panel ${className || ''}`}
      data-testid="panel"
      {...props}
    >
      {children}
    </div>
  ),
  PanelBody: ({ children, title, opened, onToggle, className, ...props }: any) => (
    <div className={`wp-panel-body ${className || ''}`} data-testid="panel-body">
      <button
        onClick={onToggle}
        aria-expanded={opened}
        className="wp-panel-body__toggle"
        data-testid="panel-toggle"
      >
        {title}
      </button>
      {opened && (
        <div className="wp-panel-body__content" data-testid="panel-content">
          {children}
        </div>
      )}
    </div>
  ),
  Spinner: ({ className, ...props }: any) => (
    <div
      className={`wp-spinner ${className || ''}`}
      data-testid="spinner"
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span>⏳</span>
    </div>
  )
}))

// Mock ReleaseList component
vi.mock('@/components/ReleaseList', () => ({
  ReleaseList: ({ releases, selectedRelease, onSelectRelease, repository, strings, features, upgradeUrl, error, onRetry }: any) => {
    // Handle all falsy values that trigger the || [] fallback
    const releasesArray = releases || []

    if (error) {
      return (
        <div data-testid="release-list-error" className="release-list-error">
          <div data-testid="error-message">{error}</div>
          {onRetry && (
            <a href="#" onClick={onRetry} data-testid="retry-link">
              Retry
            </a>
          )}
        </div>
      )
    }

    return (
      <div data-testid="release-list" className="release-list">
        <div data-testid="release-repository" data-repository-name={repository}>{repository}</div>
        <div data-testid="releases-value">{JSON.stringify(releases)}</div>
        {releasesArray && releasesArray.length > 0 ? (
          releasesArray.map((release: any) => (
            <div
              key={release.id || release.tag_name || Math.random()}
              data-testid={`release-${release.tag_name}`}
              className={`release-item ${selectedRelease === release.tag_name ? 'selected' : ''}`}
              onClick={() => onSelectRelease && onSelectRelease(release)}
              role="button"
              tabIndex={0}
            >
              <div className="release-name">{release.name || release.tag_name}</div>
              <div className="release-tag">{release.tag_name}</div>
              <div className="release-date">{new Date(release.published_at).toLocaleDateString()}</div>
            </div>
          ))
        ) : (
          <div data-testid="no-releases">No releases available</div>
        )}
      </div>
    )
  }
}))

describe('RepositoryList - Simple Testing', () => {
  const mockOnRepoToggle = vi.fn()
  const mockOnSelectRelease = vi.fn()
  const mockOnSelectAsset = vi.fn()
  const mockOnSearchChange = vi.fn()
  const mockOnRefresh = vi.fn()

  const mockFetchReleasesForRepo = vi.fn()

  const defaultProps = {
    repos: [
      {
        id: 1,
        name: 'owner/test-repo-1',
        full_name: 'owner/test-repo-1',
        description: 'Test repository 1',
        private: false
      },
      {
        id: 2,
        name: 'organization/proj-repo-2',
        full_name: 'organization/proj-repo-2',
        description: 'Test repository 2',
        private: true
      },
      {
        id: 3,
        name: 'user/demo-repo-3',
        full_name: 'user/demo-repo-3',
        description: 'Test repository 3',
        private: false
      }
    ],
    searchQuery: '',
    expandedRepo: null,
    selectedRepo: null,
    repoReleases: {},
    releaseErrors: {},
    loadingRepo: null,
    selectedReleaseTag: null,
    onRepoToggle: mockOnRepoToggle,
    onSelectRelease: mockOnSelectRelease,
    fetchReleasesForRepo: mockFetchReleasesForRepo,
    onSelectAsset: mockOnSelectAsset,
    onSearchChange: mockOnSearchChange,
    onRefresh: mockOnRefresh,
    config: createMockBrowserConfig({
      strings: {
        selectRepo: 'Select Repository',
        noRepos: 'No repositories found',
        noResults: 'No repositories match your search',
        refresh: 'Refresh repositories',
        search: 'Search repositories...'
      }
    })
  }

  beforeEach(() => {
    setupTestEnvironment()
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    test('renders with required props', () => {
      render(<RepositoryList {...defaultProps} />)

      expect(screen.getByText('owner/test-repo-1')).toBeInTheDocument()
      expect(screen.getByText('organization/proj-repo-2 *')).toBeInTheDocument()
      expect(screen.getByText('user/demo-repo-3')).toBeInTheDocument()
    })

    test('renders with initial search query', () => {
      render(<RepositoryList {...defaultProps} searchQuery="test" />)

      expect(screen.getByText('owner/test-repo-1')).toBeInTheDocument()
      expect(screen.queryByText('organization/proj-repo-2')).not.toBeInTheDocument()
      expect(screen.queryByText('user/demo-repo-3')).not.toBeInTheDocument()
    })

    test('renders repository count correctly', () => {
      render(<RepositoryList {...defaultProps} />)

      const toggleButtons = screen.getAllByTestId('panel-toggle')
      expect(toggleButtons).toHaveLength(3)
    })

    test('handles empty repository list', () => {
      render(<RepositoryList {...defaultProps} repos={[]} />)

      expect(screen.getByText('No repositories found')).toBeInTheDocument()
      const toggleButtons = screen.queryAllByTestId('panel-toggle')
      expect(toggleButtons).toHaveLength(0)
    })
  })

  describe('Loading States', () => {
    test('shows loading spinner when repository is loading', () => {
      render(
        <RepositoryList
          {...defaultProps}
          expandedRepo="owner/test-repo-1"
          loadingRepo="owner/test-repo-1"
        />
      )

      // Loading state should be visible when repo is expanded and loading
      const repoPanel = screen.getByText('owner/test-repo-1').closest('button')
      expect(repoPanel).toHaveAttribute('aria-expanded', 'true')

      // Should show spinner in the panel content
      const panelContent = screen.getByTestId('panel-content')
      expect(panelContent.querySelector('.github-release-browser-repo-panel__loading')).toBeInTheDocument()
      expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })

    test('does not show loading spinner for different repository', () => {
      render(
        <RepositoryList
          {...defaultProps}
          expandedRepo="owner/test-repo-1"
          loadingRepo="organization/proj-repo-2"
        />
      )

      // Should not show spinner for expanded repo when different repo is loading
      const repoPanel = screen.getByText('owner/test-repo-1').closest('button')
      expect(repoPanel).toHaveAttribute('aria-expanded', 'true')

      const panelContent = screen.getByTestId('panel-content')
      expect(panelContent.querySelector('.github-release-browser-repo-panel__loading')).not.toBeInTheDocument()
    })
  })

  describe('Repository Expansion and Selection', () => {
    test('handles repository expansion', async () => {
      const user = userEvent.setup()
      render(<RepositoryList {...defaultProps} />)

      const repoButton = screen.getByText('owner/test-repo-1').closest('button')
      await user.click(repoButton)

      expect(mockOnRepoToggle).toHaveBeenCalledWith('owner/test-repo-1')
    })

    test('shows correct expanded state', () => {
      render(<RepositoryList {...defaultProps} expandedRepo="owner/test-repo-1" />)

      const repoPanels = screen.getAllByTestId('panel-toggle')
      const expandedPanel = repoPanels.find(panel => panel.getAttribute('aria-expanded') === 'true')
      expect(expandedPanel).toHaveAttribute('aria-expanded', 'true')
    })

    test('shows release list when repository is expanded', () => {
      render(
        <RepositoryList
          {...defaultProps}
          expandedRepo="owner/test-repo-1"
          repoReleases={{
            'owner/test-repo-1': [
              {
                id: 1,
                tag_name: 'v1.0.0',
                name: 'Test Release',
                published_at: '2024-01-15T00:00:00Z',
                assets: [
                  {
                    id: 1,
                    name: 'file1.zip',
                    size: 1024,
                    content_type: 'application/zip',
                    download_url: 'https://example.com/file1.zip'
                  }
                ]
              }
            ]
          }}
        />
      )

      expect(screen.getByText('v1.0.0')).toBeInTheDocument()
    })

    test('shows selected release state correctly', () => {
      render(
        <RepositoryList
          {...defaultProps}
          expandedRepo="owner/test-repo-1"
          selectedRepo="owner/test-repo-1"
          selectedReleaseTag="v1.0.0"
          repoReleases={{
            'owner/test-repo-1': [
              {
                id: 1,
                tag_name: 'v1.0.0',
                name: 'Test Release',
                published_at: '2024-01-15T00:00:00Z',
                assets: [
                  {
                    id: 1,
                    name: 'file1.zip',
                    size: 1024,
                    content_type: 'application/zip',
                    download_url: 'https://example.com/file1.zip'
                  }
                ]
              }
            ]
          }}
        />
      )

      expect(screen.getByText('v1.0.0')).toBeInTheDocument()
      // Check that the repository has a selected state (✓ prefix)
      expect(screen.getByText('✓ owner/test-repo-1').closest('button')).toHaveAttribute('aria-expanded', 'true')
    })

    test('handles repository without full_name gracefully', () => {
      const reposWithUndefined = [
        {
          id: 1,
          name: 'test-repo-1',
          // full_name is undefined
          description: 'Test repository 1',
          private: false
        },
        {
          id: 2,
          name: 'test-repo-2',
          full_name: 'owner/test-repo-2',
          description: 'Test repository 2',
          private: false
        }
      ]

      render(<RepositoryList {...defaultProps} repos={reposWithUndefined} />)

      // Should only show the repo with full_name
      expect(screen.getByText('owner/test-repo-2')).toBeInTheDocument()
      expect(screen.queryByText('test-repo-1')).not.toBeInTheDocument()
    })

    test('handles repository without full_name and selected repo', () => {
      const reposWithUndefined = [
        {
          id: 1,
          name: 'test-repo-1',
          // full_name is undefined
          description: 'Test repository 1',
          private: false
        },
        {
          id: 2,
          name: 'test-repo-2',
          full_name: 'owner/test-repo-2',
          description: 'Test repository 2',
          private: false
        }
      ]

      render(
        <RepositoryList
          {...defaultProps}
          repos={reposWithUndefined}
          selectedRepo="invalid-repo"
        />
      )

      // Should not crash when selectedRepo doesn't match any repo
      expect(screen.getByText('owner/test-repo-2')).toBeInTheDocument()
      expect(screen.queryByText('test-repo-1')).not.toBeInTheDocument()
    })
  })

  describe('Filtering Functionality', () => {
    test('filters repositories by search query', () => {
      render(<RepositoryList {...defaultProps} searchQuery="test" />)

      expect(screen.getByText('owner/test-repo-1')).toBeInTheDocument()
      expect(screen.queryByText('organization/proj-repo-2')).not.toBeInTheDocument()
      expect(screen.queryByText('user/demo-repo-3')).not.toBeInTheDocument()
    })

    test('shows no results when search has no matches', () => {
      render(<RepositoryList {...defaultProps} searchQuery="nonexistent" />)

      expect(screen.getByText('No repositories match your search')).toBeInTheDocument()
    })

    test('shows no repositories when list is empty', () => {
      render(<RepositoryList {...defaultProps} repos={[]} />)

      expect(screen.getByText('No repositories found')).toBeInTheDocument()
    })

    test('case-insensitive search filtering', () => {
      render(<RepositoryList {...defaultProps} searchQuery="TEST" />)

      expect(screen.getByText('owner/test-repo-1')).toBeInTheDocument()
      expect(screen.queryByText('organization/proj-repo-2')).not.toBeInTheDocument()
    })

    test('filters by partial name', () => {
      render(<RepositoryList {...defaultProps} searchQuery="test-repo" />)

      expect(screen.getByText('owner/test-repo-1')).toBeInTheDocument()
      expect(screen.queryByText('organization/proj-repo-2')).not.toBeInTheDocument()
    })
  })

  describe('Repository Indicators', () => {
    test('shows private repository indicators correctly', () => {
      render(<RepositoryList {...defaultProps} />)

      // Check that only the private repo has an asterisk
      const privateRepo = screen.getByText('organization/proj-repo-2 *')
      const publicRepo1 = screen.getByText('owner/test-repo-1')
      const publicRepo2 = screen.getByText('user/demo-repo-3')

      expect(privateRepo).toBeInTheDocument()
      expect(publicRepo1).toBeInTheDocument()
      expect(publicRepo2).toBeInTheDocument()
      expect(privateRepo.textContent).toContain('*')
      expect(publicRepo1.textContent).not.toContain('*')
      expect(publicRepo2.textContent).not.toContain('*')
    })
  })

  describe('Component Re-rendering', () => {
    test('updates strings when strings prop changes', () => {
      const { rerender } = render(<RepositoryList {...defaultProps} />)

      expect(screen.getByText('owner/test-repo-1')).toBeInTheDocument()

      rerender(<RepositoryList {...defaultProps} repos={[]} />)

      expect(screen.getByText('No repositories found')).toBeInTheDocument()
      expect(screen.queryByText('owner/test-repo-1')).not.toBeInTheDocument()
    })

    test('handles filter changes', () => {
      const { rerender } = render(<RepositoryList {...defaultProps} />)

      // Should show all repos initially
      expect(screen.getByText('owner/test-repo-1')).toBeInTheDocument()
      expect(screen.getByText('organization/proj-repo-2 *')).toBeInTheDocument()
      expect(screen.getByText('user/demo-repo-3')).toBeInTheDocument()

      // Filter to only show repos containing "test"
      rerender(<RepositoryList {...defaultProps} searchQuery="test" />)

      expect(screen.getByText('owner/test-repo-1')).toBeInTheDocument()
      expect(screen.queryByText('organization/proj-repo-2 *')).not.toBeInTheDocument()
      expect(screen.queryByText('user/demo-repo-3')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    test('handles empty search query with no repositories', () => {
      render(<RepositoryList {...defaultProps} repos={[]} searchQuery="" />)

      expect(screen.getByText('No repositories found')).toBeInTheDocument()
    })

    test('handles search query with no repositories', () => {
      render(<RepositoryList {...defaultProps} repos={[]} searchQuery="test" />)

      expect(screen.getByText('No repositories match your search')).toBeInTheDocument()
    })

    test('handles case-sensitive filtering', () => {
      render(<RepositoryList {...defaultProps} searchQuery="OWNER" />)

      // Should still find matches due to case insensitive search
      expect(screen.getByText('owner/test-repo-1')).toBeInTheDocument()
      expect(screen.queryByText('organization/proj-repo-2 *')).not.toBeInTheDocument()
      expect(screen.queryByText('user/demo-repo-3')).not.toBeInTheDocument()
    })

    test('handles partial matching', () => {
      render(<RepositoryList {...defaultProps} searchQuery="repo" />)

      expect(screen.getByText('owner/test-repo-1')).toBeInTheDocument()
      expect(screen.getByText('organization/proj-repo-2 *')).toBeInTheDocument()
      expect(screen.getByText('user/demo-repo-3')).toBeInTheDocument()
    })

    test('handles special characters in search query', () => {
      render(<RepositoryList {...defaultProps} searchQuery="/" />)

      expect(screen.getByText('owner/test-repo-1')).toBeInTheDocument()
      expect(screen.getByText('organization/proj-repo-2 *')).toBeInTheDocument()
      expect(screen.getByText('user/demo-repo-3')).toBeInTheDocument()
    })
  })

  describe('Edge Cases - Missing full_name', () => {
    test('renders repository with undefined full_name', () => {
      const reposWithUndefined = [{
        id: 1,
        name: 'test-repo',
        full_name: undefined,
        description: 'Test repo without full_name',
        private: false
      }]

      render(<RepositoryList {...defaultProps} repos={reposWithUndefined} />)

      // Should not render the repo without full_name
      expect(screen.queryByText('test-repo')).not.toBeInTheDocument()
    })

    test('renders repository with null full_name', () => {
      const reposWithNull = [{
        id: 1,
        name: 'test-repo',
        full_name: null,
        description: 'Test repo with null full_name',
        private: false
      }]

      render(<RepositoryList {...defaultProps} repos={reposWithNull} />)

      // Should not render the repo with null full_name
      expect(screen.queryByText('test-repo')).not.toBeInTheDocument()
    })

    test('renders repository with empty string full_name', () => {
      const reposWithEmpty = [{
        id: 1,
        name: 'test-repo',
        full_name: '',
        description: 'Test repo with empty full_name',
        private: false
      }]

      render(<RepositoryList {...defaultProps} repos={reposWithEmpty} />)

      // Should not render the repo with empty full_name
      expect(screen.queryByText('test-repo')).not.toBeInTheDocument()
    })

    test('handles mixed repositories with and without full_name', () => {
      const mixedRepos = [
        {
          id: 1,
          name: 'valid-repo',
          full_name: 'owner/valid-repo',
          description: 'Valid repository',
          private: false
        },
        {
          id: 2,
          name: 'invalid-repo',
          full_name: undefined,
          description: 'Invalid repository without full_name',
          private: false
        },
        {
          id: 3,
          name: 'another-valid-repo',
          full_name: 'user/another-valid-repo',
          description: 'Another valid repository',
          private: true
        }
      ]

      render(<RepositoryList {...defaultProps} repos={mixedRepos} />)

      // Should only render repositories with valid full_name
      expect(screen.getByText('owner/valid-repo')).toBeInTheDocument()
      expect(screen.getByText('user/another-valid-repo *')).toBeInTheDocument()
      expect(screen.queryByText('invalid-repo')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases - Missing Releases Data', () => {
    test('handles undefined releases for expanded repository', () => {
      render(
        <RepositoryList
          {...defaultProps}
          expandedRepo="owner/test-repo-1"
          repoReleases={{
            'owner/test-repo-1': undefined  // This triggers the || [] fallback
          }}
        />
      )

      const repoPanels = screen.getAllByTestId('panel-toggle')
      const expandedPanel = repoPanels.find(panel => panel.getAttribute('aria-expanded') === 'true')
      expect(expandedPanel).toHaveAttribute('aria-expanded', 'true')

      // Since releases is undefined, ReleaseList should be rendered with empty array
      expect(screen.getByTestId('release-list')).toBeInTheDocument()
      expect(screen.getByTestId('no-releases')).toBeInTheDocument()
    })

    test('handles null releases for expanded repository', () => {
      render(
        <RepositoryList
          {...defaultProps}
          expandedRepo="owner/test-repo-1"
          repoReleases={{
            'owner/test-repo-1': null  // This triggers the || [] fallback
          }}
        />
      )

      const repoPanels = screen.getAllByTestId('panel-toggle')
      const expandedPanel = repoPanels.find(panel => panel.getAttribute('aria-expanded') === 'true')
      expect(expandedPanel).toHaveAttribute('aria-expanded', 'true')

      // Since releases is null, ReleaseList should be rendered with empty array
      expect(screen.getByTestId('release-list')).toBeInTheDocument()
      expect(screen.getByTestId('no-releases')).toBeInTheDocument()
    })

    
    test('handles zero releases (empty array) for expanded repository', () => {
      render(
        <RepositoryList
          {...defaultProps}
          expandedRepo="owner/test-repo-1"
          repoReleases={{
            'owner/test-repo-1': []  // Empty array is truthy, so no fallback
          }}
        />
      )

      const repoPanels = screen.getAllByTestId('panel-toggle')
      const expandedPanel = repoPanels.find(panel => panel.getAttribute('aria-expanded') === 'true')
      expect(expandedPanel).toHaveAttribute('aria-expanded', 'true')

      // Empty array should be passed directly to ReleaseList
      expect(screen.getByTestId('release-list')).toBeInTheDocument()
    })

    test('handles mixed repository releases data', () => {
      render(
        <RepositoryList
          {...defaultProps}
          expandedRepo="owner/test-repo-1"
          repoReleases={{
            'owner/test-repo-1': [
              {
                id: 1,
                tag_name: 'v1.0.0',
                name: 'Test Release',
                published_at: '2024-01-15T00:00:00Z',
                assets: []
              }
            ],
            'organization/proj-repo-2': undefined,  // Should trigger fallback
            'user/demo-repo-3': null  // Should trigger fallback
          }}
        />
      )

      const repoPanels = screen.getAllByTestId('panel-toggle')
      const expandedPanel = repoPanels.find(panel => panel.getAttribute('aria-expanded') === 'true')
      expect(expandedPanel).toHaveAttribute('aria-expanded', 'true')

      // Should show releases for the valid repo
      expect(screen.getByText('v1.0.0')).toBeInTheDocument()
    })
  })

  describe('CSS Classes and Structure', () => {
    test('renders correct structure for repositories', () => {
      render(<RepositoryList {...defaultProps} />)

      // Should have a panel component
      expect(screen.getByRole('region')).toBeInTheDocument()

      // Should have toggle buttons for each repository
      expect(screen.getAllByTestId('panel-toggle')).toHaveLength(3)
    })

    test('applies correct classes to repository items', () => {
      render(<RepositoryList {...defaultProps} />)

      const toggleButtons = screen.getAllByTestId('panel-toggle')
      expect(toggleButtons[0]).toHaveClass('wp-panel-body__toggle')
    })
  })

  describe('Translation System', () => {
    test('uses default translations when no custom translations provided', () => {
      setupTestEnvironment()

      render(<RepositoryList {...defaultProps} repos={[]} />)

      expect(screen.getByText('No repositories found')).toBeInTheDocument()

      // Test search result message
      render(<RepositoryList {...defaultProps} searchQuery="test" repos={[]} />)
      expect(screen.getByText('No repositories match your search')).toBeInTheDocument()
    })

    test('overrides default strings with translation system', () => {
      setupTestEnvironment({
        strings: {
          'repositories.noneFound': 'Custom No Repositories Message',
          'repositories.noResults': 'Custom No Search Results Message'
        }
      })

      render(<RepositoryList {...defaultProps} repos={[]} />)
      expect(screen.getByText('Custom No Repositories Message')).toBeInTheDocument()
      expect(screen.queryByText('No repositories found')).not.toBeInTheDocument()

      render(<RepositoryList {...defaultProps} searchQuery="test" repos={[]} />)
      expect(screen.getByText('Custom No Search Results Message')).toBeInTheDocument()
      expect(screen.queryByText('No repositories match your search')).not.toBeInTheDocument()
    })

    test('handles partial translation overrides', () => {
      setupTestEnvironment({
        strings: {
          'repositories.noneFound': 'Only override no repos message'
          // repositories.noResults should use default
        }
      })

      render(<RepositoryList {...defaultProps} repos={[]} />)
      expect(screen.getByText('Only override no repos message')).toBeInTheDocument()

      render(<RepositoryList {...defaultProps} searchQuery="test" repos={[]} />)
      expect(screen.getByText('No repositories match your search')).toBeInTheDocument() // Uses default
    })

    test('preserves custom strings functionality alongside translation system', () => {
      setupTestEnvironment({
        strings: {
          'repositories.noneFound': 'Translation system message'
        }
      })

      const customStrings = {
        'repositories.noneFound': 'Custom config strings message',
        'repositories.noResults': 'Custom no results message'
      }
      const customConfig = createMockBrowserConfig({ strings: customStrings })

      // Custom config strings should take precedence over translation system
      render(<RepositoryList {...defaultProps} repos={[]} config={customConfig} />)
      expect(screen.getByText('Custom config strings message')).toBeInTheDocument()
      expect(screen.queryByText('Translation system message')).not.toBeInTheDocument()

      render(<RepositoryList {...defaultProps} searchQuery="test" repos={[]} config={customConfig} />)
      expect(screen.getByText('Custom no results message')).toBeInTheDocument()
    })
  })

  describe('Release Selection', () => {
    test('calls onSelectRelease when release is selected', async () => {
      const user = userEvent.setup()

      const mockRelease = {
        id: 1,
        tag_name: 'v1.0.0',
        name: 'Test Release v1.0.0',
        published_at: '2024-01-15T00:00:00Z',
        assets: [
          {
            id: 1,
            name: 'test-file.zip',
            size: 1024,
            content_type: 'application/zip',
            download_url: 'https://example.com/test-file.zip'
          }
        ]
      }

      render(
        <RepositoryList
          {...defaultProps}
          expandedRepo="owner/test-repo-1"
          repoReleases={{
            'owner/test-repo-1': [mockRelease]
          }}
        />
      )

      // Should show the repository expanded
      const repoPanels = screen.getAllByTestId('panel-toggle')
      const expandedPanel = repoPanels.find(panel => panel.getAttribute('aria-expanded') === 'true')
      expect(expandedPanel).toHaveAttribute('aria-expanded', 'true')

      // Should show the release list
      expect(screen.getByTestId('release-list')).toBeInTheDocument()
      expect(screen.getByTestId('release-v1.0.0')).toBeInTheDocument()

      // Click on the release
      const releaseItem = screen.getByTestId('release-v1.0.0')
      await user.click(releaseItem)

      // Should call onSelectRelease with correct parameters
      expect(mockOnSelectRelease).toHaveBeenCalledWith('owner/test-repo-1', mockRelease)
      expect(mockOnSelectRelease).toHaveBeenCalledTimes(1)
    })

    test('shows selected release state correctly', () => {
      const mockRelease = {
        id: 1,
        tag_name: 'v2.0.0',
        name: 'Test Release v2.0.0',
        published_at: '2024-02-15T00:00:00Z',
        assets: []
      }

      render(
        <RepositoryList
          {...defaultProps}
          expandedRepo="owner/test-repo-1"
          selectedRepo="owner/test-repo-1"
          selectedReleaseTag="v2.0.0"
          repoReleases={{
            'owner/test-repo-1': [mockRelease]
          }}
        />
      )

      // Should show the selected state
      const releaseItem = screen.getByTestId('release-v2.0.0')
      expect(releaseItem).toHaveClass('selected')
    })

    test('handles release selection with multiple repositories', async () => {
      const user = userEvent.setup()

      const repo1Release = {
        id: 1,
        tag_name: 'v1.0.0',
        name: 'Repo 1 Release',
        published_at: '2024-01-15T00:00:00Z',
        assets: []
      }

      const repo2Release = {
        id: 2,
        tag_name: 'v2.0.0',
        name: 'Repo 2 Release',
        published_at: '2024-02-15T00:00:00Z',
        assets: []
      }

      render(
        <RepositoryList
          {...defaultProps}
          expandedRepo="organization/proj-repo-2"
          repoReleases={{
            'owner/test-repo-1': [repo1Release],
            'organization/proj-repo-2': [repo2Release]
          }}
        />
      )

      // Should only show releases for the expanded repository
      expect(screen.getByTestId('release-v2.0.0')).toBeInTheDocument()
      expect(screen.queryByTestId('release-v1.0.0')).not.toBeInTheDocument()

      // Should show the correct repository name
      expect(screen.getByTestId('release-repository')).toHaveAttribute('data-repository-name', 'organization/proj-repo-2')

      // Click on the release
      const releaseItem = screen.getByTestId('release-v2.0.0')
      await user.click(releaseItem)

      // Should call onSelectRelease with correct repository and release
      expect(mockOnSelectRelease).toHaveBeenCalledWith('organization/proj-repo-2', repo2Release)
    })

    test('handles empty releases list', () => {
      render(
        <RepositoryList
          {...defaultProps}
          expandedRepo="owner/test-repo-1"
          repoReleases={{
            'owner/test-repo-1': []
          }}
        />
      )

      // Should show empty releases message
      expect(screen.getByTestId('release-list')).toBeInTheDocument()
      expect(screen.getByTestId('no-releases')).toBeInTheDocument()
      expect(screen.getByText('No releases available')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    test('passes error and retry callback to ReleaseList', () => {
      const mockFetchReleasesForRepo = vi.fn()
      render(
        <RepositoryList
          {...defaultProps}
          expandedRepo="owner/test-repo-1"
          releaseErrors={{ 'owner/test-repo-1': 'Failed to fetch' }}
          fetchReleasesForRepo={mockFetchReleasesForRepo}
        />
      )

      // ReleaseList should receive the error
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument()
    })

    test('retry callback triggers fetchReleasesForRepo for correct repo', () => {
      const mockFetchReleasesForRepo = vi.fn()

      render(
        <RepositoryList
          {...defaultProps}
          expandedRepo="owner/test-repo-1"
          releaseErrors={{ 'owner/test-repo-1': 'API Error' }}
          fetchReleasesForRepo={mockFetchReleasesForRepo}
        />
      )

      const retryLink = screen.getByText('Retry')
      fireEvent.click(retryLink)

      expect(mockFetchReleasesForRepo).toHaveBeenCalledWith('owner/test-repo-1')
    })

    test('different repos can have different errors', () => {
      const mockFetchReleasesForRepo = vi.fn()

      render(
        <RepositoryList
          {...defaultProps}
          expandedRepo="owner/test-repo-1"
          releaseErrors={{
            'owner/test-repo-1': 'Error for repo 1',
            'organization/proj-repo-2': 'Error for repo 2'
          }}
          fetchReleasesForRepo={mockFetchReleasesForRepo}
        />
      )

      // Only the expanded repo's error should be visible
      expect(screen.getByText('Error for repo 1')).toBeInTheDocument()
      expect(screen.queryByText('Error for repo 2')).not.toBeInTheDocument()
    })
  })
})