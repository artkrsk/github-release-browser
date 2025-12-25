/**
 * Development-specific configuration overrides for `@arts/github-release-browser`.
 * @param {Object} baseConfig - The base configuration object
 * @returns {Object} - Modified configuration for development
 */
export default function (baseConfig) {
  // Create a deep copy to avoid modifying the original
  const config = JSON.parse(JSON.stringify(baseConfig))

  // Set environment
  config.currentEnvironment = 'development'

  // Development-specific settings
  config.build.sourcemap = false
  config.build.minify = false

  // Configure Sass for development (no sourcemap to avoid triggering PHP watcher)
  config.sass.options.sourceMap = false
  config.sass.options.outputStyle = 'expanded'

  // Disable TS sourcemaps too (avoid triggering watchers)
  config.build.sourcemap = false

  // Configure live reload for development
  config.liveReload.enabled = true
  config.liveReload.logLevel = 'debug'
  config.liveReload.reloadOnRestart = true

  // Disable PHP syncing for wp-env development (re-enable when working on EDD projects)
  config.wordpress.targets = []

  // Configure WordPress plugin target
  config.wordpressPlugin.target = null

  config.wordpressPlugin.debug = true

  // Enable debug logging
  config.wordpress.debug = true

  return config
}
