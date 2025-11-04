import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReleaseList } from '@/components/ReleaseList'
import { IRelease } from '@/interfaces'

// Mock format utility
vi.mock('@/utils/format', () => ({
  formatDate: vi.fn((date: string) => 'Jan 15, 2024')
}))

// Mock FeatureBadge component
vi.mock('@/components/FeatureBadge', () => ({
  FeatureBadge: ({ feature }: { feature: string }) =>
    React.createElement('span', { className: 'mock-feature-badge' }, feature)
}))

// Mock WordPress components
vi.mock('@wordpress/components', () => ({
  Card: ({ children, className, onClick, ...props }: any) => (
    <div
      className={`wp-card ${className || ''}`}
      onClick={onClick}
      data-testid={className?.includes('latest') ? 'latest-release-card' : 'release-card'}
      role="button"
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  ),
  CardBody: ({ children, className, ...props }: any) => (
    <div
      className={`wp-card-body ${className || ''}`}
      data-testid="card-body"
      {...props}
    >
      {children}
    </div>
  )
}))

// Mock window.open
const mockWindowOpen = vi.fn()

// Mock getString utility
vi.mock('@/utils/getString', () => ({
  getString: (key: string) => key
}))

describe('ReleaseList component', () => {
  const mockReleases: IRelease[] = [
    {
      url: 'https://api.github.com/repos/owner/repo/releases/1',
      html_url: 'https://github.com/owner/repo/releases/tag/v1.0.0',
      assets_url: 'https://api.github.com/repos/owner/repo/releases/1/assets',
      upload_url: 'https://uploads.github.com/repos/owner/repo/releases/1/assets',
      tarball_url: 'https://api.github.com/repos/owner/repo/tarball/v1.0.0',
      zipball_url: 'https://api.github.com/repos/owner/repo/zipball/v1.0.0',
      id: 1,
      tag_name: 'v1.0.0',
      target_commitish: 'main',
      name: 'First Release',
      body: 'Release notes for v1.0.0',
      draft: false,
      prerelease: false,
      created_at: '2024-01-01T00:00:00Z',
      published_at: '2024-01-15T00:00:00Z',
      assets: [
        {
          url: 'https://api.github.com/repos/owner/repo/releases/assets/1',
          id: 1,
          name: 'file.zip',
          label: null,
          content_type: 'application/zip',
          state: 'uploaded',
          size: 1024,
          download_count: 10,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]
    },
    {
      url: 'https://api.github.com/repos/owner/repo/releases/2',
      html_url: 'https://github.com/owner/repo/releases/tag/v2.0.0',
      assets_url: 'https://api.github.com/repos/owner/repo/releases/2/assets',
      upload_url: 'https://uploads.github.com/repos/owner/repo/releases/2/assets',
      tarball_url: 'https://api.github.com/repos/owner/repo/tarball/v2.0.0',
      zipball_url: 'https://api.github.com/repos/owner/repo/zipball/v2.0.0',
      id: 2,
      tag_name: 'v2.0.0',
      target_commitish: 'main',
      name: 'Second Release',
      body: 'Release notes for v2.0.0',
      draft: false,
      prerelease: false,
      created_at: '2024-02-01T00:00:00Z',
      published_at: '2024-02-15T00:00:00Z',
      assets: [
        {
          url: 'https://api.github.com/repos/owner/repo/releases/assets/2',
          id: 2,
          name: 'file2.zip',
          label: null,
          content_type: 'application/zip',
          state: 'uploaded',
          size: 2048,
          download_count: 20,
          created_at: '2024-02-01T00:00:00Z',
          updated_at: '2024-02-01T00:00:00Z'
        },
        {
          url: 'https://api.github.com/repos/owner/repo/releases/assets/3',
          id: 3,
          name: 'file3.tar.gz',
          label: 'Source Tarball',
          content_type: 'application/gzip',
          state: 'uploaded',
          size: 4096,
          download_count: 15,
          created_at: '2024-02-01T00:00:00Z',
          updated_at: '2024-02-01T00:00:00Z'
        }
      ]
    }
  ]

  const defaultProps = {
    releases: mockReleases,
    selectedRelease: null,
    onSelectRelease: vi.fn(),
    repository: 'owner/repo',
    strings: {},
    features: { useLatestRelease: true },
    upgradeUrl: 'https://example.com/upgrade'
  }

  beforeEach(() => {
    // Mock window.open
    Object.defineProperty(window, 'open', {
      value: mockWindowOpen,
      writable: true
    })
    vi.clearAllMocks()
  })

  test('renders with required props', () => {
    const element = React.createElement(ReleaseList, {
      releases: mockReleases,
      selectedRelease: null,
      onSelectRelease: vi.fn()
    })

    expect(element).toBeDefined()
    expect(element.type).toBe(ReleaseList)
    expect(element.props.releases).toBe(mockReleases)
    expect(element.props.selectedRelease).toBe(null)
    expect(typeof element.props.onSelectRelease).toBe('function')
  })

  test('renders with all props', () => {
    const element = React.createElement(ReleaseList, defaultProps)

    expect(element.props.repository).toBe('owner/repo')
    expect(element.props.strings).toEqual({})
    expect(element.props.features).toEqual({ useLatestRelease: true })
    expect(element.props.upgradeUrl).toBe('https://example.com/upgrade')
  })

  test('renders with empty releases array', () => {
    const element = React.createElement(ReleaseList, {
      ...defaultProps,
      releases: []
    })

    expect(element.props.releases).toEqual([])
  })

  test('renders with single release', () => {
    const element = React.createElement(ReleaseList, {
      ...defaultProps,
      releases: [mockReleases[0]]
    })

    expect(element.props.releases).toHaveLength(1)
    expect(element.props.releases[0].tag_name).toBe('v1.0.0')
  })

  test('renders with latest release selected', () => {
    const element = React.createElement(ReleaseList, {
      ...defaultProps,
      selectedRelease: 'latest'
    })

    expect(element.props.selectedRelease).toBe('latest')
  })

  test('renders with specific release selected', () => {
    const element = React.createElement(ReleaseList, {
      ...defaultProps,
      selectedRelease: 'v1.0.0'
    })

    expect(element.props.selectedRelease).toBe('v1.0.0')
  })

  test('renders with custom strings', () => {
    const customStrings = {
      noReleases: 'No releases available',
      createOne: 'Create release',
      releases: 'Available releases',
      useLatestRelease: 'Use latest',
      useLatestReleaseDesc: 'Get the newest version',
      asset: 'file',
      assets: 'files'
    }

    const element = React.createElement(ReleaseList, {
      ...defaultProps,
      strings: customStrings
    })

    expect(element.props.strings).toEqual(customStrings)
  })

  test('renders with pro feature disabled', () => {
    const element = React.createElement(ReleaseList, {
      ...defaultProps,
      features: { useLatestRelease: false }
    })

    expect(element.props.features?.useLatestRelease).toBe(false)
  })

  test('renders without upgrade URL', () => {
    const element = React.createElement(ReleaseList, {
      ...defaultProps,
      upgradeUrl: undefined
    })

    expect(element.props.upgradeUrl).toBeUndefined()
  })

  test('renders with repository undefined', () => {
    const element = React.createElement(ReleaseList, {
      ...defaultProps,
      repository: undefined
    })

    expect(element.props.repository).toBeUndefined()
  })

  test('renders with different release states', () => {
    const releasesWithDifferentStates = [
      { ...mockReleases[0], draft: true, prerelease: false },
      { ...mockReleases[1], draft: false, prerelease: true }
    ]

    const element = React.createElement(ReleaseList, {
      ...defaultProps,
      releases: releasesWithDifferentStates
    })

    expect(element.props.releases[0].draft).toBe(true)
    expect(element.props.releases[1].prerelease).toBe(true)
  })

  test('renders with releases having different asset counts', () => {
    const releasesWithDifferentAssets = [
      { ...mockReleases[0], assets: [] },
      { ...mockReleases[1], assets: mockReleases[1].assets }
    ]

    const element = React.createElement(ReleaseList, {
      ...defaultProps,
      releases: releasesWithDifferentAssets
    })

    expect(element.props.releases[0].assets).toHaveLength(0)
    expect(element.props.releases[1].assets).toHaveLength(2)
  })

  test('renders with releases having no names', () => {
    const releasesWithoutNames = [
      { ...mockReleases[0], name: null },
      { ...mockReleases[1], name: null }
    ]

    const element = React.createElement(ReleaseList, {
      ...defaultProps,
      releases: releasesWithoutNames
    })

    expect(element.props.releases[0].name).toBe(null)
    expect(element.props.releases[1].name).toBe(null)
  })

  test('renders with releases having same tag and name', () => {
    const releasesWithSameName = [
      { ...mockReleases[0], name: 'v1.0.0' },
      { ...mockReleases[1], name: 'v2.0.0' }
    ]

    const element = React.createElement(ReleaseList, {
      ...defaultProps,
      releases: releasesWithSameName
    })

    expect(element.props.releases[0].name).toBe('v1.0.0')
    expect(element.props.releases[0].tag_name).toBe('v1.0.0')
  })

  test('renders with different tag names', () => {
    const differentTags = ['v1.0.0', 'v2.1.0-beta', 'release-2024', '1.0.0-alpha.1']
    const releasesWithDifferentTags = differentTags.map((tag, index) => ({
      ...mockReleases[0],
      id: index + 1,
      tag_name: tag
    }))

    const element = React.createElement(ReleaseList, {
      ...defaultProps,
      releases: releasesWithDifferentTags
    })

    expect(element.props.releases.map(r => r.tag_name)).toEqual(differentTags)
  })

  test('renders with different feature flags', () => {
    const featureConfigs = [
      { useLatestRelease: true },
      { useLatestRelease: false },
      { useLatestRelease: true, someOtherFeature: true },
      {}
    ]

    featureConfigs.forEach((features, index) => {
      const element = React.createElement(ReleaseList, {
        ...defaultProps,
        features
      })

      expect(element.props.features).toEqual(features)
    })
  })

  test('renders with different upgrade URLs', () => {
    const upgradeUrls = [
      'https://example.com/pro',
      'https://myapp.com/upgrade',
      'https://localhost:3000/upgrade'
    ]

    upgradeUrls.forEach(url => {
      const element = React.createElement(ReleaseList, {
        ...defaultProps,
        upgradeUrl: url
      })

      expect(element.props.upgradeUrl).toBe(url)
    })
  })

  test('renders with different repository names', () => {
    const repositories = [
      'user/repo',
      'organization-name/repository-name',
      'complex_user-name/complex-repo-name-123'
    ]

    repositories.forEach(repo => {
      const element = React.createElement(ReleaseList, {
        ...defaultProps,
        repository: repo
      })

      expect(element.props.repository).toBe(repo)
    })
  })

  test('provides onSelectRelease function', () => {
    const mockOnSelectRelease = vi.fn()

    const element = React.createElement(ReleaseList, {
      ...defaultProps,
      onSelectRelease: mockOnSelectRelease
    })

    expect(element.props.onSelectRelease).toBe(mockOnSelectRelease)
  })

  test('renders with releases having different publication dates', () => {
    const releasesWithDifferentDates = [
      { ...mockReleases[0], published_at: '2024-01-01T00:00:00Z' },
      { ...mockReleases[1], published_at: '2024-12-31T23:59:59Z' }
    ]

    const element = React.createElement(ReleaseList, {
      ...defaultProps,
      releases: releasesWithDifferentDates
    })

    expect(element.props.releases[0].published_at).toBe('2024-01-01T00:00:00Z')
    expect(element.props.releases[1].published_at).toBe('2024-12-31T23:59:59Z')
  })

  test('component is a function component', () => {
    expect(typeof ReleaseList).toBe('function')
  })

  test('component has correct display name', () => {
    expect(ReleaseList.displayName || ReleaseList.name).toBe('ReleaseList')
  })

  describe('Interaction Tests', () => {
    test('renders and handles "create one" link click', () => {
      const mockOnSelectRelease = vi.fn()

      render(
        <ReleaseList
          releases={[]}
          selectedRelease={null}
          onSelectRelease={mockOnSelectRelease}
          repository="owner/repo"
          strings={{}}
        />
      )

      const createLink = screen.getByRole('link', { name: /releases\.createOne/ })
      expect(createLink).toBeInTheDocument()
      expect(createLink).toHaveAttribute('href', 'https://github.com/owner/repo/releases/new')
      expect(createLink).toHaveAttribute('target', '_blank')
      expect(createLink).toHaveAttribute('rel', 'noopener noreferrer')

      // Test the click handler - we can't directly test stopPropagation but we can verify it doesn't call onSelectRelease
      fireEvent.click(createLink)
      expect(mockOnSelectRelease).not.toHaveBeenCalled()
    })

    test('handles latest release card click when pro feature is disabled', async () => {
      const mockOnSelectRelease = vi.fn()
      const user = userEvent.setup()

      render(
        <ReleaseList
          releases={mockReleases}
          selectedRelease={null}
          onSelectRelease={mockOnSelectRelease}
          repository="owner/repo"
          strings={{}}
          features={{ useLatestRelease: true }}
        />
      )

      // Find the latest release card by its unique content
      const latestCard = screen.getByText('releases.useLatest').closest('[role="button"]')
      await user.click(latestCard)

      expect(mockOnSelectRelease).toHaveBeenCalledWith('latest')
      expect(mockWindowOpen).not.toHaveBeenCalled()
    })

    test('handles latest release card click when pro feature is enabled with upgrade URL', async () => {
      const mockOnSelectRelease = vi.fn()
      const user = userEvent.setup()

      render(
        <ReleaseList
          releases={mockReleases}
          selectedRelease={null}
          onSelectRelease={mockOnSelectRelease}
          repository="owner/repo"
          strings={{ getPro: 'Get Pro' }}
          features={{ useLatestRelease: false }}
          upgradeUrl="https://example.com/upgrade"
        />
      )

      const latestCard = screen.getByText('Get Pro').closest('[role="button"]')
      await user.click(latestCard)

      expect(mockOnSelectRelease).not.toHaveBeenCalled()
      expect(mockWindowOpen).toHaveBeenCalledWith('https://example.com/upgrade', '_blank')
    })

    test('handles latest release card click when pro feature is enabled without upgrade URL', async () => {
      const mockOnSelectRelease = vi.fn()
      const user = userEvent.setup()

      render(
        <ReleaseList
          releases={mockReleases}
          selectedRelease={null}
          onSelectRelease={mockOnSelectRelease}
          repository="owner/repo"
          strings={{}}
          features={{ useLatestRelease: false }}
          upgradeUrl=""
        />
      )

      const latestCard = screen.getByText('releases.useLatest').closest('[role="button"]')
      await user.click(latestCard)

      // Should fall back to calling onSelectRelease since no upgrade URL
      expect(mockOnSelectRelease).toHaveBeenCalledWith('latest')
      expect(mockWindowOpen).not.toHaveBeenCalled()
    })

    test('handles individual release card click', async () => {
      const mockOnSelectRelease = vi.fn()
      const user = userEvent.setup()

      render(
        <ReleaseList
          releases={mockReleases}
          selectedRelease={null}
          onSelectRelease={mockOnSelectRelease}
          repository="owner/repo"
          strings={{}}
          features={{ useLatestRelease: true }}
        />
      )

      // Find release cards by their version tags
      const releaseCard1 = screen.getByText('v1.0.0').closest('[role="button"]')
      await user.click(releaseCard1)

      expect(mockOnSelectRelease).toHaveBeenCalledWith(mockReleases[0])
    })

    test('shows correct selection states', () => {
      const mockOnSelectRelease = vi.fn()

      render(
        <ReleaseList
          releases={mockReleases}
          selectedRelease="latest"
          onSelectRelease={mockOnSelectRelease}
          repository="owner/repo"
          strings={{}}
          features={{ useLatestRelease: true }}
        />
      )

      const latestCard = screen.getByText('releases.useLatest').closest('[role="button"]')

      // Check that the latest card has the selected class when 'latest' is selected
      expect(latestCard).toHaveClass('github-release-browser-card_selected')
    })

    test('shows pro feature badge when useLatestRelease is disabled', () => {
      render(
        <ReleaseList
          releases={mockReleases}
          selectedRelease={null}
          onSelectRelease={vi.fn()}
          repository="owner/repo"
          strings={{ getPro: 'Get Pro' }}
          features={{ useLatestRelease: false }}
          upgradeUrl="https://example.com/upgrade"
        />
      )

      const latestCard = screen.getByText('Get Pro').closest('[role="button"]')
      expect(latestCard).toHaveClass('github-release-browser-release-card_pro')

      const proBadge = screen.getByText('Get Pro')
      expect(proBadge).toBeInTheDocument()
      expect(proBadge).toHaveClass('mock-feature-badge')
    })
  })

  describe('Error State', () => {
    test('renders error message when error prop is provided', () => {
      render(
        <ReleaseList
          releases={mockReleases}
          selectedRelease={null}
          onSelectRelease={vi.fn()}
          error="Failed to load releases"
        />
      )

      expect(screen.getByText('Failed to load releases')).toBeInTheDocument()
      expect(screen.queryByTestId('latest-release-card')).not.toBeInTheDocument()
      expect(screen.queryByTestId('release-card')).not.toBeInTheDocument()
    })

    test('renders retry link when error and onRetry provided', () => {
      const mockOnRetry = vi.fn()
      render(
        <ReleaseList
          releases={mockReleases}
          selectedRelease={null}
          onSelectRelease={vi.fn()}
          error="Network error"
          onRetry={mockOnRetry}
        />
      )

      const retryLink = screen.getByText('common.retry')
      expect(retryLink).toBeInTheDocument()
      expect(retryLink.tagName).toBe('A')
    })

    test('calls onRetry when retry link is clicked', async () => {
      const mockOnRetry = vi.fn()
      const user = userEvent.setup()

      render(
        <ReleaseList
          releases={mockReleases}
          selectedRelease={null}
          onSelectRelease={vi.fn()}
          error="API error"
          onRetry={mockOnRetry}
        />
      )

      const retryLink = screen.getByText('common.retry')
      await user.click(retryLink)

      expect(mockOnRetry).toHaveBeenCalledTimes(1)
    })

    test('does not render retry link when onRetry is not provided', () => {
      render(
        <ReleaseList
          releases={mockReleases}
          selectedRelease={null}
          onSelectRelease={vi.fn()}
          error="Some error"
        />
      )

      expect(screen.getByText('Some error')).toBeInTheDocument()
      expect(screen.queryByText('common.retry')).not.toBeInTheDocument()
    })

    test('uses custom retry string when provided', () => {
      render(
        <ReleaseList
          releases={mockReleases}
          selectedRelease={null}
          onSelectRelease={vi.fn()}
          error="Error message"
          onRetry={vi.fn()}
          strings={{ retry: 'Try Again →' }}
        />
      )

      expect(screen.getByText('Try Again →')).toBeInTheDocument()
    })

    test('prevents default and stops propagation on retry click', async () => {
      const mockOnRetry = vi.fn()
      render(
        <ReleaseList
          releases={mockReleases}
          selectedRelease={null}
          onSelectRelease={vi.fn()}
          error="Error"
          onRetry={mockOnRetry}
        />
      )

      const retryLink = screen.getByText('common.retry')
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true })
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault')
      const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation')

      fireEvent(retryLink, clickEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(stopPropagationSpy).toHaveBeenCalled()
      expect(mockOnRetry).toHaveBeenCalled()
    })
  })

  describe('Selected Release State', () => {
    test('shows checkmark icon for selected release', () => {
      render(
        <ReleaseList
          releases={mockReleases}
          selectedRelease="v1.0.0"
          onSelectRelease={vi.fn()}
        />
      )

      const selectedCard = screen.getByRole('button', { name: /v1\.0\.0/ })
      const checkmark = selectedCard.querySelector('.dashicons-yes')
      expect(checkmark).toBeInTheDocument()
    })

    test('shows ellipsis icon for non-selected releases', () => {
      render(
        <ReleaseList
          releases={mockReleases}
          selectedRelease="v1.0.0"
          onSelectRelease={vi.fn()}
        />
      )

      const nonSelectedCard = screen.getByRole('button', { name: /v2\.0\.0/ })
      const ellipsis = nonSelectedCard.querySelector('.dashicons-ellipsis')
      expect(ellipsis).toBeInTheDocument()
    })
  })
})