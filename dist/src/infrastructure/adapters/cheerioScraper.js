import * as cheerio from "cheerio";
function extractTitle($) {
    return ($("title").text().trim() || $("h1").first().text().trim() || "Untitled");
}
function extractContent($) {
    const articleContent = cleanHtml($, "main").first().text().trim();
    return articleContent || "No content found";
}
function createArticle(title, content) {
    return {
        title,
        content: content,
        date: new Date().toISOString().split("T")[0],
    };
}
function cleanHtml($, selector) {
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
async function scrapeUrl(url) {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const title = extractTitle($);
    const content = extractContent($);
    return createArticle(title, content);
}
export function createCheerioScraper() {
    return {
        scrape: scrapeUrl,
    };
}
