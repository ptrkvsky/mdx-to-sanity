import type { Article, ArticleEnrichi } from "./entities.js";

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
