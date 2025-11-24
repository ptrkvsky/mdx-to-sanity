import { describe, it, expect, vi } from "vitest";
import { createScrapeController } from "./scrapeController.js";
import { createMockScraper, createMockMarkdownTransformerWithSEO, createMockHonoContext, } from "../../../__tests__/helpers/test-helpers.js";
describe("createScrapeController", () => {
    it("should return markdown when url is valid", async () => {
        // Arrange
        const mockMarkdown = "---\ntitle: Test\n---\n\n# Content";
        const scraper = createMockScraper();
        const transformer = createMockMarkdownTransformerWithSEO(mockMarkdown);
        const controller = createScrapeController(scraper, transformer);
        const c = createMockHonoContext({ url: "https://example.com" });
        // Act
        const response = await controller(c);
        // Assert
        expect(response.status).toBe(200);
        const text = await response.text();
        expect(text).toBe(mockMarkdown);
        const contentType = response.headers.get("Content-Type");
        expect(contentType).toBe("text/markdown");
    });
    it("should return 400 when url is missing", async () => {
        // Arrange
        const scraper = createMockScraper();
        const transformer = createMockMarkdownTransformerWithSEO();
        const controller = createScrapeController(scraper, transformer);
        const c = createMockHonoContext({});
        // Act
        const response = await controller(c);
        // Assert
        expect(response.status).toBe(400);
        const json = await response.json();
        expect(json).toHaveProperty("error");
        expect(json.error).toContain("URL is required");
    });
    it("should return 400 when url is not a string", async () => {
        // Arrange
        const scraper = createMockScraper();
        const transformer = createMockMarkdownTransformerWithSEO();
        const controller = createScrapeController(scraper, transformer);
        const c = createMockHonoContext({ url: 123 });
        // Act
        const response = await controller(c);
        // Assert
        expect(response.status).toBe(400);
        const json = await response.json();
        expect(json).toHaveProperty("error");
        expect(json.error).toContain("URL is required");
    });
    it("should return 400 when url is empty string", async () => {
        // Arrange
        const scraper = createMockScraper();
        const transformer = createMockMarkdownTransformerWithSEO();
        const controller = createScrapeController(scraper, transformer);
        const c = createMockHonoContext({ url: "" });
        // Act
        const response = await controller(c);
        // Assert
        expect(response.status).toBe(400);
        const json = await response.json();
        expect(json).toHaveProperty("error");
    });
    it("should return 500 when scraping fails", async () => {
        // Arrange
        const error = new Error("Scraping failed");
        const scraper = {
            scrape: vi.fn().mockRejectedValue(error),
        };
        const transformer = createMockMarkdownTransformerWithSEO();
        const controller = createScrapeController(scraper, transformer);
        const c = createMockHonoContext({ url: "https://example.com" });
        // Act
        const response = await controller(c);
        // Assert
        expect(response.status).toBe(500);
        const json = await response.json();
        expect(json).toHaveProperty("error");
        expect(json.error).toContain("Failed to scrape");
    });
    it("should return 500 when transformation fails", async () => {
        // Arrange
        const error = new Error("Transformation failed");
        const scraper = createMockScraper();
        const transformer = {
            transformToMarkdownWithSEO: vi.fn().mockRejectedValue(error),
        };
        const controller = createScrapeController(scraper, transformer);
        const c = createMockHonoContext({ url: "https://example.com" });
        // Act
        const response = await controller(c);
        // Assert
        expect(response.status).toBe(500);
        const json = await response.json();
        expect(json).toHaveProperty("error");
        expect(json.error).toContain("Failed to scrape");
    });
});
