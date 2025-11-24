import matter from "gray-matter";
import { generateFilename } from "../../infrastructure/adapters/fileRepository.js";
import { scrapeContent } from "./scrapeContent.js";
function extractTitleFromMarkdown(markdown) {
    const parsed = matter(markdown);
    return parsed.data.title || "Untitled";
}
function extractDateFromMarkdown(markdown) {
    const parsed = matter(markdown);
    const date = parsed.data.date;
    if (!date) {
        return new Date().toISOString().split("T")[0];
    }
    if (date instanceof Date) {
        return date.toISOString().split("T")[0];
    }
    if (typeof date === "string") {
        return date;
    }
    return new Date().toISOString().split("T")[0];
}
async function saveMarkdownIfRepositoryExists(markdown, repository) {
    if (!repository) {
        return;
    }
    try {
        const title = extractTitleFromMarkdown(markdown);
        const date = extractDateFromMarkdown(markdown);
        const filename = generateFilename(title, date);
        await repository.saveMarkdown(filename, markdown);
    }
    catch (error) {
        console.error("Failed to save markdown file:", error);
    }
}
export const scrapeAndTransform = (scraper, transformer, repository) => async (url) => {
    // 1. Scraper
    const scrapeArticle = scrapeContent(scraper);
    const article = await scrapeArticle(url);
    // 2. Transformer directement en Markdown avec métadonnées SEO
    const markdown = await transformer.transformToMarkdownWithSEO(article);
    // 3. Sauvegarder automatiquement si repository est fourni
    await saveMarkdownIfRepositoryExists(markdown, repository);
    return markdown;
};
