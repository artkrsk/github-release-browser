import { describe, test, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BranchSelector } from '@/components/BranchSelector'
import { render } from '@test-utils'
import { IBranch } from '@/interfaces'

describe('BranchSelector', () => {
  const mockBranches: IBranch[] = [
    { name: 'main', commit: { sha: 'abc123', url: 'https://...' }, protected: false },
    { name: 'develop', commit: { sha: 'def456', url: 'https://...' }, protected: false },
    { name: 'feature/test', commit: { sha: 'ghi789', url: 'https://...' }, protected: false }
  ]

  const mockOnSelectBranch = vi.fn()

  const defaultProps = {
    branches: mockBranches,
    selectedBranch: 'main',
    onSelectBranch: mockOnSelectBranch
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    test('renders select control with branches', () => {
      render(<BranchSelector {...defaultProps} />)

      const select = screen.getByTestId('select-control')
      expect(select).toBeInTheDocument()
    })

    test('shows loading placeholder when no branches', () => {
      render(<BranchSelector {...defaultProps} branches={[]} loading={false} />)

      const select = screen.getByTestId('select-control')
      expect(select).toBeInTheDocument()
      const selectElement = select.querySelector('select')
      expect(selectElement).toHaveValue('')
    })

    test('marks default branch in label', () => {
      render(<BranchSelector {...defaultProps} defaultBranch="main" />)

      const select = screen.getByTestId('select-control')
      const mainOption = select.querySelector('option[value="main"]')
      expect(mainOption).toHaveTextContent('main (default)')
    })

    test('renders branches without default marker when no defaultBranch', () => {
      render(<BranchSelector {...defaultProps} />)

      const select = screen.getByTestId('select-control')
      const mainOption = select.querySelector('option[value="main"]')
      expect(mainOption).toHaveTextContent('main')
    })

    test('disables control when loading', () => {
      render(<BranchSelector {...defaultProps} loading={true} />)

      const select = screen.getByTestId('select-control')
      const selectElement = select.querySelector('select')
      expect(selectElement).toBeDisabled()
    })

    test('disables control when no branches', () => {
      render(<BranchSelector {...defaultProps} branches={[]} />)

      const select = screen.getByTestId('select-control')
      const selectElement = select.querySelector('select')
      expect(selectElement).toBeDisabled()
    })
  })

  describe('Interactions', () => {
    test('calls onSelectBranch when branch is selected', async () => {
      const user = userEvent.setup()
      render(<BranchSelector {...defaultProps} />)

      const select = screen.getByTestId('select-control').querySelector('select')!
      await user.selectOptions(select, 'develop')

      expect(mockOnSelectBranch).toHaveBeenCalledWith('develop')
    })

    test('updates selected value when prop changes', () => {
      const { rerender } = render(<BranchSelector {...defaultProps} />)

      let select = screen.getByTestId('select-control').querySelector('select')!
      expect(select).toHaveValue('main')

      rerender(<BranchSelector {...defaultProps} selectedBranch="develop" />)

      select = screen.getByTestId('select-control').querySelector('select')!
      expect(select).toHaveValue('develop')
    })
  })

  describe('Edge Cases', () => {
    test('handles empty branches array', () => {
      render(<BranchSelector {...defaultProps} branches={[]} />)

      const select = screen.getByTestId('select-control')
      expect(select).toBeInTheDocument()
    })

    test('handles branch names with special characters', () => {
      const specialBranches: IBranch[] = [
        { name: 'feature/my-feature', commit: { sha: '123', url: '' }, protected: false },
        { name: 'release-v1.0', commit: { sha: '456', url: '' }, protected: false }
      ]

      render(<BranchSelector {...defaultProps} branches={specialBranches} />)

      const select = screen.getByTestId('select-control')
      const featureOption = select.querySelector('option[value="feature/my-feature"]')
      expect(featureOption).toHaveTextContent('feature/my-feature')
    })
  })
})
