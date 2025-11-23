import type { ArticleEnrichi } from "../../domain/entities.js";
import type { MarkdownFormatter } from "../../domain/services.js";

export const convertToMarkdown =
	(formatter: MarkdownFormatter) =>
	(articleEnriched: ArticleEnrichi): string => {
		return formatter.formatMarkdown(articleEnriched);
	};

