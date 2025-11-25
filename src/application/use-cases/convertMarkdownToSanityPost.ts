import type { Post } from "../../domain/schemas.js";
import { PostSchema } from "../../domain/schemas.js";
import type {
	Logger,
	MarkdownToPortableTextConverter,
	SanityClient,
} from "../../domain/services.js";
import { parseMarkdownString } from "../../infrastructure/adapters/markdownFileParser.js";
import { generateMissingPostFields } from "../../infrastructure/adapters/postFieldGenerator.js";
import type { CategorySelector } from "../../infrastructure/adapters/openAICategorySelector.js";

export function convertMarkdownToSanityPost(
	converter: MarkdownToPortableTextConverter,
	sanityClient?: SanityClient,
	categorySelector?: CategorySelector,
	logger?: Logger,
) {
	return async (
		markdown: string,
		frontmatterOverride?: Record<string, unknown>,
	): Promise<Post> => {
		// 1. Parser le Markdown
		const parsed = parseMarkdownString(markdown);
		const frontmatter = frontmatterOverride || parsed.frontmatter;

		// 2. Convertir Markdown → BlockContent avec OpenAI
		const body = await converter.convertMarkdownToPortableText(parsed.content);

		// 3. Générer les champs obligatoires manquants
		// Récupérer une image par défaut depuis Sanity si disponible
		let defaultImageId: string | null = null;
		if (sanityClient) {
			try {
				defaultImageId = await sanityClient.getDefaultImage();
			} catch (error) {
				logger?.warn("Failed to fetch default image", {
					error: error instanceof Error ? error.message : String(error),
				});
			}
		}

		const missingFields = generateMissingPostFields(
			frontmatter,
			defaultImageId,
		);

		// 4. Construire l'objet Post
		const title = (frontmatter.title as string) || "Untitled";
		const description =
			(frontmatter.description as string) || title || "No description";

		// 5. Sélectionner la catégorie avec OpenAI si disponible
		let categories = missingFields.categories;
		if (sanityClient && categorySelector) {
			try {
				const availableCategories = await sanityClient.getCategories();
				if (availableCategories.length > 0) {
					const selectedCategoryId = await categorySelector.selectCategory(
						title,
						description,
						parsed.content,
						availableCategories,
					);
					categories = [
						{
							_type: "reference",
							_ref: selectedCategoryId,
						},
					];
				}
			} catch (error) {
				logger?.warn(
					"Failed to select category with OpenAI, using default",
					{
						error: error instanceof Error ? error.message : String(error),
					},
				);
				// Utiliser les catégories par défaut en cas d'erreur
			}
		}

		// Vérifier que mainImage est disponible
		if (!missingFields.mainImage) {
			throw new Error(
				"mainImage is required but no default image is available in Sanity. Please provide an image in the frontmatter or upload an image to Sanity.",
			);
		}

		const post: Post = {
			_type: "post",
			title,
			description,
			type: missingFields.type,
			isHome: missingFields.isHome,
			slug: missingFields.slug,
			mainImage: missingFields.mainImage,
			categories,
			body,
			seoTitle: frontmatter.seoTitle as string | undefined,
			seoDescription: frontmatter.seoDescription as string | undefined,
			seoKeywords: frontmatter.seoKeywords as string | undefined,
			noIndex: frontmatter.noIndex as boolean | undefined,
			canonicalUrl: frontmatter.canonicalUrl as string | undefined,
		};

		// 6. Valider avec le schéma Zod
		const validationResult = PostSchema.safeParse(post);
		if (!validationResult.success) {
			throw new Error(
				`Post validation failed: ${validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
			);
		}

		return validationResult.data;
	};
}
