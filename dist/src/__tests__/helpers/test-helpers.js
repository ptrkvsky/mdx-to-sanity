import { vi } from "vitest";
export function createMockScraper(mockArticle) {
    return {
        scrape: vi.fn().mockResolvedValue(mockArticle || {
            title: "Test Article",
            content: "Test content",
            date: "2025-01-23",
        }),
    };
}
export function createMockMarkdownTransformerWithSEO(mockMarkdown) {
    return {
        transformToMarkdownWithSEO: vi
            .fn()
            .mockResolvedValue(mockMarkdown ||
            "---\ntitle: Test\n---\n\n# Test Content"),
    };
}
export function createMockArticleEnrichiService(mockArticleEnrichi) {
    return {
        enrichArticle: vi.fn().mockResolvedValue(mockArticleEnrichi || {
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
        }),
    };
}
export function createMockMarkdownFormatter(mockMarkdown) {
    return {
        formatMarkdown: vi
            .fn()
            .mockReturnValue(mockMarkdown ||
            "---\ntitle: Test\n---\n\n# Test Content"),
    };
}
export function createMockFileRepository() {
    return {
        saveMarkdown: vi.fn().mockResolvedValue(undefined),
    };
}
export function createMockHonoContext(body, method = "POST") {
    const req = {
        json: vi.fn().mockResolvedValue(body || {}),
    };
    let responseStatus = 200;
    const responseHeaders = new Headers();
    const c = {
        req,
        json: vi.fn((data, status) => {
            if (status !== undefined) {
                responseStatus = status;
            }
            return {
                status: responseStatus,
                headers: responseHeaders,
                json: vi.fn().mockResolvedValue(data),
            };
        }),
        text: vi.fn((data, status, headers) => {
            if (status !== undefined) {
                responseStatus = status;
            }
            if (headers) {
                Object.entries(headers).forEach(([key, value]) => {
                    responseHeaders.set(key, value);
                });
            }
            return {
                status: responseStatus,
                headers: responseHeaders,
                text: vi.fn().mockResolvedValue(data),
            };
        }),
        status: vi.fn().mockReturnThis(),
    };
    return c;
}
