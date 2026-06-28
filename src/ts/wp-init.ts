/**
 * WordPress auto-initialization script
 * Automatically mounts BrowserApp when the root element is found
 */

import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
import { BrowserApp } from './components/BrowserApp'

// Expose the component as the UMD default export so the global
// (window.ArtsGitHubReleaseBrowser) IS the BrowserApp component — host integrations
// can mount it themselves (e.g. inside a custom wp.media frame), in addition to the
// auto-mount side effect below. The UMD library is configured to expose the default
// export as the global, so a named export alone leaves the global undefined.
export default BrowserApp

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initBrowser)
} else {
	initBrowser()
}

function initBrowser() {
	const rootElement = document.getElementById('github-release-browser-root')
	const config = window.githubReleaseBrowserConfig

	if (!rootElement || !config) {
		// No root element or config found; do not initialize
		return
	}

	const root = createRoot(rootElement)
	root.render(
		createElement(BrowserApp, {
			config: {
				apiUrl: config.apiUrl,
				nonce: config.nonce,
				actionPrefix: config.actionPrefix,
				protocol: config.protocol,
				dirProtocol: config.dirProtocol,
				onSelectAsset: (asset) => {
					// Build URI based on selection type
					let uri: string
					if (asset.asset.isDirectory) {
						// Directory selection - asset.name already contains full github-dir:// URI
						uri = asset.asset.name
					} else {
						// Release asset - build github-release:// URI
						uri = `${config.protocol}${asset.repo}/${asset.release}/${asset.asset.name}`
					}

					// Set value in parent window input if exists
					if (window.parent && window.parent.document) {
						const input = window.parent.document.getElementById('github-asset-uri')
						if (input && 'value' in input) {
							input.value = uri
						}

						// Close the thickbox modal (WordPress media modal)
						if ('tb_remove' in window.parent && typeof window.parent.tb_remove === 'function') {
							;(window.parent.tb_remove as () => void)()
						}
					}

					console.log('Asset selected:', uri)
				},
				features: config.features,
				upgradeUrl: config.upgradeUrl,
				strings: config.strings,
				textDomain: config.textDomain,
			},
		})
	)
}
