import { describe, it, expect } from "vitest";
import { createMarkdownTransformer } from "./markdownTransformer.js";
describe("createMarkdownTransformer", () => {
    it("should return html as markdown (stub implementation)", () => {
        // Arrange
        const transformer = createMarkdownTransformer();
        const html = "<p>Test content</p>";
        // Act
        const result = transformer.toMarkdown(html);
        // Assert
        expect(result).toBe(html);
    });
    it("should handle empty html", () => {
        // Arrange
        const transformer = createMarkdownTransformer();
        // Act
        const result = transformer.toMarkdown("");
        // Assert
        expect(result).toBe("");
    });
});
