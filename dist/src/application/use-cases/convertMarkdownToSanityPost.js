import { PostSchema } from "../../domain/schemas.js";
import { parseMarkdownString } from "../../infrastructure/adapters/markdownFileParser.js";
import { generateMissingPostFields } from "../../infrastructure/adapters/postFieldGenerator.js";
export function convertMarkdownToSanityPost(converter) {
    return async (markdown, frontmatterOverride) => {
        // 1. Parser le Markdown
        const parsed = parseMarkdownString(markdown);
        const frontmatter = frontmatterOverride || parsed.frontmatter;
        // 2. Convertir Markdown → BlockContent avec OpenAI
        const body = await converter.convertMarkdownToPortableText(parsed.content);
        // 3. Générer les champs obligatoires manquants
        const missingFields = generateMissingPostFields(frontmatter);
        // 4. Construire l'objet Post
        const title = frontmatter.title || "Untitled";
        const description = frontmatter.description || title || "No description";
        const post = {
            _type: "post",
            title,
            description,
            type: missingFields.type,
            isHome: missingFields.isHome,
            slug: missingFields.slug,
            mainImage: missingFields.mainImage,
            categories: missingFields.categories,
            body,
            seoTitle: frontmatter.seoTitle,
            seoDescription: frontmatter.seoDescription,
            seoKeywords: frontmatter.seoKeywords,
            noIndex: frontmatter.noIndex,
            canonicalUrl: frontmatter.canonicalUrl,
        };
        // 5. Valider avec le schéma Zod
        const validationResult = PostSchema.safeParse(post);
        if (!validationResult.success) {
            throw new Error(`Post validation failed: ${validationResult.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
        }
        return validationResult.data;
    };
}
