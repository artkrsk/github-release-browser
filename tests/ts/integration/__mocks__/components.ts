/**
 * Shared Component Mocks Reference for Integration Tests
 *
 * **Purpose**: This file serves as the reference implementation for component mocks
 * used in BrowserApp integration tests. Due to Vitest's hoisting behavior, these
 * mocks cannot be directly imported into test files and must be inlined within
 * vi.hoisted() blocks.
 *
 * **Why Inline Mocks Are Required**:
 * Vitest hoists vi.mock() calls to the top of the file, before any imports execute.
 * This means imported mock functions aren't available when vi.mock factories run.
 * The solution is to use vi.hoisted() with inline mock definitions that use
 * require('react') instead of ES imports.
 *
 * **Usage Pattern** (copy into test files):
 * ```typescript
 * const componentMocks = vi.hoisted(() => {
 *   const React = require('react')
 *   const h = React.createElement
 *   return {
 *     LoadingState: ({ message }: { message: string }) => h('div', { 'data-testid': 'loading-state' }, message),
 *     // ... other mocks from createComponentMocks below
 *   }
 * })
 *
 * vi.mock('@/components/LoadingState', () => ({ LoadingState: componentMocks.LoadingState }))
 * // ... etc
 * ```
 *
 * **Available Mocks**:
 * - LoadingState: Shows message with data-testid="loading-state"
 * - ErrorState: Shows error + retry button with data-testid="error-state"
 * - RepositorySearch: Search input + refresh button
 * - RepositoryList: Repo buttons with data-testid="repo-{id}"
 * - AssetsView: Selected repo display + back/refresh buttons
 * - AppFooter: Primary button slot + upgrade link
 * - SourceModeToggle: Releases/Directory toggle buttons
 * - DirectoryView: Branch/path display + navigation buttons
 *
 * @see tests/ts/integration/__helpers__/browser-app-factories.ts - State factories
 */

/**
 * Creates all component mocks. This is the reference implementation.
 * Due to Vitest hoisting limitations, this function cannot be directly
 * used in test files - copy the pattern into vi.hoisted() blocks instead.
 */
export function createComponentMocks() {
  const React = require('react')
  const h = React.createElement

  return {
    LoadingState: ({ message }: { message: string }) =>
      h('div', { 'data-testid': 'loading-state' }, message),

    ErrorState: ({ error, onRetry }: { error: string; onRetry: () => void }) =>
      h('div', { 'data-testid': 'error-state' },
        h('div', { 'data-testid': 'error-message' }, error),
        h('button', { onClick: onRetry, 'data-testid': 'retry-button' }, 'Retry')
      ),

    RepositorySearch: ({ searchQuery, onSearchChange, onRefresh, refreshDisabled }: any) =>
      h('div', { 'data-testid': 'repository-search' },
        h('input', {
          'data-testid': 'search-input',
          value: searchQuery || '',
          onChange: (e: any) => onSearchChange(e.target.value),
          placeholder: 'Search repositories...'
        }),
        h('button', {
          'data-testid': 'refresh-button',
          onClick: onRefresh,
          disabled: refreshDisabled
        }, 'Refresh')
      ),

    RepositoryList: ({ repos, onRepoToggle }: any) =>
      h('div', { 'data-testid': 'repository-list' },
        repos && repos.length > 0
          ? repos.map((repo: any) =>
              h('div', { key: repo.id },
                h('button', {
                  onClick: () => onRepoToggle(repo.full_name),
                  'data-testid': `repo-${repo.id}`
                }, repo.name)
              )
            )
          : h('div', { 'data-testid': 'no-repos' }, 'No repositories')
      ),

    AssetsView: ({ selectedRepo, onBack, onRefresh }: any) =>
      h('div', { 'data-testid': 'assets-view' },
        h('div', { 'data-testid': 'selected-repo' }, selectedRepo),
        h('button', { onClick: onBack, 'data-testid': 'back-button' }, 'Back'),
        onRefresh && h('button', { onClick: onRefresh, 'data-testid': 'assets-refresh' }, 'Refresh')
      ),

    AppFooter: ({ primaryButton, config }: any) =>
      h('div', { 'data-testid': 'app-footer' },
        primaryButton,
        config?.upgradeUrl && h('a', { href: config.upgradeUrl, 'data-testid': 'upgrade-link' }, 'Upgrade')
      ),

    SourceModeToggle: ({ mode, onModeChange, disabled }: any) =>
      h('div', { 'data-testid': 'source-mode-toggle' },
        h('button', {
          'data-testid': 'toggle-releases',
          onClick: () => onModeChange('releases'),
          disabled,
          'data-active': mode === 'releases'
        }, 'Releases'),
        h('button', {
          'data-testid': 'toggle-directory',
          onClick: () => onModeChange('directory'),
          disabled,
          'data-active': mode === 'directory'
        }, 'Directory')
      ),

    DirectoryView: ({ selectedRepo, selectedBranch, currentPath, onBack, onSelectBranch, onNavigate, onRefresh }: any) =>
      h('div', { 'data-testid': 'directory-view' },
        h('div', { 'data-testid': 'directory-selected-repo' }, selectedRepo),
        h('div', { 'data-testid': 'directory-selected-branch' }, selectedBranch),
        h('div', { 'data-testid': 'directory-current-path' }, currentPath),
        h('button', { onClick: onBack, 'data-testid': 'directory-back-button' }, 'Back'),
        h('button', { onClick: () => onSelectBranch('develop'), 'data-testid': 'directory-change-branch' }, 'Change Branch'),
        h('button', { onClick: () => onNavigate('src/components'), 'data-testid': 'directory-navigate' }, 'Navigate'),
        onRefresh && h('button', { onClick: onRefresh, 'data-testid': 'directory-refresh' }, 'Refresh')
      )
  }
}
