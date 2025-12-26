import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DirectoryView } from '@/components/DirectoryView'
import { render } from '@test-utils'
import { IBranch, IContentItem } from '@/interfaces'

// Import centralized WordPress component mocks
import { mockWordPressComponents } from '../../mocks/wordpress-components'
vi.mock('@wordpress/components', () => mockWordPressComponents)

// Mock BranchSelector component
vi.mock('@/components/BranchSelector', () => ({
  BranchSelector: ({ branches, selectedBranch, onSelectBranch, loading, defaultBranch }: any) => (
    <div data-testid="branch-selector">
      <div data-testid="branches-count">{branches?.length || 0}</div>
      <div data-testid="selected-branch">{selectedBranch || 'none'}</div>
      <div data-testid="branch-loading">{loading ? 'true' : 'false'}</div>
      <div data-testid="default-branch">{defaultBranch || 'none'}</div>
      <select
        data-testid="branch-select"
        value={selectedBranch || ''}
        onChange={(e) => onSelectBranch(e.target.value)}
      >
        {branches?.map((branch: IBranch) => (
          <option key={branch.name} value={branch.name}>{branch.name}</option>
        ))}
      </select>
    </div>
  )
}))

// Mock DirectoryBrowser component
vi.mock('@/components/DirectoryBrowser', () => ({
  DirectoryBrowser: ({
    contents,
    currentPath,
    selectedFolderPath,
    onNavigate,
    onSelectFolder,
    loading,
    repositoryName
  }: any) => (
    <div data-testid="directory-browser">
      <div data-testid="contents-count">{contents?.length || 0}</div>
      <div data-testid="current-path">{currentPath || 'root'}</div>
      <div data-testid="selected-folder">{selectedFolderPath || 'none'}</div>
      <div data-testid="dir-loading">{loading ? 'true' : 'false'}</div>
      <div data-testid="repository-name">{repositoryName || 'none'}</div>
      <button
        data-testid="navigate-folder"
        onClick={() => onNavigate('some/folder/path')}
      >
        Navigate
      </button>
      <button
        data-testid="select-folder"
        onClick={() => onSelectFolder('selected/folder/path')}
      >
        Select Folder
      </button>
    </div>
  )
}))

// Helper to create mock branch data
const createMockBranch = (overrides: Partial<IBranch> = {}): IBranch => ({
  name: 'main',
  commit: {
    sha: 'abc123',
    url: 'https://api.github.com/repos/owner/repo/commits/abc123'
  },
  protected: false,
  ...overrides
})

// Helper to create mock content item
const createMockContentItem = (overrides: Partial<IContentItem> = {}): IContentItem => ({
  name: 'folder',
  path: 'folder',
  sha: 'def456',
  size: 0,
  type: 'dir',
  download_url: null,
  html_url: 'https://github.com/owner/repo/tree/main/folder',
  ...overrides
})

