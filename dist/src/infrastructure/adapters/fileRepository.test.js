import { describe, it, expect, vi, beforeEach } from "vitest";
import { mkdir, writeFile } from "fs/promises";
import { createFileRepository, generateFilename, slugify, } from "./fileRepository.js";
vi.mock("fs/promises", () => ({
    mkdir: vi.fn(),
    writeFile: vi.fn(),
}));
vi.mock("path", () => ({
    join: vi.fn((...args) => args.join("/")),
}));
describe("slugify", () => {
    it("should convert text to lowercase slug", () => {
        expect(slugify("Hello World")).toBe("hello-world");
    });
    it("should remove special characters", () => {
        expect(slugify("Hello@World#123")).toBe("helloworld123");
    });
    it("should replace spaces with hyphens", () => {
        expect(slugify("Hello World Test")).toBe("hello-world-test");
    });
    it("should remove multiple consecutive hyphens", () => {
        expect(slugify("Hello---World")).toBe("hello-world");
    });
    it("should trim leading and trailing hyphens", () => {
        expect(slugify("-Hello World-")).toBe("hello-world");
    });
    it("should handle empty string", () => {
        expect(slugify("")).toBe("");
    });
    it("should handle special characters only", () => {
        expect(slugify("@@@###")).toBe("");
    });
});
describe("generateFilename", () => {
    it("should generate filename with date and slug", () => {
        const result = generateFilename("Hello World", "2024-01-15");
        expect(result).toBe("2024-01-15-hello-world.md");
    });
    it("should handle long titles by truncating slug", () => {
        const longTitle = "a".repeat(100);
        const result = generateFilename(longTitle, "2024-01-15");
        expect(result).toMatch(/^2024-01-15-[a-z-]{1,50}\.md$/);
        expect(result.length).toBeLessThanOrEqual(70);
    });
    it("should use untitled when slug is empty", () => {
        const result = generateFilename("", "2024-01-15");
        expect(result).toBe("2024-01-15-untitled.md");
    });
    it("should handle special characters in title", () => {
        const result = generateFilename("Hello@World#123", "2024-01-15");
        expect(result).toBe("2024-01-15-helloworld123.md");
    });
});
describe("createFileRepository", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it("should create storage directory if it does not exist", async () => {
        const repository = createFileRepository();
        vi.mocked(mkdir).mockResolvedValue(undefined);
        vi.mocked(writeFile).mockResolvedValue(undefined);
        await repository.saveMarkdown("test.md", "content");
        expect(mkdir).toHaveBeenCalledWith("storage/markdown", {
            recursive: true,
        });
    });
    it("should save markdown file with correct path and content", async () => {
        const repository = createFileRepository();
        vi.mocked(mkdir).mockResolvedValue(undefined);
        vi.mocked(writeFile).mockResolvedValue(undefined);
        await repository.saveMarkdown("test.md", "---\ntitle: Test\n---\n\nContent");
        expect(writeFile).toHaveBeenCalledWith("storage/markdown/test.md", "---\ntitle: Test\n---\n\nContent", "utf-8");
    });
    it("should throw error when directory creation fails", async () => {
        const repository = createFileRepository();
        const error = new Error("Permission denied");
        vi.mocked(mkdir).mockRejectedValue(error);
        await expect(repository.saveMarkdown("test.md", "content")).rejects.toThrow("Failed to create storage directory");
    });
    it("should throw error when file write fails", async () => {
        const repository = createFileRepository();
        vi.mocked(mkdir).mockResolvedValue(undefined);
        const error = new Error("Disk full");
        vi.mocked(writeFile).mockRejectedValue(error);
        await expect(repository.saveMarkdown("test.md", "content")).rejects.toThrow("Failed to save markdown file");
    });
    it("should handle non-Error objects in directory creation error", async () => {
        const repository = createFileRepository();
        const error = "String error";
        vi.mocked(mkdir).mockRejectedValue(error);
        await expect(repository.saveMarkdown("test.md", "content")).rejects.toThrow("Failed to create storage directory");
    });
    it("should handle non-Error objects in file write error", async () => {
        const repository = createFileRepository();
        vi.mocked(mkdir).mockResolvedValue(undefined);
        const error = { message: "Custom error object" };
        vi.mocked(writeFile).mockRejectedValue(error);
        await expect(repository.saveMarkdown("test.md", "content")).rejects.toThrow("Failed to save markdown file");
    });
});
