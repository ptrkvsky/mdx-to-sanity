import { describe, it, expect, vi } from "vitest";
import { scrapeAndTransform } from "./scrapeAndTransform.js";
import type {
	FileRepository,
	Scraper,
	MarkdownTransformerWithSEO,
} from "../../domain/services.js";
import { mockArticle } from "../../__tests__/fixtures/articles.js";
import {
	createMockFileRepository,
	createMockLogger,
} from "../../__tests__/helpers/test-helpers.js";

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

	it("should save markdown file when repository is provided", async () => {
		// Arrange
		const mockMarkdown =
			"---\ntitle: Test Article\ndate: 2024-01-15\n---\n\n# Test Content";
		const mockScraper: Scraper = {
			scrape: vi.fn().mockResolvedValue(mockArticle),
		};
		const mockTransformer: MarkdownTransformerWithSEO = {
			transformToMarkdownWithSEO: vi
				.fn()
				.mockResolvedValue(mockMarkdown),
		};
		const mockRepository = createMockFileRepository();

		// Act
		const scrapeAndTransformArticle = scrapeAndTransform(
			mockScraper,
			mockTransformer,
			mockRepository,
		);
		const result = await scrapeAndTransformArticle("https://example.com");

		// Assert
		expect(result).toBe(mockMarkdown);
		expect(mockRepository.saveMarkdown).toHaveBeenCalledTimes(1);
		expect(mockRepository.saveMarkdown).toHaveBeenCalledWith(
			expect.stringMatching(/^2024-01-15-test-article\.md$/),
			mockMarkdown,
		);
	});

	it("should not save when repository is not provided", async () => {
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
		expect(result).toBe(mockMarkdown);
	});

	it("should not fail when repository save fails", async () => {
		// Arrange
		const mockMarkdown =
			"---\ntitle: Test Article\ndate: 2024-01-15\n---\n\n# Test Content";
		const mockScraper: Scraper = {
			scrape: vi.fn().mockResolvedValue(mockArticle),
		};
		const mockTransformer: MarkdownTransformerWithSEO = {
			transformToMarkdownWithSEO: vi
				.fn()
				.mockResolvedValue(mockMarkdown),
		};
		const mockRepository: FileRepository = {
			saveMarkdown: vi.fn().mockRejectedValue(new Error("Save failed")),
		};
		const mockLogger = createMockLogger();

		// Act
		const scrapeAndTransformArticle = scrapeAndTransform(
			mockScraper,
			mockTransformer,
			mockRepository,
			mockLogger,
		);
		const result = await scrapeAndTransformArticle("https://example.com");

		// Assert
		expect(result).toBe(mockMarkdown);
		expect(mockLogger.error).toHaveBeenCalledWith(
			"Failed to save markdown file",
			expect.any(Error),
			expect.objectContaining({
				filename: expect.any(String),
			}),
		);
	});

	it("should handle markdown with Date object in frontmatter", async () => {
		// Arrange
		const date = new Date("2024-01-15");
		const mockMarkdown = `---
title: Test Article
date: ${date.toISOString()}
---
# Test Content`;
		const mockScraper: Scraper = {
			scrape: vi.fn().mockResolvedValue(mockArticle),
		};
		const mockTransformer: MarkdownTransformerWithSEO = {
			transformToMarkdownWithSEO: vi
				.fn()
				.mockResolvedValue(mockMarkdown),
		};
		const mockRepository = createMockFileRepository();

		// Act
		const scrapeAndTransformArticle = scrapeAndTransform(
			mockScraper,
			mockTransformer,
			mockRepository,
		);
		const result = await scrapeAndTransformArticle("https://example.com");

		// Assert
		expect(result).toBe(mockMarkdown);
		expect(mockRepository.saveMarkdown).toHaveBeenCalledWith(
			expect.stringMatching(/^2024-01-15-test-article\.md$/),
			mockMarkdown,
		);
	});

	it("should handle markdown with missing date in frontmatter", async () => {
		// Arrange
		const mockMarkdown = "---\ntitle: Test Article\n---\n\n# Test Content";
		const mockScraper: Scraper = {
			scrape: vi.fn().mockResolvedValue(mockArticle),
		};
		const mockTransformer: MarkdownTransformerWithSEO = {
			transformToMarkdownWithSEO: vi
				.fn()
				.mockResolvedValue(mockMarkdown),
		};
		const mockRepository = createMockFileRepository();

		// Act
		const scrapeAndTransformArticle = scrapeAndTransform(
			mockScraper,
			mockTransformer,
			mockRepository,
		);
		const result = await scrapeAndTransformArticle("https://example.com");

		// Assert
		expect(result).toBe(mockMarkdown);
		expect(mockRepository.saveMarkdown).toHaveBeenCalledWith(
			expect.stringMatching(/^\d{4}-\d{2}-\d{2}-test-article\.md$/),
			mockMarkdown,
		);
	});

	it("should handle markdown with unknown date type in frontmatter", async () => {
		// Arrange - gray-matter peut parser certaines valeurs de manière inattendue
		const mockMarkdown = `---
title: Test Article
date: 12345
---
# Test Content`;
		const mockScraper: Scraper = {
			scrape: vi.fn().mockResolvedValue(mockArticle),
		};
		const mockTransformer: MarkdownTransformerWithSEO = {
			transformToMarkdownWithSEO: vi
				.fn()
				.mockResolvedValue(mockMarkdown),
		};
		const mockRepository = createMockFileRepository();

		// Act
		const scrapeAndTransformArticle = scrapeAndTransform(
			mockScraper,
			mockTransformer,
			mockRepository,
		);
		const result = await scrapeAndTransformArticle("https://example.com");

		// Assert - Devrait utiliser la date du jour comme fallback
		expect(result).toBe(mockMarkdown);
		expect(mockRepository.saveMarkdown).toHaveBeenCalledWith(
			expect.stringMatching(/^\d{4}-\d{2}-\d{2}-test-article\.md$/),
			mockMarkdown,
		);
	});
});

