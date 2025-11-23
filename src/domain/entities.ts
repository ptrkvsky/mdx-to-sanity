export type Article = {
	title: string;
	content: string;
	date: string;
};

export type ArticleEnrichi = Article & {
	metadata: {
		title: string;
		description: string;
		date: string;
		readingTime: number;
		wordCount: number;
		tags?: string[];
		keywords?: string[];
		author?: string;
		seoTitle?: string;
	};
};
