import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  prettier,
  {
    ignores: [
      'node_modules/',
      'dist/',
      'coverage/',
      '__e2e__/',
      '__tests__/',
      '__build__/',
      'vendor/',
      'src/ts/www',
      'src/php',
      'src/wordpress-plugin',
      '*.config.*'
    ]
  },
  {
    // Add config/*.js files to the Node.js environment settings
    files: ['*.config.js', 'config/**/*.js', 'vite.config.js', '__builder__/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        URL: 'readonly' // Added URL global for new URL() constructor
      }
    },
    rules: {
      'no-console': 'off' // Allow console logs in build configuration files
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        wp: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly'
      }
    },
    rules: {
      'no-console': 'warn'
    }
  }
)
