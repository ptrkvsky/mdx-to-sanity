import type { Post } from "../../domain/schemas.js";
import { PostSchema } from "../../domain/schemas.js";
import type {
	MarkdownToPortableTextConverter,
} from "../../domain/services.js";
import { parseMarkdownString } from "../../infrastructure/adapters/markdownFileParser.js";
import { generateMissingPostFields } from "../../infrastructure/adapters/postFieldGenerator.js";

export function convertMarkdownToSanityPost(
	converter: MarkdownToPortableTextConverter,
) {
	return async (
		markdown: string,
		frontmatterOverride?: Record<string, unknown>,
	): Promise<Post> => {
		// 1. Parser le Markdown
		const parsed = parseMarkdownString(markdown);
		const frontmatter = frontmatterOverride || parsed.frontmatter;

		// 2. Convertir Markdown → BlockContent avec OpenAI
		const body = await converter.convertMarkdownToPortableText(
			parsed.content,
		);

		// 3. Générer les champs obligatoires manquants
		const missingFields = generateMissingPostFields(frontmatter);

		// 4. Construire l'objet Post
		const title = (frontmatter.title as string) || "Untitled";
		const description =
			(frontmatter.description as string) || title || "No description";

		const post: Post = {
			_type: "post",
			title,
			description,
			type: missingFields.type,
			isHome: missingFields.isHome,
			slug: missingFields.slug,
			mainImage: missingFields.mainImage,
			categories: missingFields.categories,
			body,
			seoTitle: frontmatter.seoTitle as string | undefined,
			seoDescription: frontmatter.seoDescription as string | undefined,
			seoKeywords: frontmatter.seoKeywords as string | undefined,
			noIndex: frontmatter.noIndex as boolean | undefined,
			canonicalUrl: frontmatter.canonicalUrl as string | undefined,
		};

		// 5. Valider avec le schéma Zod
		const validationResult = PostSchema.safeParse(post);
		if (!validationResult.success) {
			throw new Error(
				`Post validation failed: ${validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
			);
		}

		return validationResult.data;
	};
}

