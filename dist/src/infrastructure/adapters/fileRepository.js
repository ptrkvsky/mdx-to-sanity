import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
const STORAGE_DIR = "storage/markdown";
const MAX_SLUG_LENGTH = 50;
function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
function generateFilename(title, date) {
    const slug = slugify(title);
    const slugPart = slug || "untitled";
    const limitedSlug = slugPart.length > MAX_SLUG_LENGTH
        ? slugPart.substring(0, MAX_SLUG_LENGTH)
        : slugPart;
    return `${date}-${limitedSlug}.md`;
}
async function ensureStorageDirExists() {
    try {
        await mkdir(STORAGE_DIR, { recursive: true });
    }
    catch (error) {
        throw new Error(`Failed to create storage directory: ${error instanceof Error ? error.message : String(error)}`);
    }
}
async function saveMarkdownFile(filename, content) {
    await ensureStorageDirExists();
    const filePath = join(STORAGE_DIR, filename);
    try {
        await writeFile(filePath, content, "utf-8");
    }
    catch (error) {
        throw new Error(`Failed to save markdown file: ${error instanceof Error ? error.message : String(error)}`);
    }
}
export function createFileRepository() {
    return {
        saveMarkdown: saveMarkdownFile,
    };
}
export { generateFilename, slugify };
