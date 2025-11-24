import matter from "gray-matter";
import { readFileSync } from "node:fs";
export function parseMarkdownFile(filePath) {
    const fileContent = readFileSync(filePath, "utf-8");
    const parsed = matter(fileContent);
    return {
        frontmatter: parsed.data,
        content: parsed.content,
    };
}
export function parseMarkdownString(markdown) {
    const parsed = matter(markdown);
    return {
        frontmatter: parsed.data,
        content: parsed.content,
    };
}
