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
        await expect(scraper.scrape("https://example.com")).rejects.toThrow("Network error");
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
    it("should remove CSS elements with short text and no children", async () => {
        // Arrange
        // Note: removeAttr("class") est appelé avant le each, donc les éléments avec class="css-*"
        // ne seront pas trouvés. On teste avec id="css-*" qui n'est pas supprimé avant.
        const htmlWithCssElements = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Article</title>
</head>
<body>
  <main>
    <div id="css-xyz789">Y</div>
    <div id="css-keep">This is a longer text that should be kept because it has more than 10 characters</div>
    <div id="css-short">
      <span>Has children so should be kept</span>
    </div>
    <p>Regular content</p>
  </main>
</body>
</html>
`;
        global.fetch = createMockFetch(htmlWithCssElements);
        const scraper = createCheerioScraper();
        // Act
        const result = await scraper.scrape("https://example.com");
        // Assert
        expect(result.title).toBe("Test Article");
        expect(result.content).toContain("Regular content");
        expect(result.content).toContain("This is a longer text that should be kept");
        expect(result.content).toContain("Has children so should be kept");
        // L'élément CSS court (1 caractère) sans enfants devrait être supprimé
        expect(result.content).not.toContain("Y");
    });
});
