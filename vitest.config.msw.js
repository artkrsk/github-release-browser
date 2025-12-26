import { defineConfig } from 'vitest/config'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Vitest Configuration for MSW-Enhanced Integration Tests
 *
 * This config is separate from the main vitest.config.js to:
 * 1. Include MSW server setup without affecting fast unit tests
 * 2. Use different test pattern (*.msw.test.{ts,tsx})
 * 3. Allow longer timeouts for network simulation
 * 4. Run MSW tests independently for better isolation
 */
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: [
      'tests/setup.ts',      // Standard test setup (WordPress mocks)
      'tests/msw/setup.ts'   // MSW server initialization
    ],
    globals: true,

    /** Longer timeout for MSW tests (network simulation) */
    testTimeout: 5000,

    /** Only run MSW-enhanced tests */
    include: ['tests/ts/**/*.msw.test.{ts,tsx}'],

    /** Coverage configuration (same as main config) */
    coverage: {
      include: ['src/ts/**/*.{ts,tsx}'],
      exclude: [
        'src/ts/**/interfaces/*.ts',
        'src/ts/**/types/*.ts',
        'src/ts/**/constants/*.ts',
        'src/ts/index.ts',
        'src/ts/wp-init.ts',
        'node_modules/',
        '**/*.d.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/ts'),
      '@interfaces': resolve(__dirname, 'src/ts/core/interfaces'),
      '@types': resolve(__dirname, 'src/core/types'),
      '@constants': resolve(__dirname, 'src/ts/core/constants'),
      '@/test-utils': resolve(__dirname, 'tests/test-utils'),
      '@test-utils': resolve(__dirname, 'tests/test-utils')
    }
  }
})
