import matter from "gray-matter";
import type { ArticleEnrichi } from "../../domain/entities.js";
import type { MarkdownFormatter } from "../../domain/services.js";

const createFrontmatter = (article: ArticleEnrichi) => {
	const frontmatter: Record<string, unknown> = {
		title: article.metadata.title,
		description: article.metadata.description,
		date: article.metadata.date,
		readingTime: article.metadata.readingTime,
		wordCount: article.metadata.wordCount,
	};

	if (article.metadata.tags && article.metadata.tags.length > 0) {
		frontmatter.tags = article.metadata.tags;
	}

	if (article.metadata.keywords && article.metadata.keywords.length > 0) {
		frontmatter.keywords = article.metadata.keywords;
	}

	if (article.metadata.author) {
		frontmatter.author = article.metadata.author;
	}

	if (article.metadata.seoTitle) {
		frontmatter.seoTitle = article.metadata.seoTitle;
	}

	return frontmatter;
};

export const createMarkdownFormatter = (): MarkdownFormatter => {
	return {
		formatMarkdown: (articleEnriched: ArticleEnrichi): string => {
			const frontmatter = createFrontmatter(articleEnriched);
			return matter.stringify(articleEnriched.content, frontmatter);
		},
	};
};
