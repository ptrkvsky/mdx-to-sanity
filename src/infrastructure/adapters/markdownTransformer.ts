import type { MarkdownTransformer } from "../../domain/services.js";

function toMarkdown(html: string): string {
	return html;
}

export function createMarkdownTransformer(): MarkdownTransformer {
	return {
		toMarkdown: toMarkdown,
	};
}
