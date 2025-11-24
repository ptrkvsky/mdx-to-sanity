import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { createScrapeRouter } from "./scrapeRoutes.js";
import { createMockScraper, createMockMarkdownTransformerWithSEO, } from "../../../__tests__/helpers/test-helpers.js";
describe("createScrapeRouter", () => {
    it("should return 200 with markdown on POST /", async () => {
        // Arrange
        const mockMarkdown = "---\ntitle: Test\n---\n\n# Content";
        const scraper = createMockScraper();
        const transformer = createMockMarkdownTransformerWithSEO(mockMarkdown);
        const router = createScrapeRouter(scraper, transformer);
        const app = new Hono().route("/", router);
        // Act
        const req = new Request("http://localhost/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: "https://example.com" }),
        });
        const response = await app.fetch(req);
        // Assert
        expect(response.status).toBe(200);
        const text = await response.text();
        expect(text).toBe(mockMarkdown);
        expect(response.headers.get("Content-Type")).toBe("text/markdown");
    });
    it("should return 200 with status ok on GET /status", async () => {
        // Arrange
        const scraper = createMockScraper();
        const transformer = createMockMarkdownTransformerWithSEO();
        const router = createScrapeRouter(scraper, transformer);
        const app = new Hono().route("/", router);
        // Act
        const req = new Request("http://localhost/status", {
            method: "GET",
        });
        const response = await app.fetch(req);
        // Assert
        expect(response.status).toBe(200);
        const json = await response.json();
        expect(json).toEqual({ status: "ok" });
    });
    it("should return 200 on GET /:id", async () => {
        // Arrange
        const scraper = createMockScraper();
        const transformer = createMockMarkdownTransformerWithSEO();
        const router = createScrapeRouter(scraper, transformer);
        const app = new Hono().route("/", router);
        // Act
        const req = new Request("http://localhost/test-id", {
            method: "GET",
        });
        const response = await app.fetch(req);
        // Assert
        expect(response.status).toBe(200);
        const json = await response.json();
        expect(json).toEqual({ status: "ok" });
    });
    it("should return 400 when url is missing on POST /", async () => {
        // Arrange
        const scraper = createMockScraper();
        const transformer = createMockMarkdownTransformerWithSEO();
        const router = createScrapeRouter(scraper, transformer);
        const app = new Hono().route("/", router);
        // Act
        const req = new Request("http://localhost/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
        const response = await app.fetch(req);
        // Assert
        expect(response.status).toBe(400);
        const json = await response.json();
        expect(json).toHaveProperty("error");
    });
});
