import { describe, test, expect, vi } from 'vitest'
import { render } from '@test-utils'
import { SourceModeToggle } from '@/components/SourceModeToggle'
import { TSourceMode } from '@/types'

describe('SourceModeToggle', () => {
  const mockOnModeChange = vi.fn()

  const defaultProps = {
    mode: 'releases' as TSourceMode,
    onModeChange: mockOnModeChange
  }

  describe('Rendering', () => {
    test('renders without crashing', () => {
      const { container } = render(<SourceModeToggle {...defaultProps} />)

      expect(container).toBeInTheDocument()
    })

    test('renders wrapper div with correct class', () => {
      render(<SourceModeToggle {...defaultProps} />)

      const wrapper = document.querySelector('.github-release-browser-source-toggle')
      expect(wrapper).toBeInTheDocument()
    })

    test('renders with releases mode', () => {
      render(<SourceModeToggle {...defaultProps} mode="releases" />)

      const wrapper = document.querySelector('.github-release-browser-source-toggle')
      expect(wrapper).toBeInTheDocument()
    })

    test('renders with directory mode', () => {
      render(<SourceModeToggle {...defaultProps} mode="directory" />)

      const wrapper = document.querySelector('.github-release-browser-source-toggle')
      expect(wrapper).toBeInTheDocument()
    })

    test('renders when disabled', () => {
      render(<SourceModeToggle {...defaultProps} disabled={true} />)

      const wrapper = document.querySelector('.github-release-browser-source-toggle')
      expect(wrapper).toBeInTheDocument()
    })

    test('renders when not disabled', () => {
      render(<SourceModeToggle {...defaultProps} disabled={false} />)

      const wrapper = document.querySelector('.github-release-browser-source-toggle')
      expect(wrapper).toBeInTheDocument()
    })

    test('has toggle control with correct class', () => {
      render(<SourceModeToggle {...defaultProps} />)

      const control = document.querySelector('.github-release-browser-source-toggle__control')
      expect(control).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    test('accepts mode prop', () => {
      const { rerender } = render(<SourceModeToggle {...defaultProps} mode="releases" />)
      expect(document.querySelector('.github-release-browser-source-toggle')).toBeInTheDocument()

      rerender(<SourceModeToggle {...defaultProps} mode="directory" />)
      expect(document.querySelector('.github-release-browser-source-toggle')).toBeInTheDocument()
    })

    test('accepts disabled prop', () => {
      const { rerender } = render(<SourceModeToggle {...defaultProps} disabled={false} />)
      expect(document.querySelector('.github-release-browser-source-toggle')).toBeInTheDocument()

      rerender(<SourceModeToggle {...defaultProps} disabled={true} />)
      expect(document.querySelector('.github-release-browser-source-toggle')).toBeInTheDocument()
    })

    test('accepts onModeChange callback', () => {
      const customCallback = vi.fn()
      render(<SourceModeToggle {...defaultProps} onModeChange={customCallback} />)

      expect(document.querySelector('.github-release-browser-source-toggle')).toBeInTheDocument()
    })
  })
})
