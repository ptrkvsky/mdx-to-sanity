import { describe, it, expect, vi } from "vitest";
import { scrapeAndTransform } from "./scrapeAndTransform.js";
import type {
	Scraper,
	MarkdownTransformerWithSEO,
} from "../../domain/services.js";
import { mockArticle } from "../../__tests__/fixtures/articles.js";

describe("scrapeAndTransform", () => {
	it("should scrape and transform article to markdown", async () => {
		// Arrange
		const mockMarkdown = "---\ntitle: Test\n---\n\n# Test Content";
		const mockScraper: Scraper = {
			scrape: vi.fn().mockResolvedValue(mockArticle),
		};
		const mockTransformer: MarkdownTransformerWithSEO = {
			transformToMarkdownWithSEO: vi
				.fn()
				.mockResolvedValue(mockMarkdown),
		};

		// Act
		const scrapeAndTransformArticle = scrapeAndTransform(
			mockScraper,
			mockTransformer,
		);
		const result = await scrapeAndTransformArticle("https://example.com");

		// Assert
		expect(mockScraper.scrape).toHaveBeenCalledWith("https://example.com");
		expect(mockScraper.scrape).toHaveBeenCalledTimes(1);
		expect(mockTransformer.transformToMarkdownWithSEO).toHaveBeenCalledWith(
			mockArticle,
		);
		expect(mockTransformer.transformToMarkdownWithSEO).toHaveBeenCalledTimes(
			1,
		);
		expect(result).toBe(mockMarkdown);
	});

	it("should propagate error when scraper fails", async () => {
		// Arrange
		const error = new Error("Scraping failed");
		const mockScraper: Scraper = {
			scrape: vi.fn().mockRejectedValue(error),
		};
		const mockTransformer: MarkdownTransformerWithSEO = {
			transformToMarkdownWithSEO: vi.fn(),
		};

		// Act & Assert
		const scrapeAndTransformArticle = scrapeAndTransform(
			mockScraper,
			mockTransformer,
		);
		await expect(
			scrapeAndTransformArticle("https://example.com"),
		).rejects.toThrow("Scraping failed");
		expect(mockTransformer.transformToMarkdownWithSEO).not.toHaveBeenCalled();
	});

	it("should propagate error when transformer fails", async () => {
		// Arrange
		const error = new Error("Transformation failed");
		const mockScraper: Scraper = {
			scrape: vi.fn().mockResolvedValue(mockArticle),
		};
		const mockTransformer: MarkdownTransformerWithSEO = {
			transformToMarkdownWithSEO: vi.fn().mockRejectedValue(error),
		};

		// Act & Assert
		const scrapeAndTransformArticle = scrapeAndTransform(
			mockScraper,
			mockTransformer,
		);
		await expect(
			scrapeAndTransformArticle("https://example.com"),
		).rejects.toThrow("Transformation failed");
		expect(mockScraper.scrape).toHaveBeenCalledWith("https://example.com");
		expect(mockTransformer.transformToMarkdownWithSEO).toHaveBeenCalledWith(
			mockArticle,
		);
	});
});

