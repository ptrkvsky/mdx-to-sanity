import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createCheerioScraper } from "./cheerioScraper.js";
import { mockHtmlContent } from "../../__tests__/fixtures/articles.js";
import { createMockFetch, createMockFetchError } from "../../__tests__/mocks/fetch.mock.js";

describe("createCheerioScraper", () => {
	const originalFetch = global.fetch;

	beforeEach(() => {
		global.fetch = originalFetch;
	});

	afterEach(() => {
		global.fetch = originalFetch;
	});

	it("should extract title and content from html", async () => {
		// Arrange
		global.fetch = createMockFetch(mockHtmlContent);
		const scraper = createCheerioScraper();

		// Act
		const result = await scraper.scrape("https://example.com");

		// Assert
		expect(result.title).toBe("Test Article");
		expect(result.content).toContain("Test Article");
		expect(result.content).toContain("test article content");
		expect(result.date).toBeDefined();
		expect(typeof result.date).toBe("string");
	});

	it("should use h1 as fallback when title tag is missing", async () => {
		// Arrange
		const htmlWithoutTitle = `
<!DOCTYPE html>
<html>
<head>
</head>
<body>
  <main>
    <h1>Fallback Title</h1>
    <p>Content</p>
  </main>
</body>
</html>
`;
		global.fetch = createMockFetch(htmlWithoutTitle);
		const scraper = createCheerioScraper();

		// Act
		const result = await scraper.scrape("https://example.com");

		// Assert
		expect(result.title).toBe("Fallback Title");
	});

	it("should use 'Untitled' when no title or h1 found", async () => {
		// Arrange
		const htmlWithoutTitle = `
<!DOCTYPE html>
<html>
<body>
  <main>
    <p>Content only</p>
  </main>
</body>
</html>
`;
		global.fetch = createMockFetch(htmlWithoutTitle);
		const scraper = createCheerioScraper();

		// Act
		const result = await scraper.scrape("https://example.com");

		// Assert
		expect(result.title).toBe("Untitled");
	});

	it("should return 'No content found' when main tag is missing", async () => {
		// Arrange
		const htmlWithoutMain = `
<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body>
  <p>Some content</p>
</body>
</html>
`;
		global.fetch = createMockFetch(htmlWithoutMain);
		const scraper = createCheerioScraper();

		// Act
		const result = await scraper.scrape("https://example.com");

		// Assert
		expect(result.content).toBe("No content found");
	});

	it("should propagate error when fetch fails", async () => {
		// Arrange
		global.fetch = createMockFetchError("Network error");
		const scraper = createCheerioScraper();

		// Act & Assert
		await expect(scraper.scrape("https://example.com")).rejects.toThrow(
			"Network error",
		);
	});

	it("should handle response that is not ok", async () => {
		// Arrange
		global.fetch = createMockFetch("", false);
		const scraper = createCheerioScraper();

		// Act
		const result = await scraper.scrape("https://example.com");

		// Assert - When response is not ok, it still processes the empty HTML
		expect(result.title).toBe("Untitled");
		expect(result.content).toBe("No content found");
	});
});

