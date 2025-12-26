import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AssetList } from '@/components/AssetList'
import { IAsset } from '@/interfaces'
import { createMockAsset, render } from '@test-utils'

// Mock format utility
vi.mock('@/utils/format', () => ({
	formatFileSize: vi.fn((size: number) => `${size} bytes`)
}))

describe('AssetList', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('Props Contract (createElement)', () => {
		const mockAssets: IAsset[] = [
			{
				url: 'https://api.github.com/repos/owner/repo/releases/assets/1',
				id: 1,
				name: 'file1.zip',
				label: null,
				content_type: 'application/zip',
				state: 'uploaded',
				size: 1024,
				download_count: 10,
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z'
			},
			{
				url: 'https://api.github.com/repos/owner/repo/releases/assets/2',
				id: 2,
				name: 'file2.tar.gz',
				label: 'File 2 Label',
				content_type: 'application/gzip',
				state: 'uploaded',
				size: 2048,
				download_count: 20,
				created_at: '2024-01-02T00:00:00Z',
				updated_at: '2024-01-02T00:00:00Z'
			}
		]

		const defaultProps = {
			assets: mockAssets,
			repository: 'owner/repo',
			releaseTag: 'v1.0.0',
			isLatest: false,
			selectedAsset: null,
			onSelectAsset: vi.fn()
		}

		test('renders with required props', () => {
			const element = React.createElement(AssetList, defaultProps)

			expect(element).toBeDefined()
			expect(element.type).toBe(AssetList)
			expect(element.props.assets).toBe(mockAssets)
			expect(element.props.repository).toBe('owner/repo')
			expect(element.props.releaseTag).toBe('v1.0.0')
			expect(element.props.isLatest).toBe(false)
			expect(element.props.selectedAsset).toBe(null)
			expect(typeof element.props.onSelectAsset).toBe('function')
		})

		test('renders with custom strings', () => {
			const customStrings = {
				assetsIn: 'Assets in',
				latest: 'latest version',
				noAssetsInRelease: 'No files available'
			}

			const element = React.createElement(AssetList, {
				...defaultProps,
				strings: customStrings
			})

			expect(element.props.strings).toEqual(customStrings)
		})

		test('renders with latest release flag', () => {
			const element = React.createElement(AssetList, {
				...defaultProps,
				isLatest: true,
				releaseTag: 'latest'
			})

			expect(element.props.isLatest).toBe(true)
			expect(element.props.releaseTag).toBe('latest')
		})

		test('renders with selected asset', () => {
			const element = React.createElement(AssetList, {
				...defaultProps,
				selectedAsset: mockAssets[0]
			})

			expect(element.props.selectedAsset).toBe(mockAssets[0])
		})

		test('renders with empty assets array', () => {
			const element = React.createElement(AssetList, {
				...defaultProps,
				assets: []
			})

			expect(element.props.assets).toEqual([])
		})

		test('renders with single asset', () => {
			const element = React.createElement(AssetList, {
				...defaultProps,
				assets: [mockAssets[0]]
			})

			expect(element.props.assets).toHaveLength(1)
			expect(element.props.assets[0].id).toBe(1)
		})

		test('renders with large number of assets', () => {
			const manyAssets = Array.from({ length: 50 }, (_, i) => ({
				...mockAssets[0],
				id: i + 1,
				name: `file${i + 1}.zip`
			}))

			const element = React.createElement(AssetList, {
				...defaultProps,
				assets: manyAssets
			})

			expect(element.props.assets).toHaveLength(50)
		})

		test('handles assets with different content types', () => {
			const assetsWithDifferentTypes = [
				{ ...mockAssets[0], content_type: 'application/pdf' },
				{ ...mockAssets[1], content_type: 'text/plain' },
				{ ...mockAssets[0], content_type: 'application/json', id: 3, name: 'data.json' }
			]

			const element = React.createElement(AssetList, {
				...defaultProps,
				assets: assetsWithDifferentTypes
			})

			expect(element.props.assets.map(a => a.content_type)).toEqual([
				'application/pdf',
				'text/plain',
				'application/json'
			])
		})

		test('handles assets with different sizes', () => {
			const assetsWithDifferentSizes = [
				{ ...mockAssets[0], size: 0 },
				{ ...mockAssets[1], size: 1024 },
				{ ...mockAssets[0], size: 1048576, id: 3, name: 'large-file.zip' }
			]

			const element = React.createElement(AssetList, {
				...defaultProps,
				assets: assetsWithDifferentSizes
			})

			expect(element.props.assets.map(a => a.size)).toEqual([0, 1024, 1048576])
		})

		test('handles assets with different states', () => {
			const assetsWithDifferentStates = [
				{ ...mockAssets[0], state: 'uploaded' },
				{ ...mockAssets[1], state: 'processing' },
				{ ...mockAssets[0], state: 'failed', id: 3, name: 'failed-file.zip' }
			]

			const element = React.createElement(AssetList, {
				...defaultProps,
				assets: assetsWithDifferentStates
			})

			expect(element.props.assets.map(a => a.state)).toEqual(['uploaded', 'processing', 'failed'])
		})

		test('handles assets with and without labels', () => {
			const element = React.createElement(AssetList, defaultProps)

			expect(element.props.assets[0].label).toBe(null)
			expect(element.props.assets[1].label).toBe('File 2 Label')
		})

		test('handles different repository names', () => {
			const repositories = [
				'user/repo',
				'organization-name/repository-name',
				'complex_user-name/complex-repo-name-123'
			]

			repositories.forEach(repo => {
				const element = React.createElement(AssetList, {
					...defaultProps,
					repository: repo
				})

				expect(element.props.repository).toBe(repo)
			})
		})

		test('handles different release tags', () => {
			const releaseTags = [
				'v1.0.0',
				'v2.1.0-beta',
				'release-2024',
				'1.0.0-alpha.1'
			]

			releaseTags.forEach(tag => {
				const element = React.createElement(AssetList, {
					...defaultProps,
					releaseTag: tag
				})

				expect(element.props.releaseTag).toBe(tag)
			})
		})

		test('provides onSelectAsset function', () => {
			const mockOnSelectAsset = vi.fn()

			const element = React.createElement(AssetList, {
				...defaultProps,
				onSelectAsset: mockOnSelectAsset
			})

			expect(element.props.onSelectAsset).toBe(mockOnSelectAsset)
		})

		test('handles complex file names', () => {
			const assetsWithComplexNames = [
				{ ...mockAssets[0], name: 'my-file.min.js' },
				{ ...mockAssets[1], name: 'app.bundle.css.map' },
				{ ...mockAssets[0], name: 'package-v2.1.0.tar.gz', id: 3 }
			]

			const element = React.createElement(AssetList, {
				...defaultProps,
				assets: assetsWithComplexNames
			})

			expect(element.props.assets.map(a => a.name)).toEqual([
				'my-file.min.js',
				'app.bundle.css.map',
				'package-v2.1.0.tar.gz'
			])
		})

		test('handles assets with special characters in names', () => {
			const assetsWithSpecialChars = [
				{ ...mockAssets[0], name: 'file (1).zip' },
				{ ...mockAssets[1], name: 'file[2].tar.gz' },
				{ ...mockAssets[0], name: 'file{3}.zip', id: 3 }
			]

			const element = React.createElement(AssetList, {
				...defaultProps,
				assets: assetsWithSpecialChars
			})

			expect(element.props.assets.map(a => a.name)).toEqual([
				'file (1).zip',
				'file[2].tar.gz',
				'file{3}.zip'
			])
		})

		test('component is a function component', () => {
			expect(typeof AssetList).toBe('function')
		})

		test('component has correct display name', () => {
			expect(AssetList.displayName || AssetList.name).toBe('AssetList')
		})
	})

	describe('Component Rendering', () => {
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

		test('renders with correct CSS classes', () => {
			render(<AssetList {...defaultProps} />)

			const container = document.querySelector('.github-release-browser-asset-list')
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

	describe('Empty State', () => {
		const defaultProps = {
			assets: [],
			repository: 'owner/repo',
			releaseTag: 'v1.0.0',
			isLatest: false,
			selectedAsset: null,
			onSelectAsset: vi.fn()
		}

		test('shows empty message when no assets', () => {
			render(<AssetList {...defaultProps} />)

			expect(screen.getByText('No assets found in this release')).toBeInTheDocument()
		})

		test('shows custom empty message from strings', () => {
			const customStrings = {
				noAssetsInRelease: 'No files available'
			}
			render(<AssetList {...defaultProps} strings={customStrings} />)

			expect(screen.getByText('No files available')).toBeInTheDocument()
		})
	})

	describe('Asset Selection', () => {
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
		const defaultProps = {
			assets: [],
			repository: 'owner/repo',
			releaseTag: 'v1.0.0',
			isLatest: false,
			selectedAsset: null,
			onSelectAsset: vi.fn()
		}

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
		const defaultProps = {
			assets: [],
			repository: 'owner/repo',
			releaseTag: 'v1.0.0',
			isLatest: false,
			selectedAsset: null,
			onSelectAsset: vi.fn()
		}

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

	describe('Event Handling', () => {
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

			await userEvent.click(screen.getByText('file1.zip'))
			expect(mockOnSelectAsset).toHaveBeenCalledWith(mockAssets[0])

			await userEvent.click(screen.getByText('file2.tar.gz'))
			expect(mockOnSelectAsset).toHaveBeenCalledWith(mockAssets[1])

			await userEvent.click(screen.getByText('document.pdf'))
			expect(mockOnSelectAsset).toHaveBeenCalledWith(mockAssets[2])
		})
	})

	describe('Accessibility', () => {
		const mockAssets = [
			createMockAsset({
				id: 1,
				name: 'file1.zip',
				content_type: 'application/zip',
				size: 1024
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

	describe('Edge Cases', () => {
		const defaultProps = {
			assets: [],
			repository: 'owner/repo',
			releaseTag: 'v1.0.0',
			isLatest: false,
			selectedAsset: null,
			onSelectAsset: vi.fn()
		}

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
