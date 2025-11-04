/**
 * Global type declarations for WordPress environment
 */

declare global {
  interface Window {
    wp: {
      element: typeof import('@wordpress/element')
      components: typeof import('@wordpress/components')
      i18n: typeof import('@wordpress/i18n')
    }
    ArtsGitHubReleaseBrowser: typeof import('./components/BrowserApp').BrowserApp
    githubReleaseBrowserConfig: {
      apiUrl: string
      nonce: string
      actionPrefix: string
      protocol: string
      features: Record<string, any>
      upgradeUrl: string
      strings?: Record<string, string>
      textDomain?: string
      settingsUrl?: string
    }
  }

  const wp: Window['wp']
}

export {}
