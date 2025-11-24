import { describe, it, expect, vi } from "vitest";
import { scrapeContent } from "./scrapeContent.js";
import type { Scraper } from "../../domain/services.js";
import type { Article } from "../../domain/entities.js";
import { mockArticle } from "../../__tests__/fixtures/articles.js";

describe("scrapeContent", () => {
	it("should return article when scraper succeeds", async () => {
		// Arrange
		const mockScraper: Scraper = {
			scrape: vi.fn().mockResolvedValue(mockArticle),
		};

		// Act
		const scrapeArticle = scrapeContent(mockScraper);
		const result = await scrapeArticle("https://example.com");

		// Assert
		expect(mockScraper.scrape).toHaveBeenCalledWith("https://example.com");
		expect(mockScraper.scrape).toHaveBeenCalledTimes(1);
		expect(result).toEqual(mockArticle);
	});

	it("should propagate error when scraper fails", async () => {
		// Arrange
		const error = new Error("Scraping failed");
		const mockScraper: Scraper = {
			scrape: vi.fn().mockRejectedValue(error),
		};

		// Act & Assert
		const scrapeArticle = scrapeContent(mockScraper);
		await expect(scrapeArticle("https://example.com")).rejects.toThrow(
			"Scraping failed",
		);
		expect(mockScraper.scrape).toHaveBeenCalledWith("https://example.com");
	});
});

