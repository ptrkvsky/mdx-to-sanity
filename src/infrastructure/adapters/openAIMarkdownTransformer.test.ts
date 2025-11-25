import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createOpenAIMarkdownTransformer } from "./openAIMarkdownTransformer.js";
import { mockArticle } from "../../__tests__/fixtures/articles.js";
import { createMockLogger } from "../../__tests__/helpers/test-helpers.js";
import {
	createMockOpenAIFetch,
	createMockOpenAIFetchError,
	createMockOpenAIResponse,
} from "../../__tests__/mocks/openai.mock.js";

describe("createOpenAIMarkdownTransformer", () => {
	const originalFetch = global.fetch;
	const apiKey = "test-api-key";

	beforeEach(() => {
		global.fetch = originalFetch;
	});

	afterEach(() => {
		global.fetch = originalFetch;
	});

	it("should transform article to markdown with SEO metadata", async () => {
		// Arrange
		const transformedContent = "## Introduction\n\nTransformed content";
		const metadata = {
			translatedTitle: "Article de Test",
			description: "Description SEO optimisée",
			seoTitle: "Titre SEO Optimisé",
		};
		const openAIResponse = createMockOpenAIResponse(
			transformedContent,
			metadata,
		);
		global.fetch = createMockOpenAIFetch(openAIResponse);
		const transformer = createOpenAIMarkdownTransformer(apiKey);

		// Act
		const result = await transformer.transformToMarkdownWithSEO(mockArticle);

		// Assert
		expect(result).toContain("---");
		expect(result).toContain("title: Article de Test");
		expect(result).toContain("description: Description SEO optimisée");
		expect(result).toContain("seoTitle: Titre SEO Optimisé");
		expect(result).toContain("readingTime:");
		expect(result).toContain("wordCount:");
		expect(result).toContain("## Introduction");
		expect(result).toContain("Transformed content");
	});

	it("should use article title as fallback when metadata is missing", async () => {
		// Arrange
		const transformedContent = "## Content\n\nTest content";
		const openAIResponse = createMockOpenAIResponse(transformedContent);
		global.fetch = createMockOpenAIFetch(openAIResponse);
		const transformer = createOpenAIMarkdownTransformer(apiKey);

		// Act
		const result = await transformer.transformToMarkdownWithSEO(mockArticle);

		// Assert
		expect(result).toContain(`title: ${mockArticle.title}`);
		expect(result).toContain(`description: ${mockArticle.title}`);
		// Le contenu peut être transformé ou original selon le parsing
		expect(result).toContain(mockArticle.content);
	});

	it("should calculate reading time and word count", async () => {
		// Arrange
		const longContent = "Word ".repeat(500); // 500 mots
		const transformedContent = `## Content\n\n${longContent}`;
		const openAIResponse = createMockOpenAIResponse(transformedContent);
		global.fetch = createMockOpenAIFetch(openAIResponse);
		const transformer = createOpenAIMarkdownTransformer(apiKey);

		// Act
		const result = await transformer.transformToMarkdownWithSEO(mockArticle);

		// Assert
		expect(result).toContain("wordCount:");
		expect(result).toContain("readingTime:");
		const wordCountMatch = result.match(/wordCount: (\d+)/);
		const readingTimeMatch = result.match(/readingTime: (\d+)/);
		expect(wordCountMatch).toBeTruthy();
		expect(readingTimeMatch).toBeTruthy();
		if (wordCountMatch && readingTimeMatch) {
			const wordCount = Number.parseInt(wordCountMatch[1], 10);
			const readingTime = Number.parseInt(readingTimeMatch[1], 10);
			expect(wordCount).toBeGreaterThan(0);
			expect(readingTime).toBeGreaterThan(0);
		}
	});

	it("should use original content when OpenAI fails", async () => {
		// Arrange
		global.fetch = createMockOpenAIFetchError("API Error");
		const transformer = createOpenAIMarkdownTransformer(apiKey);

		// Act
		const result = await transformer.transformToMarkdownWithSEO(mockArticle);

		// Assert
		expect(result).toContain("---");
		expect(result).toContain(`title: ${mockArticle.title}`);
		expect(result).toContain(mockArticle.content);
	});

	it("should use original content when API key is missing", async () => {
		// Arrange
		global.fetch = createMockOpenAIFetchError("OpenAI API key is missing");
		const transformer = createOpenAIMarkdownTransformer("");

		// Act
		const result = await transformer.transformToMarkdownWithSEO(mockArticle);

		// Assert - L'erreur est capturée et le contenu original est utilisé
		expect(result).toContain("---");
		expect(result).toContain(`title: ${mockArticle.title}`);
		expect(result).toContain(mockArticle.content);
	});

	it("should handle invalid OpenAI response format", async () => {
		// Arrange
		const invalidResponse = "Invalid response format";
		global.fetch = createMockOpenAIFetch(invalidResponse);
		const transformer = createOpenAIMarkdownTransformer(apiKey);

		// Act
		const result = await transformer.transformToMarkdownWithSEO(mockArticle);

		// Assert - Should fallback to original content
		expect(result).toContain(mockArticle.title);
		expect(result).toContain(mockArticle.content);
	});

	it("should handle API error response (non-ok status)", async () => {
		// Arrange
		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
			statusText: "Internal Server Error",
		} as unknown as Response);
		const transformer = createOpenAIMarkdownTransformer(apiKey);

		// Act
		const result = await transformer.transformToMarkdownWithSEO(mockArticle);

		// Assert - Should fallback to original content when API fails
		expect(result).toContain(mockArticle.title);
		expect(result).toContain(mockArticle.content);
	});

	it("should handle parsing error in combined response", async () => {
		// Arrange - Réponse avec JSON invalide dans la section METADATA qui causera une erreur de parsing
		const malformedResponse = `===CONTENT===
Some content here
===METADATA===
{ invalid json syntax {
===END===`;
		global.fetch = createMockOpenAIFetch(malformedResponse);
		const mockLogger = createMockLogger();
		const transformer = createOpenAIMarkdownTransformer(apiKey, mockLogger);

		// Act
		const result = await transformer.transformToMarkdownWithSEO(mockArticle);

		// Assert - Should fallback to original content when parsing fails
		expect(result).toContain(mockArticle.title);
		expect(result).toContain(mockArticle.content);
		expect(mockLogger.error).toHaveBeenCalledWith(
			"Error parsing combined response",
			expect.any(Error),
		);
	});
});

