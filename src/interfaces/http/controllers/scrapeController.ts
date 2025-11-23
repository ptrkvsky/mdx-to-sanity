import type { Context } from "hono";
import { scrapeContent } from "../../../application/use-cases/scrapeContent.js";
import type { Scraper } from "../../../domain/services.js";

const validateUrl = (body: unknown): string | null => {
	if (typeof body === "object" && body !== null && "url" in body) {
		const url = (body as { url: unknown }).url;
		return typeof url === "string" ? url : null;
	}
	return null;
};

export const createScrapeController = (scraper: Scraper) => {
	return async (c: Context) => {
		try {
			const body = await c.req.json();
			const url = validateUrl(body);

			if (!url) {
				return c.json({ error: "URL is required and must be a string" }, 400);
			}

			const scrapeArticle = scrapeContent(scraper);
			const article = await scrapeArticle(url);

			// Logger le résultat en JSON
			console.log(JSON.stringify(article, null, 2));

			return c.json(article, 200);
		} catch (error) {
			console.error("Scraping error:", error);
			return c.json({ error: "Failed to scrape content" }, 500);
		}
	};
};
