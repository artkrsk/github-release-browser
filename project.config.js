export default {
  name: 'github-release-browser',
  entry: './src/ts/index.ts',
  author: 'Artem Semkin',
  license: 'GPL-3.0-or-later',

  paths: {
    root: './',
    src: './src',
    dist: './dist',
    php: './src/php',
    styles: './src/styles',
    ts: './src/ts',
    wordpress: {
      plugin: './src/wordpress-plugin',
      languages: './src/wordpress-plugin/languages'
    },
    library: {
      base: 'libraries',
      name: 'github-release-browser',
      assets: 'src/php/libraries/github-release-browser'
    }
  },

  build: {
    formats: ['iife'],
    target: 'es2018',
    sourcemap: false,
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
      '@wordpress/element': 'wp.element',
      '@wordpress/components': 'wp.components',
      '@wordpress/i18n': 'wp.i18n'
    },
    umd: {
      name: 'ArtsGitHubReleaseBrowser',
      exports: 'named'
    },
    output: {
      iife: 'index.js'
    }
  },

  sass: {
    enabled: true,
    entry: './src/styles/index.sass',
    output: './dist/index.css',
    options: {
      sourceMap: false,
      outputStyle: 'compressed',
      includePaths: ['node_modules']
    }
  },

  wordpressPlugin: {
    enabled: false,
    source: './src/wordpress-plugin',
    extensions: ['.php', '.js', '.css', '.jsx', '.ts', '.tsx', '.json', '.txt', '.md'],
    target: null,
    debug: false,
    vendor: {
      source: './vendor',
      target: 'vendor',
      extensions: ['.php', '.js', '.css', '.json', '.txt', '.md'],
      delete: true,
      watch: true
    },
    packageName: 'github-release-browser',
    zipOutputName: 'github-release-browser.zip',
    packageExclude: [
      'node_modules',
      '.git',
      '.DS_Store',
      '**/.DS_Store',
      '.*',
      '**/.*',
      '*.log',
      '*.map',
      '*.zip',
      'package.json',
      'package-lock.json',
      'pnpm-lock.yaml',
      'yarn.lock',
      'README.md',
      'LICENSE',
      '.gitignore',
      '.editorconfig',
      '.eslintrc',
      '.prettierrc',
      'tsconfig.json',
      'vite.config.js',
      'vitest.config.js',
      'cypress.config.js',
      '__tests__',
      '__e2e__',
      'coverage',
      'dist'
    ],
    sourceFiles: {
      php: './src/php',
      vendor: './vendor',
      dist: {
        files: ['index.umd.js', 'index.mjs', 'chunk.*.js', 'index.css']
      },
      composer: ['composer.json', 'composer.lock']
    }
  },

  liveReload: {
    enabled: false,
    port: 3000,
    host: 'localhost',
    https: {
      key: '',
      cert: ''
    },
    injectChanges: true,
    reloadDebounce: 500,
    reloadThrottle: 1000,
    notify: {
      styles: {
        top: 'auto',
        bottom: '0',
        right: '0',
        left: 'auto',
        padding: '5px',
        borderRadius: '5px 0 0 0',
        fontSize: '12px'
      }
    },
    ghostMode: {
      clicks: false,
      forms: false,
      scroll: false
    },
    open: false,
    snippet: false
  },

  wordpress: {
    enabled: false,
    source: './src/php',
    extensions: ['.js', '.css', '.php', '.jsx', '.ts', '.tsx'],
    targets: [],
    debug: false
  },

  i18n: {
    enabled: false
  },

  watch: {
    ignored: ['node_modules/**', 'dist/**']
  }
}
