import { describe, it, expect, vi } from "vitest";
import { enrichArticle } from "./enrichArticle.js";
import { mockArticle, mockArticleEnrichi } from "../../__tests__/fixtures/articles.js";
describe("enrichArticle", () => {
    it("should enrich article with metadata", async () => {
        // Arrange
        const mockEnricher = {
            enrichArticle: vi.fn().mockResolvedValue(mockArticleEnrichi),
        };
        // Act
        const enrichArticleWithMetadata = enrichArticle(mockEnricher);
        const result = await enrichArticleWithMetadata(mockArticle);
        // Assert
        expect(mockEnricher.enrichArticle).toHaveBeenCalledWith(mockArticle);
        expect(mockEnricher.enrichArticle).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockArticleEnrichi);
        expect(result.metadata).toBeDefined();
        expect(result.metadata.title).toBe(mockArticle.title);
        expect(result.metadata.description).toBeDefined();
    });
    it("should propagate error when enricher fails", async () => {
        // Arrange
        const error = new Error("Enrichment failed");
        const mockEnricher = {
            enrichArticle: vi.fn().mockRejectedValue(error),
        };
        // Act & Assert
        const enrichArticleWithMetadata = enrichArticle(mockEnricher);
        await expect(enrichArticleWithMetadata(mockArticle)).rejects.toThrow("Enrichment failed");
        expect(mockEnricher.enrichArticle).toHaveBeenCalledWith(mockArticle);
    });
});
