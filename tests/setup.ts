import React from 'react'
import { vi } from 'vitest'
import '@testing-library/jest-dom'

/** Make React global for JSX (WordPress pattern) */
global.React = React

/** TypeScript declarations for test globals */
declare global {
  var wp: any
  var React: typeof import('react')
}

/** Import centralized WordPress component mocks */
import { mockWordPressComponents } from './mocks/wordpress-components'

/** Mock WordPress globals */
global.wp = {
  i18n: {
    __: vi.fn((text: string) => text) // Simple passthrough for testing
  },
  element: {
    ...React,
    render: vi.fn()
  },
  components: mockWordPressComponents
}
