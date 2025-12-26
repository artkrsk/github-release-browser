/**
 * Centralized WordPress Component Mocks
 * Single source of truth for WordPress component mocks used across all tests.
 * If @wordpress/components API changes, update only this file.
 */
import React from 'react'

export const mockWordPressComponents = {
	Button: ({ children, onClick, disabled, variant, icon, label, className, ...props }: any) => (
		<button
			onClick={onClick}
			disabled={disabled}
			aria-label={label}
			title={label}
			data-variant={variant || 'default'}
			className={`wp-button wp-button-${variant || 'default'} ${className || ''}`}
			data-testid={`button-${variant || 'default'}`}
			{...props}
		>
			{icon && <span className={`dashicons dashicons-${icon}`} />}
			{children}
		</button>
	),

	SearchControl: ({ value, onChange, placeholder, className, __next40pxDefaultSize, __nextHasNoMarginBottom, hideLabelFromVision, ...props }: any) => (
		<input
			type="search"
			value={value || ''}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			className={`wp-search-control ${className || ''}`}
			data-testid="search-control"
			{...props}
		/>
	),

	Card: ({ children, className, onClick, ...props }: any) => (
		<div
			className={`wp-card ${className || ''}`}
			onClick={onClick}
			role="button"
			tabIndex={0}
			data-testid={className?.includes('latest') ? 'latest-release-card' : 'release-card'}
			{...props}
		>
			{children}
		</div>
	),

	CardBody: ({ children, className, ...props }: any) => (
		<div className={`wp-card-body ${className || ''}`} data-testid="card-body" {...props}>
			{children}
		</div>
	),

	Panel: ({ children, className, ...props }: any) => (
		<div role="region" className={`wp-panel ${className || ''}`} data-testid="panel" {...props}>
			{children}
		</div>
	),

	PanelBody: ({ children, title, opened, onToggle, className, ...props }: any) => (
		<div className={`wp-panel-body ${className || ''}`} data-testid="panel-body">
			<button
				onClick={onToggle}
				aria-expanded={opened}
				className="wp-panel-body__toggle"
				data-testid="panel-toggle"
			>
				{title}
			</button>
			{opened && (
				<div className="wp-panel-body__content" data-testid="panel-content">
					{children}
				</div>
			)}
		</div>
	),

	Spinner: ({ className, ...props }: any) => (
		<div
			className={`wp-spinner ${className || ''}`}
			data-testid="spinner"
			role="status"
			aria-label="Loading"
			{...props}
		>
			<span>⏳</span>
		</div>
	),

	SelectControl: ({ value, onChange, label, options, disabled, className, __next40pxDefaultSize, __nextHasNoMarginBottom, hideLabelFromVision, ...props }: any) => (
		<div className={`wp-select-control ${className || ''}`} data-testid="select-control">
			{label && <label>{label}</label>}
			<select
				value={value || ''}
				onChange={(e) => onChange && onChange(e.target.value)}
				disabled={disabled}
			>
				{options?.map((opt: any) => (
					<option key={opt.value} value={opt.value}>{opt.label}</option>
				))}
			</select>
		</div>
	),

	__experimentalToggleGroupControl: ({ value, onChange, children, className, disabled, isBlock, hideLabelFromVision, __next40pxDefaultSize, __nextHasNoMarginBottom, ...props }: any) => {
		// Filter out WordPress-specific props that aren't valid DOM attributes
		const { ...domProps } = props

		return (
			<div
				data-testid="toggle-group-control"
				data-value={value}
				className={`wp-toggle-group-control ${className || ''}`}
			>
				{children}
			</div>
		)
	},

	__experimentalToggleGroupControlOption: ({ value, label, ...props }: any) => (
		<button data-testid={`toggle-option-${value}`} data-value={value} {...props}>
			{label}
		</button>
	)
}
