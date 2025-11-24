import { vi } from "vitest";
export function createMockOpenAIResponse(content, metadata) {
    if (metadata) {
        return `===CONTENT===
${content}
===METADATA===
${JSON.stringify(metadata)}
===END===`;
    }
    return content;
}
export function createMockOpenAIFetch(responseContent, ok = true) {
    return vi.fn().mockResolvedValue({
        ok,
        status: ok ? 200 : 500,
        statusText: ok ? "OK" : "Internal Server Error",
        json: vi.fn().mockResolvedValue({
            choices: [
                {
                    message: {
                        content: responseContent,
                    },
                },
            ],
        }),
    });
}
export function createMockOpenAIFetchError(errorMessage) {
    return vi.fn().mockRejectedValue(new Error(errorMessage));
}
