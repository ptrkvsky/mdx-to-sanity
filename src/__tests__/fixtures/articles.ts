import type { Article, ArticleEnrichi } from "../../domain/entities.js";

export const mockArticle: Article = {
	title: "Test Article",
	content: "This is a test article content with some text.",
	date: "2025-01-23",
};

export const mockArticleEnrichi: ArticleEnrichi = {
	...mockArticle,
	metadata: {
		title: "Test Article",
		description: "A test article description for SEO purposes",
		date: "2025-01-23",
		readingTime: 1,
		wordCount: 10,
		tags: ["test", "example"],
		keywords: ["test", "article", "example"],
		author: "Test Author",
		seoTitle: "Test Article - SEO Optimized Title",
	},
};

export const mockArticleWithLongContent: Article = {
	title: "Long Article",
	content: "This is a very long article content. ".repeat(100),
	date: "2025-01-23",
};

export const mockHtmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Article</title>
</head>
<body>
  <main>
    <h1>Test Article</h1>
    <p>This is a test article content with some text.</p>
  </main>
</body>
</html>
`;

