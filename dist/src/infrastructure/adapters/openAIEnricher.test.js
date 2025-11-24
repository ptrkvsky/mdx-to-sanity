import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createOpenAIEnricher } from "./openAIEnricher.js";
import { mockArticle } from "../../__tests__/fixtures/articles.js";
import { createMockOpenAIFetch, createMockOpenAIFetchError, } from "../../__tests__/mocks/openai.mock.js";
describe("createOpenAIEnricher", () => {
    const originalFetch = global.fetch;
    const apiKey = "test-api-key";
    beforeEach(() => {
        global.fetch = originalFetch;
    });
    afterEach(() => {
        global.fetch = originalFetch;
    });
    it("should enrich article with metadata", async () => {
        // Arrange
        const metadataResponse = JSON.stringify({
            description: "Test description",
            tags: ["tag1", "tag2"],
            keywords: ["keyword1", "keyword2"],
            author: "Test Author",
            seoTitle: "SEO Title",
        });
        const contentResponse = "## Transformed Content\n\nTest content";
        global.fetch = vi
            .fn()
            .mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({
                choices: [{ message: { content: metadataResponse } }],
            }),
        })
            .mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({
                choices: [{ message: { content: contentResponse } }],
            }),
        });
        const enricher = createOpenAIEnricher(apiKey);
        // Act
        const result = await enricher.enrichArticle(mockArticle);
        // Assert
        expect(result.metadata).toBeDefined();
        expect(result.metadata.description).toBe("Test description");
        expect(result.metadata.tags).toEqual(["tag1", "tag2"]);
        expect(result.metadata.keywords).toEqual(["keyword1", "keyword2"]);
        expect(result.metadata.author).toBe("Test Author");
        expect(result.metadata.seoTitle).toBe("SEO Title");
        expect(result.metadata.readingTime).toBeGreaterThan(0);
        expect(result.metadata.wordCount).toBeGreaterThan(0);
    });
    it("should handle missing optional metadata", async () => {
        // Arrange
        const metadataResponse = JSON.stringify({
            description: "Test description",
        });
        const contentResponse = "## Content\n\nTest";
        global.fetch = vi
            .fn()
            .mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({
                choices: [{ message: { content: metadataResponse } }],
            }),
        })
            .mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({
                choices: [{ message: { content: contentResponse } }],
            }),
        });
        const enricher = createOpenAIEnricher(apiKey);
        // Act
        const result = await enricher.enrichArticle(mockArticle);
        // Assert
        expect(result.metadata.description).toBe("Test description");
        // Le code retourne [] au lieu de undefined pour tags/keywords
        expect(result.metadata.tags).toEqual([]);
        expect(result.metadata.keywords).toEqual([]);
        expect(result.metadata.author).toBeUndefined();
    });
    it("should use original content when OpenAI content transformation fails", async () => {
        // Arrange
        const metadataResponse = JSON.stringify({
            description: "Test description",
        });
        global.fetch = vi
            .fn()
            .mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({
                choices: [{ message: { content: metadataResponse } }],
            }),
        })
            .mockRejectedValueOnce(new Error("Content transformation failed"));
        const enricher = createOpenAIEnricher(apiKey);
        // Act
        const result = await enricher.enrichArticle(mockArticle);
        // Assert
        expect(result.content).toBe(mockArticle.content);
        expect(result.metadata.description).toBe("Test description");
    });
    it("should use original content when OpenAI metadata generation fails", async () => {
        // Arrange
        const contentResponse = "## Content\n\nTest";
        global.fetch = vi
            .fn()
            .mockRejectedValueOnce(new Error("Metadata generation failed"))
            .mockResolvedValueOnce({
            ok: true,
            json: vi.fn().mockResolvedValue({
                choices: [{ message: { content: contentResponse } }],
            }),
        });
        const enricher = createOpenAIEnricher(apiKey);
        // Act
        const result = await enricher.enrichArticle(mockArticle);
        // Assert
        expect(result.content).toContain("## Content");
        expect(result.metadata.description).toBe(mockArticle.title);
    });
    it("should handle API error response (non-ok status)", async () => {
        // Arrange
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 429,
            statusText: "Too Many Requests",
        });
        const enricher = createOpenAIEnricher(apiKey);
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => { });
        // Act
        const result = await enricher.enrichArticle(mockArticle);
        // Assert - L'erreur est capturée et loggée, mais le résultat est retourné avec les valeurs par défaut
        expect(result.metadata.description).toBe(mockArticle.title);
        expect(consoleErrorSpy).toHaveBeenCalledWith("OpenAI metadata generation failed:", expect.any(Error));
        consoleErrorSpy.mockRestore();
    });
});
