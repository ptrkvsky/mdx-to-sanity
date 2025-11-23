import { vi, beforeEach, afterEach } from "vitest";

/**
 * Helper pour mocker console.log et console.error dans les tests
 * Utilisez beforeEach et afterEach pour activer/désactiver les mocks
 */
export function setupConsoleMocks() {
	const originalLog = console.log;
	const originalError = console.error;

	beforeEach(() => {
		console.log = vi.fn();
		console.error = vi.fn();
	});

	afterEach(() => {
		console.log = originalLog;
		console.error = originalError;
	});
}

