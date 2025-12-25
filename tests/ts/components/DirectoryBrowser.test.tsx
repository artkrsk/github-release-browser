import { describe, test, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DirectoryBrowser } from '@/components/DirectoryBrowser'
import { render } from '@test-utils'
import { IContentItem } from '@/interfaces'

describe('DirectoryBrowser', () => {
  const mockContents: IContentItem[] = [
    { name: 'src', path: 'src', type: 'dir', sha: '111', size: 0, download_url: null, html_url: 'https://...' },
    { name: 'dist', path: 'dist', type: 'dir', sha: '222', size: 0, download_url: null, html_url: 'https://...' },
    { name: 'README.md', path: 'README.md', type: 'file', sha: '333', size: 100, download_url: 'https://...', html_url: 'https://...' }
  ]

  const mockOnNavigate = vi.fn()
  const mockOnSelectFolder = vi.fn()

  const defaultProps = {
    contents: mockContents,
    currentPath: '',
    selectedFolderPath: null,
    onNavigate: mockOnNavigate,
    onSelectFolder: mockOnSelectFolder,
    repositoryName: 'owner/repo'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Breadcrumb Navigation', () => {
    test('renders breadcrumb with repository name at root', () => {
      render(<DirectoryBrowser {...defaultProps} />)

      expect(screen.getByText('owner/repo')).toBeInTheDocument()
    })

    test('renders breadcrumb with nested path segments', () => {
      render(<DirectoryBrowser {...defaultProps} currentPath="src/components" />)

      const breadcrumb = document.querySelector('.github-release-browser-directory__breadcrumb')
      expect(breadcrumb).toBeInTheDocument()
      expect(breadcrumb).toHaveTextContent('owner/repo')
      expect(breadcrumb).toHaveTextContent('src')
      expect(breadcrumb).toHaveTextContent('components')
    })

    test('clicking breadcrumb segment navigates to that path', async () => {
      const user = userEvent.setup()
      render(<DirectoryBrowser {...defaultProps} currentPath="level1/level2/level3" />)

      const breadcrumbButtons = document.querySelectorAll('.github-release-browser-directory__breadcrumb-item')
      await user.click(breadcrumbButtons[1]) // Click "level1"

      expect(mockOnNavigate).toHaveBeenCalledWith('level1')
    })

    test('clicking root navigates to empty path', async () => {
      const user = userEvent.setup()
      render(<DirectoryBrowser {...defaultProps} currentPath="src/components" />)

      const rootButton = screen.getByText('owner/repo')
      await user.click(rootButton)

      expect(mockOnNavigate).toHaveBeenCalledWith('')
    })

    test('handles deep nested paths correctly', () => {
      render(<DirectoryBrowser {...defaultProps} currentPath="level1/level2/level3/level4" />)

      const breadcrumb = document.querySelector('.github-release-browser-directory__breadcrumb')
      expect(breadcrumb).toHaveTextContent('level1')
      expect(breadcrumb).toHaveTextContent('level2')
      expect(breadcrumb).toHaveTextContent('level3')
      expect(breadcrumb).toHaveTextContent('level4')
    })

    test('renders breadcrumb separators', () => {
      render(<DirectoryBrowser {...defaultProps} currentPath="src/components" />)

      const separators = document.querySelectorAll('.github-release-browser-directory__breadcrumb-separator')
      expect(separators.length).toBeGreaterThan(0)
    })
  })

  describe('Folder Rendering', () => {
    test('renders folder items with icons', () => {
      render(<DirectoryBrowser {...defaultProps} />)

      expect(screen.getByText('src')).toBeInTheDocument()
      expect(screen.getByText('dist')).toBeInTheDocument()

      const folderIcons = document.querySelectorAll('.dashicons-portfolio')
      expect(folderIcons.length).toBeGreaterThan(0)
    })

    test('renders "Use current folder" option', () => {
      render(<DirectoryBrowser {...defaultProps} />)

      expect(screen.getByText('Use current folder')).toBeInTheDocument()
    })

    test('does not render file items', () => {
      render(<DirectoryBrowser {...defaultProps} />)

      // README.md is a file, should not be rendered
      expect(screen.queryByText('README.md')).not.toBeInTheDocument()
    })

    test('shows empty message when no folders', () => {
      const fileOnlyContents: IContentItem[] = [
        { name: 'file.txt', path: 'file.txt', type: 'file', sha: '444', size: 50, download_url: 'https://...', html_url: 'https://...' }
      ]

      render(<DirectoryBrowser {...defaultProps} contents={fileOnlyContents} />)

      expect(screen.getByText('No folders in this directory')).toBeInTheDocument()
    })

    test('handles mixed content correctly', () => {
      render(<DirectoryBrowser {...defaultProps} />)

      // Should show folders
      expect(screen.getByText('src')).toBeInTheDocument()
      expect(screen.getByText('dist')).toBeInTheDocument()

      // Should NOT show files
      expect(screen.queryByText('README.md')).not.toBeInTheDocument()
    })
  })

  describe('Selection', () => {
    test('radio button selects folder', async () => {
      const user = userEvent.setup()
      render(<DirectoryBrowser {...defaultProps} />)

      const radios = screen.getAllByRole('radio')
      await user.click(radios[1]) // First folder (after "Use current folder")

      expect(mockOnSelectFolder).toHaveBeenCalledWith('src')
    })

    test('selected folder highlights correctly', () => {
      render(<DirectoryBrowser {...defaultProps} selectedFolderPath="src" />)

      const selectedCards = document.querySelectorAll('.github-release-browser-directory__item_selected')
      expect(selectedCards.length).toBeGreaterThan(0)
    })

    test('can select root folder option', async () => {
      const user = userEvent.setup()
      render(<DirectoryBrowser {...defaultProps} currentPath="src" />)

      const radios = screen.getAllByRole('radio')
      await user.click(radios[0]) // "Use current folder"

      expect(mockOnSelectFolder).toHaveBeenCalledWith('src')
    })

    test('changes selection when clicking different folder radio', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<DirectoryBrowser {...defaultProps} selectedFolderPath="src" />)

      const radios = screen.getAllByRole('radio')
      await user.click(radios[2]) // Second folder

      expect(mockOnSelectFolder).toHaveBeenCalledWith('dist')
    })
  })

  describe('Navigation', () => {
    test('clicking folder name navigates into it', async () => {
      const user = userEvent.setup()
      render(<DirectoryBrowser {...defaultProps} />)

      const folderButton = screen.getByText('src')
      await user.click(folderButton)

      expect(mockOnNavigate).toHaveBeenCalledWith('src')
    })

    test('radio and folder name have separate click handlers', async () => {
      const user = userEvent.setup()
      render(<DirectoryBrowser {...defaultProps} />)

      // Click folder name - should navigate
      const folderButton = screen.getByText('src')
      await user.click(folderButton)
      expect(mockOnNavigate).toHaveBeenCalledWith('src')

      vi.clearAllMocks()

      // Click radio - should select
      const radios = screen.getAllByRole('radio')
      await user.click(radios[1])
      expect(mockOnSelectFolder).toHaveBeenCalledWith('src')
      expect(mockOnNavigate).not.toHaveBeenCalled()
    })
  })

  describe('Loading States', () => {
    test('shows spinner when loading', () => {
      render(<DirectoryBrowser {...defaultProps} loading={true} />)

      expect(screen.getByTestId('spinner')).toBeInTheDocument()
    })

    test('hides content when loading', () => {
      render(<DirectoryBrowser {...defaultProps} loading={true} />)

      expect(screen.queryByText('src')).not.toBeInTheDocument()
      expect(screen.queryByText('Use current folder')).not.toBeInTheDocument()
    })

    test('shows content when not loading', () => {
      render(<DirectoryBrowser {...defaultProps} loading={false} />)

      expect(screen.getByText('src')).toBeInTheDocument()
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    test('handles empty contents array', () => {
      render(<DirectoryBrowser {...defaultProps} contents={[]} loading={false} />)

      expect(screen.getByText('No folders in this directory')).toBeInTheDocument()
    })

    test('handles very long folder names', () => {
      const longNameContents: IContentItem[] = [
        { name: 'this-is-a-very-long-folder-name-that-might-cause-layout-issues-in-the-ui', path: 'long', type: 'dir', sha: '555', size: 0, download_url: null, html_url: 'https://...' }
      ]

      render(<DirectoryBrowser {...defaultProps} contents={longNameContents} />)

      expect(screen.getByText('this-is-a-very-long-folder-name-that-might-cause-layout-issues-in-the-ui')).toBeInTheDocument()
    })

    test('handles folder names with special characters', () => {
      const specialCharsContents: IContentItem[] = [
        { name: '__tests__', path: '__tests__', type: 'dir', sha: '666', size: 0, download_url: null, html_url: 'https://...' },
        { name: '.github', path: '.github', type: 'dir', sha: '777', size: 0, download_url: null, html_url: 'https://...' }
      ]

      render(<DirectoryBrowser {...defaultProps} contents={specialCharsContents} />)

      expect(screen.getByText('__tests__')).toBeInTheDocument()
      expect(screen.getByText('.github')).toBeInTheDocument()
    })

    test('handles currentPath with trailing slash', () => {
      render(<DirectoryBrowser {...defaultProps} currentPath="src/" />)

      const breadcrumb = document.querySelector('.github-release-browser-directory__breadcrumb')
      expect(breadcrumb).toBeInTheDocument()
    })
  })
})
