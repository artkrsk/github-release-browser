import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssetsView } from '@/components/AssetsView'
import { createMockAsset, createMockRelease, createMockBrowserConfig, render } from '@test-utils'

// Mock WordPress components
vi.mock('@wordpress/components', () => ({
  Button: ({ children, onClick, variant, className, ...props }: any) => (
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

// Mock AssetList to focus on AssetsView testing
vi.mock('@/components/AssetList', () => ({
  AssetList: ({ assets, repository, releaseTag, isLatest, selectedAsset, onSelectAsset, strings }: any) => (
    <div data-testid="asset-list">
      <div data-testid="assets-count">{assets?.length || 0}</div>
      <div data-testid="repository">{repository}</div>
      <div data-testid="release-tag">{releaseTag}</div>
      <div data-testid="is-latest">{isLatest.toString()}</div>
      <div data-testid="selected-asset">{selectedAsset?.name || 'none'}</div>
      <button onClick={() => onSelectAsset(assets?.[0] || null)} data-testid="select-asset">
        Select Asset
      </button>
    </div>
  )
}))

describe('AssetsView', () => {
  const mockOnSelectAsset = vi.fn()
  const mockOnBack = vi.fn()

  const mockConfig = createMockBrowserConfig()
  const mockRepo = 'owner/test-repo'
  const mockAsset = createMockAsset({ id: 1, name: 'test-file.zip' })
  const mockRelease = createMockRelease({
    id: 1,
    tag_name: 'v1.0.0',
    assets: [mockAsset]
  })

  const defaultProps = {
    selectedRepo: mockRepo,
    selectedRelease: mockRelease,
    selectedAsset: null,
    repoReleases: { [mockRepo]: [mockRelease] },
    onSelectAsset: mockOnSelectAsset,
    onBack: mockOnBack,
    config: mockConfig
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Props and Rendering', () => {
    test('renders with all required props', () => {
      render(<AssetsView {...defaultProps} />)

      expect(screen.getByTestId('asset-list')).toBeInTheDocument()
      expect(screen.getByTestId('button-tertiary')).toBeInTheDocument()
    })

    test('renders back button with correct variant and class', () => {
      render(<AssetsView {...defaultProps} />)

      const backButton = screen.getByTestId('button-tertiary')
      expect(backButton).toBeInTheDocument()
      expect(backButton).toHaveClass('github-release-browser-browser__back-button')
    })

    test('renders default back button text when no custom string', () => {
      const configWithoutBackString = createMockBrowserConfig({ strings: {} })
      render(
        <AssetsView
          {...defaultProps}
          config={configWithoutBackString}
        />
      )

      expect(screen.getByText('Back to repositories')).toBeInTheDocument()
    })

    test('renders custom back button text from config', () => {
      const configWithCustomBack = createMockBrowserConfig({
        strings: { back: 'Custom Back Text' }
      })
      render(
        <AssetsView
          {...defaultProps}
          config={configWithCustomBack}
        />
      )

      expect(screen.getByText('Custom Back Text')).toBeInTheDocument()
    })

    test('renders back icon', () => {
      render(<AssetsView {...defaultProps} />)

      const backIcon = document.querySelector('.github-release-browser-icon_back')
      expect(backIcon).toBeInTheDocument()
    })
  })

  describe('Release Type Handling', () => {
    test('handles specific release correctly', () => {
      render(<AssetsView {...defaultProps} />)

      expect(screen.getByTestId('assets-count')).toHaveTextContent('1')
      expect(screen.getByTestId('repository')).toHaveTextContent(mockRepo)
      expect(screen.getByTestId('release-tag')).toHaveTextContent('v1.0.0')
      expect(screen.getByTestId('is-latest')).toHaveTextContent('false')
    })

    test('handles latest release correctly', () => {
      render(
        <AssetsView
          {...defaultProps}
          selectedRelease="latest"
        />
      )

      expect(screen.getByTestId('assets-count')).toHaveTextContent('1')
      expect(screen.getByTestId('repository')).toHaveTextContent(mockRepo)
      expect(screen.getByTestId('release-tag')).toHaveTextContent('latest')
      expect(screen.getByTestId('is-latest')).toHaveTextContent('true')
    })

    test('handles latest release with multiple releases', () => {
      const mockReleases = [
        createMockRelease({ id: 2, tag_name: 'v2.0.0', assets: [createMockAsset({ id: 2 })] }),
        createMockRelease({ id: 1, tag_name: 'v1.0.0', assets: [mockAsset] })
      ]

      render(
        <AssetsView
          {...defaultProps}
          selectedRelease="latest"
          repoReleases={{ [mockRepo]: mockReleases }}
        />
      )

      // Should use first release (latest) when selectedRelease is "latest"
      expect(screen.getByTestId('assets-count')).toHaveTextContent('1')
    })

    test('handles latest release with no releases gracefully', () => {
      render(
        <AssetsView
          {...defaultProps}
          selectedRelease="latest"
          repoReleases={{ [mockRepo]: [] }}
        />
      )

      expect(screen.getByTestId('assets-count')).toHaveTextContent('0')
    })

    test('handles latest release with repo not found in repoReleases', () => {
      render(
        <AssetsView
          {...defaultProps}
          selectedRelease="latest"
          selectedRepo="nonexistent/repo"
          repoReleases={{ [mockRepo]: [mockRelease] }}
        />
      )

      expect(screen.getByTestId('assets-count')).toHaveTextContent('0')
    })
  })

  describe('Asset Handling', () => {
    test('passes correct assets for specific release', () => {
      const releaseWithMultipleAssets = createMockRelease({
        id: 1,
        assets: [
          createMockAsset({ id: 1, name: 'file1.zip' }),
          createMockAsset({ id: 2, name: 'file2.zip' }),
          createMockAsset({ id: 3, name: 'file3.zip' })
        ]
      })

      render(
        <AssetsView
          {...defaultProps}
          selectedRelease={releaseWithMultipleAssets}
        />
      )

      expect(screen.getByTestId('assets-count')).toHaveTextContent('3')
    })

    test('passes correct assets for latest release', () => {
      const latestRelease = createMockRelease({
        id: 2,
        assets: [
          createMockAsset({ id: 4, name: 'latest-file.zip' }),
          createMockAsset({ id: 5, name: 'another-latest-file.zip' })
        ]
      })

      render(
        <AssetsView
          {...defaultProps}
          selectedRelease="latest"
          repoReleases={{ [mockRepo]: [latestRelease] }}
        />
      )

      expect(screen.getByTestId('assets-count')).toHaveTextContent('2')
    })

    test('passes empty assets array when release has no assets', () => {
      const releaseWithoutAssets = createMockRelease({ id: 1, assets: [] })

      render(
        <AssetsView
          {...defaultProps}
          selectedRelease={releaseWithoutAssets}
        />
      )

      expect(screen.getByTestId('assets-count')).toHaveTextContent('0')
    })

    test('passes selected asset correctly', () => {
      const selectedAsset = createMockAsset({ id: 1, name: 'selected-file.zip' })

      render(
        <AssetsView
          {...defaultProps}
          selectedAsset={selectedAsset}
        />
      )

      expect(screen.getByTestId('selected-asset')).toHaveTextContent('selected-file.zip')
    })

    test('passes null selected asset correctly', () => {
      render(<AssetsView {...defaultProps} />)

      expect(screen.getByTestId('selected-asset')).toHaveTextContent('none')
    })
  })

  describe('Button Interactions', () => {
    test('calls onBack when back button is clicked', async () => {
      const user = userEvent.setup()
      render(<AssetsView {...defaultProps} />)

      const backButton = screen.getByTestId('button-tertiary')
      await user.click(backButton)

      expect(mockOnBack).toHaveBeenCalledTimes(1)
    })

    test('passes onSelectAsset to AssetList correctly', async () => {
      const user = userEvent.setup()
      render(<AssetsView {...defaultProps} />)

      const selectAssetButton = screen.getByTestId('select-asset')
      await user.click(selectAssetButton)

      expect(mockOnSelectAsset).toHaveBeenCalledWith(mockAsset)
    })
  })

  describe('Config Integration', () => {
    test('passes config strings to AssetList', () => {
      const customStrings = {
        assets: 'Custom Assets',
        selectAsset: 'Custom Select Text'
      }
      const customConfig = createMockBrowserConfig({ strings: customStrings })

      render(
        <AssetsView
          {...defaultProps}
          config={customConfig}
        />
      )

      // AssetList should receive the strings prop
      expect(screen.getByTestId('asset-list')).toBeInTheDocument()
    })

    test('handles config with missing strings gracefully', () => {
      const configWithoutStrings = createMockBrowserConfig({ strings: null })

      render(
        <AssetsView
          {...defaultProps}
          config={configWithoutStrings}
        />
      )

      expect(screen.getByTestId('asset-list')).toBeInTheDocument()
      expect(screen.getByText('Back to repositories')).toBeInTheDocument()
    })

    test('handles config with empty strings object', () => {
      const configWithEmptyStrings = createMockBrowserConfig({ strings: {} })

      render(
        <AssetsView
          {...defaultProps}
          config={configWithEmptyStrings}
        />
      )

      expect(screen.getByText('Back to repositories')).toBeInTheDocument()
    })
  })

  describe('CSS Classes and Structure', () => {
    test('applies correct main container class', () => {
      render(<AssetsView {...defaultProps} />)

      const mainContainer = document.querySelector('.github-release-browser-browser__main')
      expect(mainContainer).toBeInTheDocument()
    })

    test('back button has correct CSS classes', () => {
      render(<AssetsView {...defaultProps} />)

      const backButton = screen.getByTestId('button-tertiary')
      expect(backButton).toHaveClass('github-release-browser-browser__back-button')
      expect(backButton).toHaveClass('wp-button')
      expect(backButton).toHaveClass('wp-button-tertiary')
    })
  })

  describe('Edge Cases', () => {
    test('handles empty repoReleases object when selectedRelease is latest', () => {
      render(
        <AssetsView
          {...defaultProps}
          selectedRelease="latest"
          repoReleases={{}}
        />
      )

      expect(screen.getByTestId('assets-count')).toHaveTextContent('0')
    })

    test('handles release with undefined assets', () => {
      const releaseWithUndefinedAssets = {
        ...mockRelease,
        assets: undefined
      }

      render(
        <AssetsView
          {...defaultProps}
          selectedRelease={releaseWithUndefinedAssets}
        />
      )

      expect(screen.getByTestId('assets-count')).toHaveTextContent('0')
    })
  })

  describe('Data Flow', () => {
    test('correctly determines assets for latest release vs specific release', () => {
      const specificRelease = createMockRelease({
        id: 1,
        tag_name: 'v1.0.0',
        assets: [createMockAsset({ id: 1, name: 'specific-asset.zip' })]
      })

      const latestRelease = createMockRelease({
        id: 2,
        tag_name: 'v2.0.0',
        assets: [createMockAsset({ id: 2, name: 'latest-asset.zip' })]
      })

      const { rerender } = render(
        <AssetsView
          {...defaultProps}
          selectedRelease={specificRelease}
          repoReleases={{ [mockRepo]: [latestRelease, specificRelease] }}
        />
      )

      // Specific release should show specific release assets
      expect(screen.getByTestId('assets-count')).toHaveTextContent('1')

      // Change to latest release
      rerender(
        <AssetsView
          {...defaultProps}
          selectedRelease="latest"
          repoReleases={{ [mockRepo]: [latestRelease, specificRelease] }}
        />
      )

      // Latest release should show latest release assets (first in array)
      expect(screen.getByTestId('assets-count')).toHaveTextContent('1')
    })

    test('handles release with null assets gracefully', () => {
      const releaseWithNullAssets = {
        ...mockRelease,
        assets: null
      }

      render(
        <AssetsView
          {...defaultProps}
          selectedRelease={releaseWithNullAssets}
        />
      )

      expect(screen.getByTestId('assets-count')).toHaveTextContent('0')
    })
  })

  describe('Component Re-rendering', () => {
    test('updates when selectedAsset changes', () => {
      const { rerender } = render(<AssetsView {...defaultProps} />)

      expect(screen.getByTestId('selected-asset')).toHaveTextContent('none')

      const newAsset = createMockAsset({ id: 2, name: 'new-selected-file.zip' })
      rerender(
        <AssetsView
          {...defaultProps}
          selectedAsset={newAsset}
        />
      )

      expect(screen.getByTestId('selected-asset')).toHaveTextContent('new-selected-file.zip')
    })

    test('updates when selectedRelease changes', () => {
      const { rerender } = render(<AssetsView {...defaultProps} />)

      expect(screen.getByTestId('release-tag')).toHaveTextContent('v1.0.0')
      expect(screen.getByTestId('is-latest')).toHaveTextContent('false')

      rerender(
        <AssetsView
          {...defaultProps}
          selectedRelease="latest"
        />
      )

      expect(screen.getByTestId('release-tag')).toHaveTextContent('latest')
      expect(screen.getByTestId('is-latest')).toHaveTextContent('true')
    })

    test('updates when config changes', () => {
      const { rerender } = render(<AssetsView {...defaultProps} />)

      expect(screen.getByText('Back to repositories')).toBeInTheDocument()

      const newConfig = createMockBrowserConfig({
        strings: { back: 'Updated Back Text' }
      })
      rerender(
        <AssetsView
          {...defaultProps}
          config={newConfig}
        />
      )

      expect(screen.getByText('Updated Back Text')).toBeInTheDocument()
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
          <AssetsView
            {...defaultProps}
            selectedRepo={repoName}
          />
        )

        expect(screen.getByTestId('repository')).toHaveTextContent(repoName)
        unmount()
      })
    })

    test('handles repository names with special characters', () => {
      const repoWithSpecialChars = 'owner/repo.with.special-chars_123'

      render(
        <AssetsView
          {...defaultProps}
          selectedRepo={repoWithSpecialChars}
        />
      )

      expect(screen.getByTestId('repository')).toHaveTextContent(repoWithSpecialChars)
    })
  })
})