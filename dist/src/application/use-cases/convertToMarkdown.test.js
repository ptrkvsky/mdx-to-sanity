import { describe, it, expect, vi } from "vitest";
import { convertToMarkdown } from "./convertToMarkdown.js";
import { mockArticleEnrichi } from "../../__tests__/fixtures/articles.js";
describe("convertToMarkdown", () => {
    it("should format article enriched to markdown", () => {
        // Arrange
        const mockMarkdown = "---\ntitle: Test\n---\n\n# Test Content";
        const mockFormatter = {
            formatMarkdown: vi.fn().mockReturnValue(mockMarkdown),
        };
        // Act
        const formatToMarkdown = convertToMarkdown(mockFormatter);
        const result = formatToMarkdown(mockArticleEnrichi);
        // Assert
        expect(mockFormatter.formatMarkdown).toHaveBeenCalledWith(mockArticleEnrichi);
        expect(mockFormatter.formatMarkdown).toHaveBeenCalledTimes(1);
        expect(result).toBe(mockMarkdown);
    });
    it("should handle article with minimal metadata", () => {
        // Arrange
        const minimalArticle = {
            ...mockArticleEnrichi,
            metadata: {
                title: "Test",
                description: "Test description",
                date: "2025-01-23",
                readingTime: 1,
                wordCount: 2,
            },
        };
        const mockMarkdown = "---\ntitle: Test\n---\n\n# Test Content";
        const mockFormatter = {
            formatMarkdown: vi.fn().mockReturnValue(mockMarkdown),
        };
        // Act
        const formatToMarkdown = convertToMarkdown(mockFormatter);
        const result = formatToMarkdown(minimalArticle);
        // Assert
        expect(mockFormatter.formatMarkdown).toHaveBeenCalledWith(minimalArticle);
        expect(result).toBe(mockMarkdown);
    });
});
