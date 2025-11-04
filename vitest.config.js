import { defineConfig } from 'vitest/config'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    globals: true,

    // Coverage configuration
    coverage: {
      include: ['src/ts/**/*.{ts,tsx}'],
      exclude: [
        'src/ts/**/interfaces/*.ts',
        'src/ts/**/types/*.ts',
        'src/ts/**/constants/*.ts',
        'src/ts/index.ts',
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
