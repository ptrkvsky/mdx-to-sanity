import { vi } from "vitest";

interface MockOpenAIResponse {
	content: string;
	metadata?: {
		translatedTitle?: string;
		description?: string;
		seoTitle?: string;
	};
}

export function createMockOpenAIResponse(
	content: string,
	metadata?: MockOpenAIResponse["metadata"],
): string {
	if (metadata) {
		return `===CONTENT===
${content}
===METADATA===
${JSON.stringify(metadata)}
===END===`;
	}
	return content;
}

export function createMockOpenAIFetch(
	responseContent: string,
	ok: boolean = true,
) {
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
	} as unknown as Response);
}

export function createMockOpenAIFetchError(errorMessage: string) {
	return vi.fn().mockRejectedValue(new Error(errorMessage));
}