describe('DirectoryView', () => {
  const mockOnSelectBranch = vi.fn()
  const mockOnNavigate = vi.fn()
  const mockOnSelectFolder = vi.fn()
  const mockOnBack = vi.fn()
  const mockOnRefresh = vi.fn()

  const mockBranches = [
    createMockBranch({ name: 'main' }),
    createMockBranch({ name: 'develop' }),
    createMockBranch({ name: 'feature/test' })
  ]

  const mockContents = [
    createMockContentItem({ name: 'src', path: 'src' }),
    createMockContentItem({ name: 'docs', path: 'docs' }),
    createMockContentItem({ name: 'tests', path: 'tests' })
  ]

  const defaultProps = {
    selectedRepo: 'owner/test-repo',
    branches: mockBranches,
    selectedBranch: 'main',
    currentPath: '',
    selectedFolderPath: null,
    directoryContents: mockContents,
    loadingBranches: false,
    loadingContents: false,
    onSelectBranch: mockOnSelectBranch,
    onNavigate: mockOnNavigate,
    onSelectFolder: mockOnSelectFolder,
    onBack: mockOnBack
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Layout and Rendering', () => {
    test('renders header with back button', () => {
      render(<DirectoryView {...defaultProps} />)

      const backButton = screen.getByTestId('button-tertiary')
      expect(backButton).toBeInTheDocument()
      expect(backButton).toHaveClass('github-release-browser-browser__back-button')
    })

    test('renders header with repository name', () => {
      render(<DirectoryView {...defaultProps} />)

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveTextContent('owner/test-repo')
    })

    test('renders BranchSelector component', () => {
      render(<DirectoryView {...defaultProps} />)

      expect(screen.getByTestId('branch-selector')).toBeInTheDocument()
    })

    test('renders DirectoryBrowser component', () => {
      render(<DirectoryView {...defaultProps} />)

      expect(screen.getByTestId('directory-browser')).toBeInTheDocument()
    })

    test('renders refresh button when onRefresh provided', () => {
      render(<DirectoryView {...defaultProps} onRefresh={mockOnRefresh} />)

      const buttons = screen.getAllByTestId('button-tertiary')
      expect(buttons).toHaveLength(2) // Back + Refresh
      const refreshButton = buttons[1]
      expect(refreshButton).toHaveClass('github-release-browser-browser__refresh-button')
    })

    test('does not render refresh button when onRefresh not provided', () => {
      render(<DirectoryView {...defaultProps} />)

      const buttons = screen.getAllByTestId('button-tertiary')
      expect(buttons).toHaveLength(1) // Only back button
    })

    test('applies correct container class', () => {
      render(<DirectoryView {...defaultProps} />)

      const container = document.querySelector('.github-release-browser-directory-view')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Interaction Tests', () => {
    test('back button calls onBack handler', async () => {
      const user = userEvent.setup()
      render(<DirectoryView {...defaultProps} />)

      const backButton = screen.getByTestId('button-tertiary')
      await user.click(backButton)

      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })

    test('refresh button calls onRefresh handler', async () => {
      const user = userEvent.setup()
      render(<DirectoryView {...defaultProps} onRefresh={mockOnRefresh} />)

      const buttons = screen.getAllByTestId('button-tertiary')
      const refreshButton = buttons[1]
      await user.click(refreshButton)

      expect(mockOnRefresh).toHaveBeenCalledTimes(1)
    })

    test('branch selection calls onSelectBranch', async () => {
      const user = userEvent.setup()
      render(<DirectoryView {...defaultProps} />)

      const branchSelect = screen.getByTestId('branch-select')
      await user.selectOptions(branchSelect, 'develop')

      expect(mockOnSelectBranch).toHaveBeenCalledWith('develop')
    })

    test('folder navigation calls onNavigate', async () => {
      const user = userEvent.setup()
      render(<DirectoryView {...defaultProps} />)

      const navigateButton = screen.getByTestId('navigate-folder')
      await user.click(navigateButton)

      expect(mockOnNavigate).toHaveBeenCalledWith('some/folder/path')
    })

    test('folder selection calls onSelectFolder', async () => {
      const user = userEvent.setup()
      render(<DirectoryView {...defaultProps} />)

      const selectButton = screen.getByTestId('select-folder')
      await user.click(selectButton)

      expect(mockOnSelectFolder).toHaveBeenCalledWith('selected/folder/path')
    })
  })

  describe('Props Passing', () => {
    test('passes all props to BranchSelector correctly', () => {
      render(
        <DirectoryView
          {...defaultProps}
          branches={mockBranches}
          selectedBranch="develop"
          loadingBranches={true}
          defaultBranch="main"
        />
      )

      expect(screen.getByTestId('branches-count')).toHaveTextContent('3')
      expect(screen.getByTestId('selected-branch')).toHaveTextContent('develop')
      expect(screen.getByTestId('branch-loading')).toHaveTextContent('true')
      expect(screen.getByTestId('default-branch')).toHaveTextContent('main')
    })

    test('passes all props to DirectoryBrowser correctly', () => {
      render(
        <DirectoryView
          {...defaultProps}
          directoryContents={mockContents}
          currentPath="src/components"
          selectedFolderPath="src/components/Button"
          loadingContents={true}
          selectedRepo="owner/test-repo"
        />
      )

      expect(screen.getByTestId('contents-count')).toHaveTextContent('3')
      expect(screen.getByTestId('current-path')).toHaveTextContent('src/components')
      expect(screen.getByTestId('selected-folder')).toHaveTextContent('src/components/Button')
      expect(screen.getByTestId('dir-loading')).toHaveTextContent('true')
      expect(screen.getByTestId('repository-name')).toHaveTextContent('owner/test-repo')
    })

    test('handles optional defaultBranch prop', () => {
      // Without defaultBranch
      const { rerender } = render(<DirectoryView {...defaultProps} />)
      expect(screen.getByTestId('default-branch')).toHaveTextContent('none')

      // With defaultBranch
      rerender(<DirectoryView {...defaultProps} defaultBranch="main" />)
      expect(screen.getByTestId('default-branch')).toHaveTextContent('main')
    })
  })

  describe('CSS Classes and Structure', () => {
    test('header has correct structure with controls', () => {
      render(<DirectoryView {...defaultProps} />)

      const header = document.querySelector('.github-release-browser-browser__header')
      expect(header).toBeInTheDocument()

      const controls = document.querySelector('.github-release-browser-browser__controls')
      expect(controls).toBeInTheDocument()
    })

    test('back button has correct CSS classes', () => {
      render(<DirectoryView {...defaultProps} />)

      const backButton = screen.getByTestId('button-tertiary')
      expect(backButton).toHaveClass('github-release-browser-browser__back-button')
      expect(backButton).toHaveClass('wp-button')
      expect(backButton).toHaveClass('wp-button-tertiary')
    })

    test('refresh button has correct CSS classes when rendered', () => {
      render(<DirectoryView {...defaultProps} onRefresh={mockOnRefresh} />)

      const buttons = screen.getAllByTestId('button-tertiary')
      const refreshButton = buttons[1]
      expect(refreshButton).toHaveClass('github-release-browser-browser__refresh-button')
      expect(refreshButton).toHaveClass('wp-button')
      expect(refreshButton).toHaveClass('wp-button-tertiary')
    })
  })

  describe('Edge Cases', () => {
    test('handles null selectedRepo gracefully', () => {
      render(<DirectoryView {...defaultProps} selectedRepo={null} />)

      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toBeInTheDocument()
      // null selectedRepo renders as empty
      expect(heading.textContent).toBe('')
    })

    test('handles empty branches array', () => {
      render(<DirectoryView {...defaultProps} branches={[]} />)

      expect(screen.getByTestId('branches-count')).toHaveTextContent('0')
    })

    test('handles empty directory contents', () => {
      render(<DirectoryView {...defaultProps} directoryContents={[]} />)

      expect(screen.getByTestId('contents-count')).toHaveTextContent('0')
    })

    test('handles null selectedBranch', () => {
      render(<DirectoryView {...defaultProps} selectedBranch={null} />)

      expect(screen.getByTestId('selected-branch')).toHaveTextContent('none')
    })

    test('handles null selectedFolderPath', () => {
      render(<DirectoryView {...defaultProps} selectedFolderPath={null} />)

      expect(screen.getByTestId('selected-folder')).toHaveTextContent('none')
    })
  })

  describe('Loading States', () => {
    test('passes loadingBranches to BranchSelector', () => {
      const { rerender } = render(<DirectoryView {...defaultProps} loadingBranches={false} />)
      expect(screen.getByTestId('branch-loading')).toHaveTextContent('false')

      rerender(<DirectoryView {...defaultProps} loadingBranches={true} />)
      expect(screen.getByTestId('branch-loading')).toHaveTextContent('true')
    })

    test('passes loadingContents to DirectoryBrowser', () => {
      const { rerender } = render(<DirectoryView {...defaultProps} loadingContents={false} />)
      expect(screen.getByTestId('dir-loading')).toHaveTextContent('false')

      rerender(<DirectoryView {...defaultProps} loadingContents={true} />)
      expect(screen.getByTestId('dir-loading')).toHaveTextContent('true')
    })
  })

  describe('Component Re-rendering', () => {
    test('updates when selectedBranch changes', () => {
      const { rerender } = render(<DirectoryView {...defaultProps} selectedBranch="main" />)
      expect(screen.getByTestId('selected-branch')).toHaveTextContent('main')

      rerender(<DirectoryView {...defaultProps} selectedBranch="develop" />)
      expect(screen.getByTestId('selected-branch')).toHaveTextContent('develop')
    })

    test('updates when currentPath changes', () => {
      const { rerender } = render(<DirectoryView {...defaultProps} currentPath="" />)
      expect(screen.getByTestId('current-path')).toHaveTextContent('root')

      rerender(<DirectoryView {...defaultProps} currentPath="src/components" />)
      expect(screen.getByTestId('current-path')).toHaveTextContent('src/components')
    })

    test('updates when selectedRepo changes', () => {
      const { rerender } = render(<DirectoryView {...defaultProps} selectedRepo="owner/repo-a" />)
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('owner/repo-a')

      rerender(<DirectoryView {...defaultProps} selectedRepo="owner/repo-b" />)
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('owner/repo-b')
    })
  })

  describe('Repository Name Handling', () => {
    test('handles complex repository names', () => {
      const complexRepoNames = [
        'owner/simple-repo',
        'my-org/project-name',
        'username/my-repo-with-dashes',
        'org-name/repo_with_underscores',
        'very-long-organization-name/very-long-repository-name'
      ]

      complexRepoNames.forEach(repoName => {
        const { unmount } = render(
          <DirectoryView {...defaultProps} selectedRepo={repoName} />
        )

        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(repoName)
        expect(screen.getByTestId('repository-name')).toHaveTextContent(repoName)
        unmount()
      })
    })
  })
})
