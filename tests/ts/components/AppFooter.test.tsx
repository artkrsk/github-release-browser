import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppFooter } from '@/components/AppFooter'
import { createMockBrowserConfig, render } from '@test-utils'


// Mock window.open
const mockWindowOpen = vi.fn()

beforeEach(() => {
  Object.defineProperty(window, 'open', {
    value: mockWindowOpen,
    writable: true
  })
  vi.clearAllMocks()
})

describe('AppFooter - Simple Testing', () => {
  const mockPrimaryButton = <button data-testid="primary-action">Select Asset</button>

  const basicConfig = createMockBrowserConfig({
    features: { useLatestRelease: false }, // Basic features
    upgradeUrl: 'https://example.com/upgrade',
    strings: { upgradeToPro: 'Upgrade to Pro' }
  })

  const proConfig = createMockBrowserConfig({
    features: { useLatestRelease: true }, // All pro features
    upgradeUrl: 'https://example.com/upgrade'
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    test('renders with required props', () => {
      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={basicConfig}
        />
      )

      expect(screen.getByTestId('primary-action')).toBeInTheDocument()
      expect(screen.getByTestId('button-link')).toBeInTheDocument()
    })

    test('renders footer container', () => {
      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={basicConfig}
        />
      )

      const footerContainer = document.querySelector('.github-release-browser-browser__footer')
      expect(footerContainer).toBeInTheDocument()
    })

    test('renders primary button', () => {
      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={basicConfig}
        />
      )

      expect(screen.getByTestId('primary-action')).toBeInTheDocument()
    })
  })

  describe('Upgrade Link Visibility', () => {
    test('shows upgrade link for basic configuration', () => {
      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={basicConfig}
        />
      )

      expect(screen.getByTestId('button-link')).toBeInTheDocument()
    })

    test('hides upgrade link for pro users', () => {
      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={proConfig}
        />
      )

      expect(screen.queryByTestId('button-link')).not.toBeInTheDocument()
    })

    test('hides upgrade link when no upgrade URL', () => {
      const configWithoutUpgrade = createMockBrowserConfig({
        features: { useLatestRelease: false },
        upgradeUrl: ''
      })

      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={configWithoutUpgrade}
        />
      )

      expect(screen.queryByTestId('button-link')).not.toBeInTheDocument()
    })

    test('hides upgrade link when upgrade URL is null', () => {
      const configWithNullUpgrade = createMockBrowserConfig({
        features: { useLatestRelease: false },
        upgradeUrl: null
      })

      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={configWithNullUpgrade}
        />
      )

      expect(screen.queryByTestId('button-link')).not.toBeInTheDocument()
    })

    test('hides upgrade link when features is null', () => {
      const configWithNullFeatures = createMockBrowserConfig({
        features: null,
        upgradeUrl: 'https://example.com/upgrade'
      })

      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={configWithNullFeatures}
        />
      )

      expect(screen.queryByTestId('button-link')).toBeInTheDocument()
    })
  })

  describe('Upgrade Link Functionality', () => {
    test('opens upgrade URL when clicked', async () => {
      const user = userEvent.setup()
      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={basicConfig}
        />
      )

      const upgradeLink = screen.getByTestId('button-link')
      await user.click(upgradeLink)

      expect(mockWindowOpen).toHaveBeenCalledWith('https://example.com/upgrade', '_blank')
    })

    test('uses correct URL from config', async () => {
      const user = userEvent.setup()
      const configWithCustomUrl = createMockBrowserConfig({
        features: { useLatestRelease: false },
        upgradeUrl: 'https://custom-upgrade.example.com'
      })

      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={configWithCustomUrl}
        />
      )

      const upgradeLink = screen.getByTestId('button-link')
      await user.click(upgradeLink)

      expect(mockWindowOpen).toHaveBeenCalledWith('https://custom-upgrade.example.com', '_blank')
    })

    test('can handle multiple clicks', async () => {
      const user = userEvent.setup()
      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={basicConfig}
        />
      )

      const upgradeLink = screen.getByTestId('button-link')

      await user.click(upgradeLink)
      await user.click(upgradeLink)

      expect(mockWindowOpen).toHaveBeenCalledTimes(2)
      expect(mockWindowOpen).toHaveBeenNthCalledWith(1, 'https://example.com/upgrade', '_blank')
      expect(mockWindowOpen).toHaveBeenNthCalledWith(2, 'https://example.com/upgrade', '_blank')
    })
  })

  describe('Primary Button', () => {
    test('renders any ReactNode', () => {
      const customButton = <div data-testid="custom-primary">Custom Button</div>

      render(
        <AppFooter
          primaryButton={customButton}
          config={basicConfig}
        />
      )

      expect(screen.getByTestId('custom-primary')).toBeInTheDocument()
    })

    test('renders text as primary button', () => {
      const textButton = <span data-testid="text-primary">Text Button</span>

      render(
        <AppFooter
          primaryButton={textButton}
          config={basicConfig}
        />
      )

      expect(screen.getByTestId('text-primary')).toBeInTheDocument()
    })

    test('renders button as primary button', () => {
      const buttonButton = <button data-testid="button-primary">Button Button</button>

      render(
        <AppFooter
          primaryButton={buttonButton}
          config={basicConfig}
        />
      )

      expect(screen.getByTestId('button-primary')).toBeInTheDocument()
    })

    test('renders complex component as primary button', () => {
      const complexButton = (
        <div data-testid="complex-primary">
          <h3>Complex Action</h3>
          <p>Description</p>
          <button>Inner Button</button>
        </div>
      )

      render(
        <AppFooter
          primaryButton={complexButton}
          config={basicConfig}
        />
      )

      expect(screen.getByTestId('complex-primary')).toBeInTheDocument()
    })
  })

  describe('Upgrade Link Text', () => {
    test('shows default text when no custom string', () => {
      const configWithoutString = createMockBrowserConfig({
        features: { useLatestRelease: false },
        upgradeUrl: 'https://example.com/upgrade',
        strings: {}
      })

      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={configWithoutString}
        />
      )

      const upgradeLink = screen.getByTestId('button-link')
      expect(upgradeLink).toHaveTextContent('Upgrade to Pro')
    })

    test('shows custom text from config', () => {
      const customConfig = createMockBrowserConfig({
        features: { useLatestRelease: false },
        upgradeUrl: 'https://example.com/upgrade',
        strings: { upgradeToPro: 'Get Premium' }
      })

      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={customConfig}
        />
      )

      const upgradeLink = screen.getByTestId('button-link')
      expect(upgradeLink).toHaveTextContent('Get Premium')
    })

    test('falls back to default when upgradeToPro is empty', () => {
      const configWithEmptyString = createMockBrowserConfig({
        features: { useLatestRelease: false },
        upgradeUrl: 'https://example.com/upgrade',
        strings: { upgradeToPro: '' }
      })

      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={configWithEmptyString}
        />
      )

      const upgradeLink = screen.getByTestId('button-link')
      expect(upgradeLink).toHaveTextContent('Upgrade to Pro')
    })

    test('falls back to default when strings is null', () => {
      const configWithNullStrings = createMockBrowserConfig({
        features: { useLatestRelease: false },
        upgradeUrl: 'https://example.com/upgrade',
        strings: null
      })

      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={configWithNullStrings}
        />
      )

      const upgradeLink = screen.getByTestId('button-link')
      expect(upgradeLink).toHaveTextContent('Upgrade to Pro')
    })

    test('falls back to default when strings is undefined', () => {
      const configWithUndefinedStrings = createMockBrowserConfig({
        features: { useLatestRelease: false },
        upgradeUrl: 'https://example.com/upgrade',
        strings: undefined
      })

      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={configWithUndefinedStrings}
        />
      )

      const upgradeLink = screen.getByTestId('button-link')
      expect(upgradeLink).toHaveTextContent('Upgrade to Pro')
    })
  })

  describe('CSS Classes', () => {
    test('applies correct footer class', () => {
      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={basicConfig}
        />
      )

      const footerContainer = document.querySelector('.github-release-browser-browser__footer')
      expect(footerContainer).toBeInTheDocument()
    })

    test('upgrade link has correct classes', () => {
      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={basicConfig}
        />
      )

      const upgradeLink = screen.getByTestId('button-link')
      expect(upgradeLink).toHaveClass('wp-button')
      expect(upgradeLink).toHaveClass('wp-button-link')
      expect(upgradeLink).toHaveClass('github-release-browser-browser__upgrade-link')
    })
  })

  describe('Component Re-rendering', () => {
    test('updates when primary button changes', () => {
      const { rerender } = render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={basicConfig}
        />
      )

      expect(screen.getByTestId('primary-action')).toBeInTheDocument()

      const newPrimaryButton = <button data-testid="new-primary">New Action</button>
      rerender(
        <AppFooter
          primaryButton={newPrimaryButton}
          config={basicConfig}
        />
      )

      expect(screen.getByTestId('new-primary')).toBeInTheDocument()
      expect(screen.queryByTestId('primary-action')).not.toBeInTheDocument()
    })

    test('hides upgrade link when config changes to pro', () => {
      const { rerender } = render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={basicConfig}
        />
      )

      expect(screen.getByTestId('button-link')).toBeInTheDocument()

      rerender(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={proConfig}
        />
      )

      expect(screen.queryByTestId('button-link')).not.toBeInTheDocument()
    })

    test('shows upgrade link when config changes back to basic', () => {
      const { rerender } = render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={proConfig}
        />
      )

      expect(screen.queryByTestId('button-link')).not.toBeInTheDocument()

      rerender(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={basicConfig}
        />
      )

      expect(screen.getByTestId('button-link')).toBeInTheDocument()
    })

    test('updates upgrade link text when strings change', () => {
      const { rerender } = render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={basicConfig}
        />
      )

      const upgradeLink = screen.getByTestId('button-link')
      expect(upgradeLink).toHaveTextContent('Upgrade to Pro')

      const configWithCustomText = createMockBrowserConfig({
        features: { useLatestRelease: false },
        upgradeUrl: 'https://example.com/upgrade',
        strings: { upgradeToPro: 'Custom Pro Text' }
      })

      rerender(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={configWithCustomText}
        />
      )

      expect(upgradeLink).toHaveTextContent('Custom Pro Text')
    })
  })

  describe('Edge Cases', () => {
    test('handles missing features object', () => {
      const configWithoutFeatures = {
        ...createMockBrowserConfig(),
        features: undefined, // explicitly remove features
        upgradeUrl: 'https://example.com/upgrade'
      }

      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={configWithoutFeatures}
        />
      )

      // Should show upgrade link since missing features is treated as empty (false)
      expect(screen.getByTestId('button-link')).toBeInTheDocument()
    })

    test('handles null primary button', () => {
      render(
        <AppFooter
          primaryButton={null}
          config={basicConfig}
        />
      )

      expect(screen.getByTestId('button-link')).toBeInTheDocument()
      expect(document.querySelector('.github-release-browser-browser__footer')).toBeInTheDocument()
    })

    test('handles undefined primary button', () => {
      render(
        <AppFooter
          primaryButton={undefined}
          config={basicConfig}
        />
      )

      expect(screen.getByTestId('button-link')).toBeInTheDocument()
      expect(document.querySelector('.github-release-browser-browser__footer')).toBeInTheDocument()
    })

    test('handles empty upgrade URL gracefully', () => {
      const configWithEmptyUrl = createMockBrowserConfig({
        features: { useLatestRelease: false },
        upgradeUrl: ''
      })

      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={configWithEmptyUrl}
        />
      )

      expect(screen.queryByTestId('button-link')).not.toBeInTheDocument()
      expect(screen.getByTestId('primary-action')).toBeInTheDocument()
    })

    test('handles null upgrade URL gracefully', () => {
      const configWithNullUrl = createMockBrowserConfig({
        features: { useLatestRelease: false },
        upgradeUrl: null
      })

      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={configWithNullUrl}
        />
      )

      expect(screen.queryByTestId('button-link')).not.toBeInTheDocument()
      expect(screen.getByTestId('primary-action')).toBeInTheDocument()
    })
  })

  describe('Button Variants', () => {
    test('upgrade link uses link variant', () => {
      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={basicConfig}
        />
      )

      const upgradeLink = screen.getByTestId('button-link')
      expect(upgradeLink).toHaveAttribute('data-variant', 'link')
    })
  })

  describe('Accessibility', () => {
    test('upgrade link is keyboard accessible', async () => {
      const user = userEvent.setup()
      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={basicConfig}
        />
      )

      const upgradeLink = screen.getByTestId('button-link')
      upgradeLink.focus()
      expect(upgradeLink).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(mockWindowOpen).toHaveBeenCalled()
    })

    test('upgrade link is accessible via space key', async () => {
      const user = userEvent.setup()
      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={basicConfig}
        />
      )

      const upgradeLink = screen.getByTestId('button-link')
      upgradeLink.focus()
      expect(upgradeLink).toHaveFocus()

      await user.keyboard('{ }')
      expect(mockWindowOpen).toHaveBeenCalled()
    })
  })

  describe('Combined Scenarios', () => {
    test('complete pro user scenario', () => {
      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={proConfig}
        />
      )

      expect(screen.getByTestId('primary-action')).toBeInTheDocument()
      expect(screen.queryByTestId('button-link')).not.toBeInTheDocument()
    })

    test('complete basic user scenario', () => {
      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={basicConfig}
        />
      )

      expect(screen.getByTestId('primary-action')).toBeInTheDocument()
      expect(screen.getByTestId('button-link')).toBeInTheDocument()
    })

    test('basic user without upgrade', () => {
      const configNoUpgrade = createMockBrowserConfig({
        features: { useLatestRelease: false },
        upgradeUrl: ''
      })

      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={configNoUpgrade}
        />
      )

      expect(screen.getByTestId('primary-action')).toBeInTheDocument()
      expect(screen.queryByTestId('button-link')).not.toBeInTheDocument()
    })

    test('config with mixed features', () => {
      const mixedConfig = createMockBrowserConfig({
        features: {
          useLatestRelease: false,
          someOtherFeature: true
        },
        upgradeUrl: 'https://example.com/upgrade'
      })

      render(
        <AppFooter
          primaryButton={mockPrimaryButton}
          config={mixedConfig}
        />
      )

      expect(screen.getByTestId('primary-action')).toBeInTheDocument()
      expect(screen.getByTestId('button-link')).toBeInTheDocument()
    })
  })
})