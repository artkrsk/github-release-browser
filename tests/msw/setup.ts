import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { handlers } from './handlers'

/**
 * MSW Server Setup for Vitest
 *
 * This file initializes Mock Service Worker (MSW) for integration testing.
 * MSW intercepts network requests at the network level, providing realistic
 * API mocking without modifying application code.
 */

/** MSW server instance */
export const server = setupServer(...handlers)

/** Start MSW server before all tests */
beforeAll(() => {
	server.listen({
		onUnhandledRequest: 'warn' // Warn about unhandled requests instead of erroring
	})
})

/** Reset request handlers after each test to ensure test isolation */
afterEach(() => {
	server.resetHandlers()
})

/** Clean up after all tests */
afterAll(() => {
	server.close()
})
