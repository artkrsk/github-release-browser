import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssetList } from '@/components/AssetList'
import { createMockAsset, createMockFetchResponse, render } from '@test-utils'

// Mock format utility
vi.mock('@/utils/format', () => ({
  formatFileSize: vi.fn((size: number) => `${size} bytes`)
}))

describe('AssetList - DOM Testing', () => {
  const mockAssets = [
    createMockAsset({
      id: 1,
      name: 'file1.zip',
      content_type: 'application/zip',
      size: 1024
    }),
    createMockAsset({
      id: 2,
      name: 'file2.tar.gz',
      content_type: 'application/gzip',
      size: 2048
    }),
    createMockAsset({
      id: 3,
      name: 'document.pdf',
      content_type: 'application/pdf',
      size: 512
    })
  ]

  const defaultProps = {
    assets: mockAssets,
    repository: 'owner/repo',
    releaseTag: 'v1.0.0',
    isLatest: false,
    selectedAsset: null,
    onSelectAsset: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    test('renders asset list heading', () => {
      render(<AssetList {...defaultProps} />)

      expect(screen.getByText('Assets in owner/repo (v1.0.0)')).toBeInTheDocument()
    })

    test('renders asset list heading for latest release', () => {
      render(<AssetList {...defaultProps} isLatest={true} releaseTag="latest" />)

      expect(screen.getByText('Assets in owner/repo (latest)')).toBeInTheDocument()
    })

    test('renders all assets', () => {
      render(<AssetList {...defaultProps} />)

      expect(screen.getByText('file1.zip')).toBeInTheDocument()
      expect(screen.getByText('file2.tar.gz')).toBeInTheDocument()
      expect(screen.getByText('document.pdf')).toBeInTheDocument()
    })

    test('renders asset metadata', () => {
      render(<AssetList {...defaultProps} />)

      expect(screen.getByText('1024 bytes • application/zip')).toBeInTheDocument()
      expect(screen.getByText('2048 bytes • application/gzip')).toBeInTheDocument()
      expect(screen.getByText('512 bytes • application/pdf')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    test('shows empty message when no assets', () => {
      render(<AssetList {...defaultProps} assets={[]} />)

      expect(screen.getByText('No assets found in this release')).toBeInTheDocument()
    })

    test('shows custom empty message from strings', () => {
      const customStrings = {
        noAssetsInRelease: 'No files available'
      }
      render(<AssetList {...defaultProps} assets={[]} strings={customStrings} />)

      expect(screen.getByText('No files available')).toBeInTheDocument()
    })
  })

  describe('Custom Strings', () => {
    test('uses custom assets in string', () => {
      const customStrings = {
        assetsIn: 'Files in'
      }
      render(<AssetList {...defaultProps} strings={customStrings} />)

      expect(screen.getByText('Files in owner/repo (v1.0.0)')).toBeInTheDocument()
    })

    test('uses custom latest string', () => {
      const customStrings = {
        latest: 'most recent'
      }
      render(<AssetList {...defaultProps} isLatest={true} strings={customStrings} />)

      expect(screen.getByText('Assets in owner/repo (most recent)')).toBeInTheDocument()
    })
  })

  describe('Asset Selection', () => {
    test('selects asset when clicked', async () => {
      const mockOnSelectAsset = vi.fn()
      render(<AssetList {...defaultProps} onSelectAsset={mockOnSelectAsset} />)

      const assetCard = screen.getByText('file1.zip')
      await userEvent.click(assetCard)

      expect(mockOnSelectAsset).toHaveBeenCalledWith(mockAssets[0])
    })

    test('deselects asset when clicked again', async () => {
      const mockOnSelectAsset = vi.fn()
      render(<AssetList {...defaultProps} selectedAsset={mockAssets[0]} onSelectAsset={mockOnSelectAsset} />)

      const assetCard = screen.getByText('file1.zip')
      await userEvent.click(assetCard)

      expect(mockOnSelectAsset).toHaveBeenCalledWith(null)
    })

    test('shows checkmark for selected asset', () => {
      render(<AssetList {...defaultProps} selectedAsset={mockAssets[1]} />)

      // Check if the selected asset has a visual indicator
      const selectedAssetElement = screen.getByText('file2.tar.gz').closest('.wp-card')
      expect(selectedAssetElement).toHaveClass('github-release-browser-card_selected')
    })

    test('highlights selected asset', () => {
      render(<AssetList {...defaultProps} selectedAsset={mockAssets[2]} />)

      const selectedAssetElement = screen.getByText('document.pdf').closest('.wp-card')
      expect(selectedAssetElement).toHaveClass('github-release-browser-card_selected')
    })
  })

  describe('Multiple Assets', () => {
    test('handles large number of assets', () => {
      const manyAssets = Array.from({ length: 20 }, (_, i) =>
        createMockAsset({
          id: i + 1,
          name: `file${i + 1}.zip`
        })
      )

      render(<AssetList {...defaultProps} assets={manyAssets} />)

      expect(screen.getByText('file1.zip')).toBeInTheDocument()
      expect(screen.getByText('file20.zip')).toBeInTheDocument()
    })

    test('handles assets with same names but different IDs', () => {
      const assetsWithSameNames = [
        createMockAsset({ id: 1, name: 'duplicate.zip' }),
        createMockAsset({ id: 2, name: 'duplicate.zip' })
      ]

      render(<AssetList {...defaultProps} assets={assetsWithSameNames} />)

      const duplicateElements = screen.getAllByText('duplicate.zip')
      expect(duplicateElements).toHaveLength(2)
    })
  })

  describe('Different Asset Types', () => {
    test('renders different file extensions', () => {
      const differentAssets = [
        createMockAsset({ name: 'image.png', content_type: 'image/png' }),
        createMockAsset({ name: 'script.js', content_type: 'application/javascript' }),
        createMockAsset({ name: 'style.css', content_type: 'text/css' }),
        createMockAsset({ name: 'data.json', content_type: 'application/json' })
      ]

      render(<AssetList {...defaultProps} assets={differentAssets} />)

      expect(screen.getByText('image.png')).toBeInTheDocument()
      expect(screen.getByText('script.js')).toBeInTheDocument()
      expect(screen.getByText('style.css')).toBeInTheDocument()
      expect(screen.getByText('data.json')).toBeInTheDocument()
    })

    test('handles assets with special characters in names', () => {
      const specialAssets = [
        createMockAsset({ name: 'file (1).zip' }),
        createMockAsset({ name: 'file[2].tar.gz' }),
        createMockAsset({ name: 'file{3}.zip' }),
        createMockAsset({ name: 'file-with-dashes.zip' }),
        createMockAsset({ name: 'file_with_underscores.zip' })
      ]

      render(<AssetList {...defaultProps} assets={specialAssets} />)

      expect(screen.getByText('file (1).zip')).toBeInTheDocument()
      expect(screen.getByText('file[2].tar.gz')).toBeInTheDocument()
      expect(screen.getByText('file{3}.zip')).toBeInTheDocument()
      expect(screen.getByText('file-with-dashes.zip')).toBeInTheDocument()
      expect(screen.getByText('file_with_underscores.zip')).toBeInTheDocument()
    })
  })

  describe('Different Repository Names', () => {
    test('handles complex repository names', () => {
      const repositories = [
        'user/repo',
        'organization-name/repository-name',
        'complex_user-name/complex-repo-name-123'
      ]

      repositories.forEach(repo => {
        const { unmount } = render(<AssetList {...defaultProps} repository={repo} />)

        expect(screen.getByText(new RegExp(`Assets in ${repo}`))).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Different Release Tags', () => {
    test('handles various release tag formats', () => {
      const releaseTags = [
        'v1.0.0',
        'v2.1.0-beta',
        'release-2024',
        '1.0.0-alpha.1',
        'latest'
      ]

      releaseTags.forEach(tag => {
        const { unmount } = render(<AssetList {...defaultProps} releaseTag={tag} />)

        expect(screen.getByText(new RegExp(`Assets in owner/repo \\(${tag}\\)`))).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Event Handling', () => {
    test('calls onSelectAsset with correct asset data', async () => {
      const mockOnSelectAsset = vi.fn()
      render(<AssetList {...defaultProps} onSelectAsset={mockOnSelectAsset} />)

      const assetCard = screen.getByText('file2.tar.gz')
      await userEvent.click(assetCard)

      expect(mockOnSelectAsset).toHaveBeenCalledTimes(1)
      expect(mockOnSelectAsset).toHaveBeenCalledWith(expect.objectContaining({
        id: 2,
        name: 'file2.tar.gz',
        content_type: 'application/gzip',
        size: 2048
      }))
    })

    test('handles multiple asset selections', async () => {
      const mockOnSelectAsset = vi.fn()
      render(<AssetList {...defaultProps} onSelectAsset={mockOnSelectAsset} />)

      // Select first asset
      await userEvent.click(screen.getByText('file1.zip'))
      expect(mockOnSelectAsset).toHaveBeenCalledWith(mockAssets[0])

      // Select second asset
      await userEvent.click(screen.getByText('file2.tar.gz'))
      expect(mockOnSelectAsset).toHaveBeenCalledWith(mockAssets[1])

      // Select third asset
      await userEvent.click(screen.getByText('document.pdf'))
      expect(mockOnSelectAsset).toHaveBeenCalledWith(mockAssets[2])
    })
  })

  describe('Accessibility', () => {
    test('asset cards have button role', () => {
      render(<AssetList {...defaultProps} />)

      const assetCards = screen.getAllByRole('button')
      expect(assetCards.length).toBeGreaterThan(0)
    })

    test('asset cards are focusable', () => {
      render(<AssetList {...defaultProps} />)

      const assetCards = screen.getAllByRole('button')
      assetCards.forEach(card => {
        expect(card).toHaveAttribute('tabIndex', '0')
      })
    })
  })

  describe('Component Structure', () => {
    test('renders with correct CSS classes', () => {
      render(<AssetList {...defaultProps} />)

      const container = screen.getByText('Assets in owner/repo (v1.0.0)').closest('.github-release-browser-asset-list')
      expect(container).toBeInTheDocument()

      const assetCards = screen.getAllByRole('button')
      assetCards.forEach(card => {
        expect(card).toHaveClass('github-release-browser-asset-card')
      })
    })

    test('renders card bodies with correct structure', () => {
      render(<AssetList {...defaultProps} />)

      const cardBodies = document.querySelectorAll('.github-release-browser-card__body')
      expect(cardBodies.length).toBe(mockAssets.length)
    })

    test('renders asset info sections', () => {
      render(<AssetList {...defaultProps} />)

      const assetInfos = document.querySelectorAll('.github-release-browser-card__info')
      expect(assetInfos.length).toBe(mockAssets.length)

      assetInfos.forEach((info, index) => {
        expect(info.querySelector('.github-release-browser-card__title')).toHaveTextContent(mockAssets[index].name)
        expect(info.querySelector('.github-release-browser-card__meta')).toBeInTheDocument()
      })
    })
  })

  describe('Edge Cases', () => {
    test('handles asset with zero size', () => {
      const zeroSizeAsset = createMockAsset({ size: 0 })
      render(<AssetList {...defaultProps} assets={[zeroSizeAsset]} />)

      expect(screen.getByText('0 bytes • application/zip')).toBeInTheDocument()
    })

    test('handles asset with very large size', () => {
      const largeAsset = createMockAsset({ size: 1073741824 }) // 1GB
      render(<AssetList {...defaultProps} assets={[largeAsset]} />)

      expect(screen.getByText('1073741824 bytes • application/zip')).toBeInTheDocument()
    })

    test('handles asset with empty content type', () => {
      const assetWithoutType = createMockAsset({ content_type: '' })
      render(<AssetList {...defaultProps} assets={[assetWithoutType]} />)

      expect(screen.getByText((content, element) => {
        return content.includes('1024 bytes') && element.classList.contains('github-release-browser-card__meta')
      })).toBeInTheDocument()
    })

    test('handles asset with no name', () => {
      const assetWithoutName = createMockAsset({ name: '' })
      render(<AssetList {...defaultProps} assets={[assetWithoutName]} />)

      const assetCards = screen.getAllByRole('button')
      expect(assetCards).toHaveLength(1)
    })
  })
})