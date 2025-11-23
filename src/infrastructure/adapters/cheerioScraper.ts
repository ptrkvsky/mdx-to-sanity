import * as cheerio from "cheerio";
import type { Article } from "../../domain/entities.js";
import type { Scraper } from "../../domain/services.js";

function extractTitle($: cheerio.CheerioAPI): string {
	return (
		$("title").text().trim() || $("h1").first().text().trim() || "Untitled"
	);
}

function extractContent($: cheerio.CheerioAPI): string {
	const articleContent = cleanHtml($, "main").first().text().trim();
	return articleContent || "No content found";
}

function createArticle(title: string, content: string): Article {
	return {
		title,
		content: content,
		date: new Date().toISOString().split("T")[0],
	};
}

function cleanHtml($: cheerio.CheerioAPI, selector: string) {
	// Cloner le sélecteur pour ne pas modifier l'original
	const $content = $(selector).first().clone();

	$content.find("style, script").remove();

	$content.find("*").removeAttr("style");

	$content.find("*").removeAttr("class");

	$content.find("[class*='css-'], [id*='css-']").each((_, el) => {
		const $el = $(el);
		if ($el.text().trim().length < 10 && $el.children().length === 0) {
			$el.remove();
		}
	});

	return $content;
}

async function scrapeUrl(url: string): Promise<Article> {
	const response = await fetch(url);
	const html = await response.text();
	const $ = cheerio.load(html);

	const title = extractTitle($);
	const content = extractContent($);

	return createArticle(title, content);
}

export function createCheerioScraper(): Scraper {
	return {
		scrape: scrapeUrl,
	};
}
