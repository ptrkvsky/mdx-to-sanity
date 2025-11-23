import type { Scraper, MarkdownTransformerWithSEO } from "../../domain/services.js";
import { scrapeContent } from "./scrapeContent.js";

export const scrapeAndTransform =
	(scraper: Scraper, transformer: MarkdownTransformerWithSEO) =>
	async (url: string): Promise<string> => {
		// 1. Scraper
		const scrapeArticle = scrapeContent(scraper);
		const article = await scrapeArticle(url);

		// 2. Transformer directement en Markdown avec métadonnées SEO
		const markdown = await transformer.transformToMarkdownWithSEO(article);

		return markdown;
	};

