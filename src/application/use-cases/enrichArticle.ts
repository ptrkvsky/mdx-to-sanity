import type { Article, ArticleEnrichi } from "../../domain/entities.js";
import type { ArticleEnrichiService } from "../../domain/services.js";

export const enrichArticle =
	(enricher: ArticleEnrichiService) =>
	async (article: Article): Promise<ArticleEnrichi> => {
		return await enricher.enrichArticle(article);
	};

