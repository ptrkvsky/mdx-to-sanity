import matter from "gray-matter";
import { generateFilename } from "../../infrastructure/adapters/fileRepository.js";
import type {
	FileRepository,
	Logger,
	Scraper,
	MarkdownTransformerWithSEO,
} from "../../domain/services.js";
import { scrapeContent } from "./scrapeContent.js";

function extractTitleFromMarkdown(markdown: string): string {
	const parsed = matter(markdown);
	return (parsed.data.title as string) || "Untitled";
}

function extractDateFromMarkdown(markdown: string): string {
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

async function saveMarkdownIfRepositoryExists(
	markdown: string,
	repository: FileRepository | undefined,
	logger?: Logger,
): Promise<void> {
	if (!repository) {
		return;
	}

	try {
		const title = extractTitleFromMarkdown(markdown);
		const date = extractDateFromMarkdown(markdown);
		const filename = generateFilename(title, date);
		await repository.saveMarkdown(filename, markdown);
	} catch (error) {
		logger?.error(
			"Failed to save markdown file",
			error instanceof Error ? error : new Error(String(error)),
			{
				filename: generateFilename(
					extractTitleFromMarkdown(markdown),
					extractDateFromMarkdown(markdown),
				),
			},
		);
	}
}

export const scrapeAndTransform =
	(
		scraper: Scraper,
		transformer: MarkdownTransformerWithSEO,
		repository?: FileRepository,
		logger?: Logger,
	) =>
	async (url: string): Promise<string> => {
		// 1. Scraper
		const scrapeArticle = scrapeContent(scraper);
		const article = await scrapeArticle(url);

		// 2. Transformer directement en Markdown avec métadonnées SEO
		const markdown = await transformer.transformToMarkdownWithSEO(article);

		// 3. Sauvegarder automatiquement si repository est fourni
		await saveMarkdownIfRepositoryExists(markdown, repository, logger);

		return markdown;
	};

