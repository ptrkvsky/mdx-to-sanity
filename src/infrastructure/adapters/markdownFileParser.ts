import matter from "gray-matter";
import { readFileSync } from "node:fs";

export type ParsedMarkdown = {
	frontmatter: Record<string, unknown>;
	content: string;
};

export function parseMarkdownFile(filePath: string): ParsedMarkdown {
	const fileContent = readFileSync(filePath, "utf-8");
	const parsed = matter(fileContent);

	return {
		frontmatter: parsed.data,
		content: parsed.content,
	};
}

export function parseMarkdownString(markdown: string): ParsedMarkdown {
	const parsed = matter(markdown);

	return {
		frontmatter: parsed.data,
		content: parsed.content,
	};
}

