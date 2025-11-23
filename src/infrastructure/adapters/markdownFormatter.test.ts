import { describe, it, expect } from "vitest";
import { createMarkdownFormatter } from "./markdownFormatter.js";
import { mockArticleEnrichi } from "../../__tests__/fixtures/articles.js";

describe("createMarkdownFormatter", () => {
	it("should format article enriched to markdown with frontmatter", () => {
		// Arrange
		const formatter = createMarkdownFormatter();

		// Act
		const result = formatter.formatMarkdown(mockArticleEnrichi);

		// Assert
		expect(result).toContain("---");
		expect(result).toContain("title: Test Article");
		expect(result).toContain("description:");
		expect(result).toContain("date:"); // gray-matter peut utiliser des guillemets
		expect(result).toContain("2025-01-23");
		expect(result).toContain("readingTime: 1");
		expect(result).toContain("wordCount: 10");
	});

	it("should include optional metadata when present", () => {
		// Arrange
		const formatter = createMarkdownFormatter();
		const articleWithAllMetadata = {
			...mockArticleEnrichi,
			metadata: {
				...mockArticleEnrichi.metadata,
				tags: ["tag1", "tag2"],
				keywords: ["keyword1", "keyword2"],
				author: "Test Author",
				seoTitle: "SEO Title",
			},
		};

		// Act
		const result = formatter.formatMarkdown(articleWithAllMetadata);

		// Assert
		expect(result).toContain("tags:");
		expect(result).toContain("tag1");
		expect(result).toContain("keywords:");
		expect(result).toContain("author: Test Author");
		expect(result).toContain("seoTitle: SEO Title");
	});

	it("should exclude optional metadata when not present", () => {
		// Arrange
		const formatter = createMarkdownFormatter();
		const articleMinimal = {
			...mockArticleEnrichi,
			metadata: {
				title: "Test",
				description: "Test description",
				date: "2025-01-23",
				readingTime: 1,
				wordCount: 2,
			},
		};

		// Act
		const result = formatter.formatMarkdown(articleMinimal);

		// Assert
		expect(result).not.toContain("tags:");
		expect(result).not.toContain("keywords:");
		expect(result).not.toContain("author:");
		expect(result).not.toContain("seoTitle:");
		expect(result).toContain("title: Test");
		expect(result).toContain("description: Test description");
	});
});

