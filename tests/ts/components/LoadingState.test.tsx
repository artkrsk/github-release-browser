import React from 'react'
import { render, screen } from '@testing-library/react'
import { LoadingState } from '@/components/LoadingState'
import { setupTestEnvironment } from '@test-utils'

describe('LoadingState', () => {
  beforeEach(() => {
    setupTestEnvironment()
  })

  it('should render with default message', () => {
    render(<LoadingState />)

    expect(screen.getByText('Loading repositories...')).toBeInTheDocument()
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('should render with custom message', () => {
    render(<LoadingState message="Custom loading message" />)

    expect(screen.getByText('Custom loading message')).toBeInTheDocument()
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('should render with custom className', () => {
    render(<LoadingState className="custom-class" />)

    expect(screen.getByText('Loading repositories...')).toBeInTheDocument()
    expect(screen.getByTestId('spinner')).toBeInTheDocument()

    // Check the wrapper has the custom class
    const wrapper = screen.getByText('Loading repositories...').parentElement
    expect(wrapper).toHaveClass('github-release-browser-browser__loading')
    expect(wrapper).toHaveClass('custom-class')
  })

  it('should render with both custom message and className', () => {
    render(<LoadingState message="Processing..." className="processing" />)

    expect(screen.getByText('Processing...')).toBeInTheDocument()
    expect(screen.getByTestId('spinner')).toBeInTheDocument()

    const wrapper = screen.getByText('Processing...').parentElement
    expect(wrapper).toHaveClass('github-release-browser-browser__loading')
    expect(wrapper).toHaveClass('processing')
  })

  it('should handle empty message', () => {
    render(<LoadingState message="" />)

    const wrapper = screen.getByTestId('spinner').parentElement
    expect(wrapper).toBeInTheDocument()
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('should handle long messages', () => {
    const longMessage = 'This is a very long loading message that might wrap to multiple lines and should still display correctly'
    render(<LoadingState message={longMessage} />)

    expect(screen.getByText(longMessage)).toBeInTheDocument()
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('should handle special characters in message', () => {
    const specialMessage = 'Loading with special chars: & < > " \''
    render(<LoadingState message={specialMessage} />)

    expect(screen.getByText(specialMessage)).toBeInTheDocument()
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('should handle multiple className values', () => {
    render(<LoadingState className="class1 class2 class3" />)

    expect(screen.getByText('Loading repositories...')).toBeInTheDocument()
    expect(screen.getByTestId('spinner')).toBeInTheDocument()

    const wrapper = screen.getByText('Loading repositories...').parentElement
    expect(wrapper).toHaveClass('github-release-browser-browser__loading')
    expect(wrapper).toHaveClass('class1')
    expect(wrapper).toHaveClass('class2')
    expect(wrapper).toHaveClass('class3')
  })

  it('should render spinner and message in correct order', () => {
    render(<LoadingState message="Test message" />)

    const wrapper = screen.getByText('Test message').parentElement
    const spinner = screen.getByTestId('spinner')
    const message = screen.getByText('Test message')

    expect(wrapper).toContainElement(spinner)
    expect(wrapper).toContainElement(message)
    expect(spinner.compareDocumentPosition(message) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(4)
  })

  it('should not add trailing spaces to className', () => {
    render(<LoadingState />)

    const wrapper = screen.getByText('Loading repositories...').parentElement
    expect(wrapper.className).toBe('github-release-browser-browser__loading')
  })

  it('should preserve message as paragraph text', () => {
    render(<LoadingState message="Test paragraph" />)

    const message = screen.getByText('Test paragraph')
    expect(message.tagName).toBe('P')
  })
})