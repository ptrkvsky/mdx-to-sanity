import * as cheerio from "cheerio";
import type { Article } from "../../domain/entities.js";
import type { Scraper } from "../../domain/services.js";

const extractTitle = ($: cheerio.CheerioAPI): string => {
	return (
		$("title").text().trim() || $("h1").first().text().trim() || "Untitled"
	);
};

const extractContent = ($: cheerio.CheerioAPI): string => {
	const articleContent = $("main").first().text().trim();
	return articleContent || "No content found";
};

const createArticle = (title: string, content: string): Article => {
	return {
		title,
		content: content,
		date: new Date().toISOString().split("T")[0],
	};
};

const scrapeUrl = async (url: string): Promise<Article> => {
	const response = await fetch(url);
	const html = await response.text();
	const $ = cheerio.load(html);

	const title = extractTitle($);
	const content = extractContent($);

	return createArticle(title, content);
};

export const createCheerioScraper = (): Scraper => ({
	scrape: scrapeUrl,
});
