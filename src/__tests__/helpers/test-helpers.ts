import type { Context } from "hono";
import type {
	Article,
	ArticleEnrichi,
} from "../../domain/entities.js";
import type {
	FileRepository,
	Logger,
	Scraper,
	MarkdownTransformerWithSEO,
	ArticleEnrichiService,
	MarkdownFormatter,
} from "../../domain/services.js";
import { vi } from "vitest";

export function createMockScraper(
	mockArticle?: Article,
): Scraper {
	return {
		scrape: vi.fn().mockResolvedValue(
			mockArticle || {
				title: "Test Article",
				content: "Test content",
				date: "2025-01-23",
			},
		),
	};
}

export function createMockMarkdownTransformerWithSEO(
	mockMarkdown?: string,
): MarkdownTransformerWithSEO {
	return {
		transformToMarkdownWithSEO: vi
			.fn()
			.mockResolvedValue(
				mockMarkdown ||
					"---\ntitle: Test\n---\n\n# Test Content",
			),
	};
}

export function createMockArticleEnrichiService(
	mockArticleEnrichi?: ArticleEnrichi,
): ArticleEnrichiService {
	return {
		enrichArticle: vi.fn().mockResolvedValue(
			mockArticleEnrichi || {
				title: "Test Article",
				content: "Test content",
				date: "2025-01-23",
				metadata: {
					title: "Test Article",
					description: "Test description",
					date: "2025-01-23",
					readingTime: 1,
					wordCount: 2,
				},
			},
		),
	};
}

export function createMockMarkdownFormatter(
	mockMarkdown?: string,
): MarkdownFormatter {
	return {
		formatMarkdown: vi
			.fn()
			.mockReturnValue(
				mockMarkdown ||
					"---\ntitle: Test\n---\n\n# Test Content",
			),
	};
}

export function createMockFileRepository(): FileRepository {
	return {
		saveMarkdown: vi.fn().mockResolvedValue(undefined),
	};
}

export function createMockHonoContext(
	body?: unknown,
	method: string = "POST",
): Context {
	const req = {
		json: vi.fn().mockResolvedValue(body || {}),
	} as unknown as Request;

	let responseStatus = 200;
	const responseHeaders = new Headers();

	const c = {
		req,
		json: vi.fn((data: unknown, status?: number) => {
			if (status !== undefined) {
				responseStatus = status;
			}
			return {
				status: responseStatus,
				headers: responseHeaders,
				json: vi.fn().mockResolvedValue(data),
			} as unknown as Response;
		}),
		text: vi.fn((data: string, status?: number, headers?: HeadersInit) => {
			if (status !== undefined) {
				responseStatus = status;
			}
			if (headers) {
				Object.entries(headers).forEach(([key, value]) => {
					responseHeaders.set(key, value as string);
				});
			}
			return {
				status: responseStatus,
				headers: responseHeaders,
				text: vi.fn().mockResolvedValue(data),
			} as unknown as Response;
		}),
		status: vi.fn().mockReturnThis(),
	} as unknown as Context;

	return c;
}

export function createMockLogger(): Logger {
	return {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	};
}

