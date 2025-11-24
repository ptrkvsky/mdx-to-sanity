import type { Context } from "hono";
import { scrapeAndTransform } from "../../../application/use-cases/scrapeAndTransform.js";
import type {
	FileRepository,
	MarkdownTransformerWithSEO,
	Scraper,
} from "../../../domain/services.js";

function validateUrl(body: unknown): string | null {
	if (typeof body === "object" && body !== null && "url" in body) {
		const url = (body as { url: unknown }).url;
		return typeof url === "string" ? url : null;
	}
	return null;
}

export function createScrapeController(
	scraper: Scraper,
	transformer: MarkdownTransformerWithSEO,
	repository?: FileRepository,
) {
	return async (c: Context) => {
		try {
			const body = await c.req.json();
			const url = validateUrl(body);

			if (!url) {
				return c.json({ error: "URL is required and must be a string" }, 400);
			}

			const scrapeAndTransformArticle = scrapeAndTransform(
				scraper,
				transformer,
				repository,
			);
			const markdown = await scrapeAndTransformArticle(url);

			return c.text(markdown, 200, {
				"Content-Type": "text/markdown",
			});
		} catch (error) {
			console.error("Scraping error:", error);
			return c.json({ error: "Failed to scrape and transform content" }, 500);
		}
	};
}
