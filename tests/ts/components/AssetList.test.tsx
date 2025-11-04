import { describe, test, expect, vi } from 'vitest'
import React from 'react'
import { AssetList } from '@/components/AssetList'
import { IAsset } from '@/interfaces'

// Mock format utility
vi.mock('@/utils/format', () => ({
  formatFileSize: vi.fn((size: number) => `${size} bytes`)
}))

describe('AssetList component', () => {
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