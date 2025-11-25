import type { Article, ArticleEnrichi } from "./entities.js";
import type { BlockContent, Post } from "./schemas.js";

export type Scraper = {
	scrape(url: string): Promise<Article>;
};

export type MarkdownTransformer = {
	toMarkdown: (html: string) => string;
};

export type FileRepository = {
	saveMarkdown: (filename: string, content: string) => Promise<void>;
};

export type ArticleEnrichiService = {
	enrichArticle: (article: Article) => Promise<ArticleEnrichi>;
};

export type MarkdownFormatter = {
	formatMarkdown: (articleEnriched: ArticleEnrichi) => string;
};

export type MarkdownTransformerWithSEO = {
	transformToMarkdownWithSEO: (article: Article) => Promise<string>;
};

export type MarkdownToPortableTextConverter = {
	convertMarkdownToPortableText: (markdown: string) => Promise<BlockContent>;
};

export type SanityClient = {
	createDocument: (document: Post) => Promise<string>;
	getCategories: () => Promise<
		Array<{ _id: string; title: string; slug?: { current: string } }>
	>;
	getDefaultImage: () => Promise<string | null>;
};

export type Logger = {
	debug: (message: string, context?: Record<string, unknown>) => void;
	info: (message: string, context?: Record<string, unknown>) => void;
	warn: (message: string, context?: Record<string, unknown>) => void;
	error: (
		message: string,
		error?: Error | unknown,
		context?: Record<string, unknown>,
	) => void;
};
