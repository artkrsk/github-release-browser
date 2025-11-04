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

/** Mock WordPress globals */
global.wp = {
  i18n: {
    __: vi.fn((text: string) => text) // Simple passthrough for testing
  },
  element: {
    ...React,
    render: vi.fn()
  },
  components: {
    Card: ({ children, className, onClick, ...props }: any) =>
      React.createElement('div', {
        className: `wp-card ${className || ''}`,
        onClick,
        role: 'button',
        tabIndex: 0,
        ...props
      }, children),
    CardBody: ({ children, className, ...props }: any) =>
      React.createElement('div', {
        className: `wp-card-body ${className || ''}`,
        ...props
      }, children),
    Button: ({ children, variant, onClick, icon, disabled, label, className, ...props }: any) =>
      React.createElement(
        'button',
        {
          onClick,
          disabled,
          'aria-label': label,
          className: `wp-button wp-button-${variant || 'primary'} ${className || ''}`,
          title: label,
          'data-testid': variant ? `button-${variant}` : 'button-primary',
          'data-variant': variant || null,
          ...props
        },
        [
          icon && React.createElement('span', { key: 'icon', className: `dashicons dashicons-${icon}` }),
          children
        ]
      ),
    Spinner: () => React.createElement('div', {
      className: 'wp-spinner',
      'data-testid': 'spinner',
      'aria-label': 'Loading'
    }),
    Panel: ({ children, className, ...props }: any) => React.createElement('div', {
      className: `wp-panel ${className || ''}`,
      role: 'region',
      ...props
    }, children),
    PanelBody: ({ children, title, opened, onToggle, className, ...props }: any) =>
      React.createElement('div', {
        className: `wp-panel-body ${className || ''}`,
        ...props
      }, [
        React.createElement(
          'button',
          {
            key: 'title',
            onClick: onToggle,
            className: 'wp-panel-body__toggle',
            'aria-expanded': opened ? 'true' : 'false',
            'data-testid': 'panel-toggle'
          },
          title
        ),
        opened && React.createElement('div', {
          key: 'content',
          className: 'wp-panel-body__content',
          'data-testid': 'panel-content'
        }, children)
      ]),
    SearchControl: ({ value, onChange, placeholder, className, ...props }: any) =>
      React.createElement('input', {
        type: 'search',
        value: value || '',
        onChange: (e: any) => onChange && onChange(e.target.value),
        placeholder,
        className: `wp-search-control ${className || ''}`,
        'data-testid': 'search-control',
        ...props
      })
  }
}
