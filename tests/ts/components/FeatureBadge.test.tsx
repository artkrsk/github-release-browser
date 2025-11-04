import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { screen, render } from '@testing-library/react'
import { FeatureBadge } from '@/components/FeatureBadge'

describe('FeatureBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    test('renders with feature text', () => {
      render(<FeatureBadge feature="Pro" />)

      const badge = screen.getByText('Pro')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('github-release-browser-pro-badge')
    })

    test('renders with custom className', () => {
      render(<FeatureBadge feature="Premium" className="custom-class" />)

      const badge = screen.getByText('Premium')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('github-release-browser-pro-badge')
      expect(badge).toHaveClass('custom-class')
    })

    test('renders with default className when none provided', () => {
      render(<FeatureBadge feature="Basic" />)

      const badge = screen.getByText('Basic')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('github-release-browser-pro-badge')
    })
  })

  describe('Different Feature Texts', () => {
    test('handles multiple word features', () => {
      render(<FeatureBadge feature="Enterprise Plus" />)

      const badge = screen.getByText('Enterprise Plus')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('github-release-browser-pro-badge')
    })

    test('renders with various feature names', () => {
      const features = [
        'Pro',
        'Premium',
        'Advanced',
        'Enterprise',
        'Beta',
        'Alpha'
      ]

      features.forEach(feature => {
        const { unmount } = render(<FeatureBadge feature={feature} />)
        expect(screen.getByText(feature)).toBeInTheDocument()
        unmount()
      })
    })

    test('handles special characters in feature text', () => {
      render(<FeatureBadge feature="Pro & Advanced" />)

      const badge = screen.getByText('Pro & Advanced')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('github-release-browser-pro-badge')
    })

    test('renders with special characters variations', () => {
      const specialFeatures = [
        'Pro+',
        'Premium v2.0',
        'Advanced-Features',
        'Enterprise_Plans',
        'Alpha-Testing'
      ]

      specialFeatures.forEach(feature => {
        const { unmount } = render(<FeatureBadge feature={feature} />)
        expect(screen.getByText(feature)).toBeInTheDocument()
        unmount()
      })
    })

    test('handles numeric feature values', () => {
      render(<FeatureBadge feature="2024" />)

      const badge = screen.getByText('2024')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('github-release-browser-pro-badge')
    })
  })

  describe('Component Structure', () => {
    test('renders as span element', () => {
      render(<FeatureBadge feature="Pro" />)

      const badge = screen.getByText('Pro')
      expect(badge.tagName).toBe('SPAN')
    })

    test('handles additional props gracefully', () => {
      expect(() => {
        render(<FeatureBadge feature="Test" data-unsupported="test" />)
      }).not.toThrow()
    })
  })

  describe('ClassName Handling', () => {
    test('preserves multiple classes when provided', () => {
      render(<FeatureBadge feature="Pro" className="class1 class2 class3" />)

      const badge = screen.getByText('Pro')
      expect(badge).toHaveClass('github-release-browser-pro-badge')
      expect(badge).toHaveClass('class1')
      expect(badge).toHaveClass('class2')
      expect(badge).toHaveClass('class3')
    })

    test('does not add trailing spaces to className', () => {
      render(<FeatureBadge feature="Pro" />)

      const badge = screen.getByText('Pro')
      expect(badge.className).toBe('github-release-browser-pro-badge')
    })

    test('handles spaces in className correctly', () => {
      render(<FeatureBadge feature="Pro" className="spaced class" />)

      const badge = screen.getByText('Pro')
      expect(badge).toHaveClass('github-release-browser-pro-badge')
      expect(badge).toHaveClass('spaced')
      expect(badge).toHaveClass('class')
    })
  })

  describe('Parent Context', () => {
    test('works when wrapped in other components', () => {
      render(
        <div className="parent-wrapper">
          <FeatureBadge feature="Nested" />
        </div>
      )

      const badge = screen.getByText('Nested')
      expect(badge.closest('.parent-wrapper')).toBeInTheDocument()
      expect(screen.getByText('Nested')).toBeInTheDocument()
    })

    test('works inside React fragments', () => {
      render(
        <>
          <span>Before</span>
          <FeatureBadge feature="Fragment" />
          <span>After</span>
        </>
      )

      expect(screen.getByText('Before')).toBeInTheDocument()
      expect(screen.getByText('Fragment')).toBeInTheDocument()
      expect(screen.getByText('After')).toBeInTheDocument()
    })
  })

  describe('Event Handling', () => {
    test('handles click events gracefully', () => {
      const mockClick = vi.fn()

      expect(() => {
        render(<FeatureBadge feature="Clickable" onClick={mockClick} />)
      }).not.toThrow()
    })
  })
})
