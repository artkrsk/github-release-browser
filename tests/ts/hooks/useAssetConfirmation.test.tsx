import { renderHook, act } from '@testing-library/react'
import { useAssetConfirmation } from '@/hooks/useAssetConfirmation'
import { IAsset, IRelease, IBrowserConfig } from '@/interfaces'
import { createMockAsset, createMockRelease, createMockBrowserConfig } from '@test-utils'

describe('useAssetConfirmation', () => {
  let mockConfig: IBrowserConfig
  let mockOnSelectAsset: vi.Mock

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnSelectAsset = vi.fn()
    mockConfig = createMockBrowserConfig({
      onSelectAsset: mockOnSelectAsset
    })
  })

  it('should return canConfirmAsset as false when no selections are made', () => {
    const { result } = renderHook(() =>
      useAssetConfirmation(null, null, null, mockConfig)
    )

    expect(result.current.canConfirmAsset).toBe(false)
  })

  it('should return canConfirmAsset as false when only repo is selected', () => {
    const { result } = renderHook(() =>
      useAssetConfirmation('owner/test-repo', null, null, mockConfig)
    )

    expect(result.current.canConfirmAsset).toBe(false)
  })

  it('should return canConfirmAsset as false when only repo and release are selected', () => {
    const mockRelease: IRelease = createMockRelease()
    const { result } = renderHook(() =>
      useAssetConfirmation('owner/test-repo', mockRelease, null, mockConfig)
    )

    expect(result.current.canConfirmAsset).toBe(false)
  })

  it('should return canConfirmAsset as false when only repo and asset are selected', () => {
    const mockAsset: IAsset = createMockAsset()
    const { result } = renderHook(() =>
      useAssetConfirmation('owner/test-repo', null, mockAsset, mockConfig)
    )

    expect(result.current.canConfirmAsset).toBe(false)
  })

  it('should return canConfirmAsset as true when all selections are made', () => {
    const mockAsset: IAsset = createMockAsset()
    const mockRelease: IRelease = createMockRelease()
    const { result } = renderHook(() =>
      useAssetConfirmation('owner/test-repo', mockRelease, mockAsset, mockConfig)
    )

    expect(result.current.canConfirmAsset).toBe(true)
  })

  it('should return canConfirmAsset as true with latest release selection', () => {
    const mockAsset: IAsset = createMockAsset()
    const { result } = renderHook(() =>
      useAssetConfirmation('owner/test-repo', 'latest', mockAsset, mockConfig)
    )

    expect(result.current.canConfirmAsset).toBe(true)
  })

  it('should not call onSelectAsset when handleConfirmAsset is called without complete selection', () => {
    const { result } = renderHook(() =>
      useAssetConfirmation(null, null, null, mockConfig)
    )

    act(() => {
      result.current.handleConfirmAsset()
    })

    expect(mockOnSelectAsset).not.toHaveBeenCalled()
  })

  it('should not call onSelectAsset when only repo is selected', () => {
    const { result } = renderHook(() =>
      useAssetConfirmation('owner/test-repo', null, null, mockConfig)
    )

    act(() => {
      result.current.handleConfirmAsset()
    })

    expect(mockOnSelectAsset).not.toHaveBeenCalled()
  })

  it('should not call onSelectAsset when repo and release are selected but no asset', () => {
    const mockRelease: IRelease = createMockRelease()
    const { result } = renderHook(() =>
      useAssetConfirmation('owner/test-repo', mockRelease, null, mockConfig)
    )

    act(() => {
      result.current.handleConfirmAsset()
    })

    expect(mockOnSelectAsset).not.toHaveBeenCalled()
  })

  it('should call onSelectAsset with correct data for specific release', () => {
    const mockAsset: IAsset = createMockAsset({
      browser_download_url: 'https://github.com/owner/repo/releases/download/v1.0.0/test-file.zip'
    })
    const mockRelease: IRelease = createMockRelease({
      tag_name: 'v1.0.0'
    })

    const { result } = renderHook(() =>
      useAssetConfirmation('owner/test-repo', mockRelease, mockAsset, mockConfig)
    )

    act(() => {
      result.current.handleConfirmAsset()
    })

    expect(mockOnSelectAsset).toHaveBeenCalledWith({
      repo: 'owner/test-repo',
      release: 'v1.0.0',
      asset: mockAsset,
      downloadUrl: 'https://github.com/owner/repo/releases/download/v1.0.0/test-file.zip'
    })
  })

  it('should call onSelectAsset with correct data for latest release', () => {
    const mockAsset: IAsset = createMockAsset({
      browser_download_url: 'https://github.com/owner/repo/releases/download/latest/test-file.zip'
    })

    const { result } = renderHook(() =>
      useAssetConfirmation('owner/test-repo', 'latest', mockAsset, mockConfig)
    )

    act(() => {
      result.current.handleConfirmAsset()
    })

    expect(mockOnSelectAsset).toHaveBeenCalledWith({
      repo: 'owner/test-repo',
      release: 'latest',
      asset: mockAsset,
      downloadUrl: 'https://github.com/owner/repo/releases/download/latest/test-file.zip'
    })
  })

  it('should handle multiple confirmations correctly', () => {
    const mockAsset1: IAsset = createMockAsset({
      name: 'file1.zip',
      browser_download_url: 'https://example.com/file1.zip'
    })
    const mockAsset2: IAsset = createMockAsset({
      name: 'file2.zip',
      browser_download_url: 'https://example.com/file2.zip'
    })
    const mockRelease: IRelease = createMockRelease({ tag_name: 'v1.0.0' })

    const { result, rerender } = renderHook(
      ({ asset }) =>
        useAssetConfirmation('owner/test-repo', mockRelease, asset, mockConfig),
      { initialProps: { asset: mockAsset1 } }
    )

    // Confirm first asset
    act(() => {
      result.current.handleConfirmAsset()
    })

    expect(mockOnSelectAsset).toHaveBeenCalledWith({
      repo: 'owner/test-repo',
      release: 'v1.0.0',
      asset: mockAsset1,
      downloadUrl: 'https://example.com/file1.zip'
    })

    // Change asset
    rerender({ asset: mockAsset2 })

    // Confirm second asset
    act(() => {
      result.current.handleConfirmAsset()
    })

    expect(mockOnSelectAsset).toHaveBeenCalledWith({
      repo: 'owner/test-repo',
      release: 'v1.0.0',
      asset: mockAsset2,
      downloadUrl: 'https://example.com/file2.zip'
    })

    expect(mockOnSelectAsset).toHaveBeenCalledTimes(2)
  })

  it('should not call onSelectAsset if config.onSelectAsset is not provided', () => {
    const configWithoutCallback = createMockBrowserConfig({
      onSelectAsset: undefined
    })
    const mockAsset: IAsset = createMockAsset()
    const mockRelease: IRelease = createMockRelease()

    const { result } = renderHook(() =>
      useAssetConfirmation('owner/test-repo', mockRelease, mockAsset, configWithoutCallback)
    )

    act(() => {
      result.current.handleConfirmAsset()
    })

    expect(mockOnSelectAsset).not.toHaveBeenCalled()
  })

  it('should handle empty browser_download_url in asset', () => {
    const mockAsset: IAsset = createMockAsset({
      browser_download_url: ''
    })
    const mockRelease: IRelease = createMockRelease()

    const { result } = renderHook(() =>
      useAssetConfirmation('owner/test-repo', mockRelease, mockAsset, mockConfig)
    )

    act(() => {
      result.current.handleConfirmAsset()
    })

    expect(mockOnSelectAsset).toHaveBeenCalledWith({
      repo: 'owner/test-repo',
      release: 'v1.0.0',
      asset: mockAsset,
      downloadUrl: ''
    })
  })

  it('should maintain canConfirmAsset state across re-renders', () => {
    const mockAsset: IAsset = createMockAsset()
    const mockRelease: IRelease = createMockRelease()

    const { result, rerender } = renderHook(() =>
      useAssetConfirmation('owner/test-repo', mockRelease, mockAsset, mockConfig)
    )

    expect(result.current.canConfirmAsset).toBe(true)

    rerender()

    expect(result.current.canConfirmAsset).toBe(true)
  })

  it('should update canConfirmAsset when selections change', () => {
    const mockAsset: IAsset = createMockAsset()
    const mockRelease: IRelease = createMockRelease()

    const { result, rerender } = renderHook(
      ({ asset, release }) =>
        useAssetConfirmation('owner/test-repo', release, asset, mockConfig),
      { initialProps: { asset: null, release: null } }
    )

    expect(result.current.canConfirmAsset).toBe(false)

    // Add release
    rerender({ asset: null, release: mockRelease })
    expect(result.current.canConfirmAsset).toBe(false)

    // Add asset
    rerender({ asset: mockAsset, release: mockRelease })
    expect(result.current.canConfirmAsset).toBe(true)

    // Remove asset
    rerender({ asset: null, release: mockRelease })
    expect(result.current.canConfirmAsset).toBe(false)
  })

  it('should handle complex repository names', () => {
    const mockAsset: IAsset = createMockAsset()
    const mockRelease: IRelease = createMockRelease()

    const complexRepoNames = [
      'owner/simple-repo',
      'my-org/project',
      'username/my-repo-with-dashes',
      'org-name/repo_with_underscores',
      'very-long-organization-name/very-long-repository-name'
    ]

    complexRepoNames.forEach(repoName => {
      const { result } = renderHook(() =>
        useAssetConfirmation(repoName, mockRelease, mockAsset, mockConfig)
      )

      expect(result.current.canConfirmAsset).toBe(true)

      act(() => {
        result.current.handleConfirmAsset()
      })

      expect(mockOnSelectAsset).toHaveBeenCalledWith(
        expect.objectContaining({
          repo: repoName,
          release: 'v1.0.0',
          asset: mockAsset
        })
      )
    })
  })

  it('should return correct type', () => {
    const { result } = renderHook(() =>
      useAssetConfirmation('owner/test-repo', 'latest', null, mockConfig)
    )

    expect(typeof result.current.handleConfirmAsset).toBe('function')
    expect(typeof result.current.canConfirmAsset).toBe('boolean')
  })
})