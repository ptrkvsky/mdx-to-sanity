import { vi } from "vitest";
export function createMockFetch(responseText, ok = true) {
    return vi.fn().mockResolvedValue({
        ok,
        text: vi.fn().mockResolvedValue(responseText),
        json: vi.fn().mockResolvedValue({}),
    });
}
export function createMockFetchError(errorMessage) {
    return vi.fn().mockRejectedValue(new Error(errorMessage));
}
export function createMockFetchWithStatus(responseText, status) {
    return vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        statusText: "OK",
        text: vi.fn().mockResolvedValue(responseText),
        json: vi.fn().mockResolvedValue({}),
    });
}
