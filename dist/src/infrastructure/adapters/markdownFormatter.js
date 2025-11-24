import matter from "gray-matter";
const createFrontmatter = (article) => {
    const frontmatter = {
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
export const createMarkdownFormatter = () => {
    return {
        formatMarkdown: (articleEnriched) => {
            const frontmatter = createFrontmatter(articleEnriched);
            return matter.stringify(articleEnriched.content, frontmatter);
        },
    };
};
