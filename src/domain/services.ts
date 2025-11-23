import type { Article } from "./entities.js";

export type Scraper = {
  scrape(url: string): Promise<Article>;
};

export type MarkdownTransformer = {
  toMarkdown: (html: string) => string;
};

export type FileRepository = {
  saveMarkdown: (filename: string, content: string) => Promise<void>;
};
