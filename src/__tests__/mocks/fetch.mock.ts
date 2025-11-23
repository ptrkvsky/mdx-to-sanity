import { vi } from "vitest";

export function createMockFetch(responseText: string, ok: boolean = true) {
	return vi.fn().mockResolvedValue({
		ok,
		text: vi.fn().mockResolvedValue(responseText),
		json: vi.fn().mockResolvedValue({}),
	} as unknown as Response);
}

export function createMockFetchError(errorMessage: string) {
	return vi.fn().mockRejectedValue(new Error(errorMessage));
}

export function createMockFetchWithStatus(
	responseText: string,
	status: number,
) {
	return vi.fn().mockResolvedValue({
		ok: status >= 200 && status < 300,
		status,
		statusText: "OK",
		text: vi.fn().mockResolvedValue(responseText),
		json: vi.fn().mockResolvedValue({}),
	} as unknown as Response);
}
