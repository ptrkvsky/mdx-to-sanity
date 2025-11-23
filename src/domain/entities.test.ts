import { describe, it, expect } from "vitest";
import type { Article, ArticleEnrichi } from "./entities.js";

describe("Article", () => {
	it("should have required properties", () => {
		// Arrange & Act
		const article: Article = {
			title: "Test Article",
			content: "Test content",
			date: "2025-01-23",
		};

		// Assert
		expect(article).toHaveProperty("title");
		expect(article).toHaveProperty("content");
		expect(article).toHaveProperty("date");
		expect(typeof article.title).toBe("string");
		expect(typeof article.content).toBe("string");
		expect(typeof article.date).toBe("string");
	});

	it("should accept valid article structure", () => {
		// Arrange & Act
		const article: Article = {
			title: "My Article",
			content: "This is the content of my article.",
			date: "2025-01-23",
		};

		// Assert
		expect(article.title).toBe("My Article");
		expect(article.content).toBe("This is the content of my article.");
		expect(article.date).toBe("2025-01-23");
	});
});

describe("ArticleEnrichi", () => {
	it("should extend Article with metadata", () => {
		// Arrange & Act
		const articleEnrichi: ArticleEnrichi = {
			title: "Test Article",
			content: "Test content",
			date: "2025-01-23",
			metadata: {
				title: "Test Article",
				description: "Test description",
				date: "2025-01-23",
				readingTime: 5,
				wordCount: 100,
			},
		};

		// Assert
		expect(articleEnrichi).toHaveProperty("title");
		expect(articleEnrichi).toHaveProperty("content");
		expect(articleEnrichi).toHaveProperty("date");
		expect(articleEnrichi).toHaveProperty("metadata");
		expect(articleEnrichi.metadata).toHaveProperty("title");
		expect(articleEnrichi.metadata).toHaveProperty("description");
		expect(articleEnrichi.metadata).toHaveProperty("date");
		expect(articleEnrichi.metadata).toHaveProperty("readingTime");
		expect(articleEnrichi.metadata).toHaveProperty("wordCount");
	});

	it("should accept optional metadata fields", () => {
		// Arrange & Act
		const articleEnrichi: ArticleEnrichi = {
			title: "Test Article",
			content: "Test content",
			date: "2025-01-23",
			metadata: {
				title: "Test Article",
				description: "Test description",
				date: "2025-01-23",
				readingTime: 5,
				wordCount: 100,
				tags: ["tag1", "tag2"],
				keywords: ["keyword1", "keyword2"],
				author: "Test Author",
				seoTitle: "SEO Title",
			},
		};

		// Assert
		expect(articleEnrichi.metadata.tags).toEqual(["tag1", "tag2"]);
		expect(articleEnrichi.metadata.keywords).toEqual([
			"keyword1",
			"keyword2",
		]);
		expect(articleEnrichi.metadata.author).toBe("Test Author");
		expect(articleEnrichi.metadata.seoTitle).toBe("SEO Title");
	});

	it("should allow metadata without optional fields", () => {
		// Arrange & Act
		const articleEnrichi: ArticleEnrichi = {
			title: "Test Article",
			content: "Test content",
			date: "2025-01-23",
			metadata: {
				title: "Test Article",
				description: "Test description",
				date: "2025-01-23",
				readingTime: 1,
				wordCount: 2,
			},
		};

		// Assert
		expect(articleEnrichi.metadata.tags).toBeUndefined();
		expect(articleEnrichi.metadata.keywords).toBeUndefined();
		expect(articleEnrichi.metadata.author).toBeUndefined();
		expect(articleEnrichi.metadata.seoTitle).toBeUndefined();
	});
});

