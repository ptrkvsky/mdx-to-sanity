import matter from "gray-matter";
import type { Article } from "../../domain/entities.js";
import type { Logger, MarkdownTransformerWithSEO } from "../../domain/services.js";

interface SEOMetadata {
	description?: string;
	translatedTitle?: string;
	seoTitle?: string;
}

function calculateMetadata(content: string): {
	readingTime: number;
	wordCount: number;
} {
	const wordCount = content.split(/\s+/).filter((word) => word.length > 0)
		.length;
	const readingTime = Math.ceil(wordCount / 200); // 200 mots par minute

	return {
		readingTime,
		wordCount,
	};
}

function createCombinedPrompt(article: Article): string {
	return `Tu es un expert SEO content marketing spécialisé dans l'optimisation de contenu pour le référencement naturel et l'expérience utilisateur. Transforme ce contenu d'article en Markdown optimisé pour le SEO avec métadonnées.

ÉTAPE 1 - Transforme le contenu en Markdown structuré optimisé SEO :

STRUCTURE HIÉRARCHIQUE :
- Utilise des titres h2 (##) et h3 (###) pour structurer le contenu de manière hiérarchique et sémantique
- **CRITIQUE** : Le premier h2 ne doit être présent QUE s'il est engageant et apporte de la valeur. Évite absolument les titres génériques comme "Introduction", "Présentation", "Début", "Aperçu", etc. Si le contenu commence directement par du texte pertinent et engageant, ne force pas un h2 au début.
- Les titres h2/h3 doivent être descriptifs, pertinents et susciter l'intérêt. Privilégie des titres qui apportent de la valeur plutôt que des titres de remplissage.
- NE JAMAIS utiliser le titre original de l'article comme premier h2. Le premier h2 doit être basé sur le contenu réel, pas sur le titre.

FORMATAGE CODE :
- Les blocs de code doivent être dans des balises \`\`\` avec le langage approprié (ex: \`\`\`javascript, \`\`\`typescript, \`\`\`jsx, \`\`\`python)
- Le code inline doit être dans des backticks simples \`

NETTOYAGE :
- Supprime les métadonnées mélangées dans le contenu (dates, tags, temps de lecture, "min read", etc.)
- Supprime les éléments de navigation ou de menu
- Supprime les informations de traduction ou de partage social
- Garde uniquement le contenu de l'article propre et pertinent

OPTIMISATION SEO CONTENT MARKETING :
- Paragraphes séparés par une ligne vide pour la lisibilité
- Listes à puces (-) ou numérotées (1.) quand approprié pour améliorer la scannabilité
- Structure hiérarchique claire qui facilite la compréhension et le référencement
- Contenu optimisé pour l'expérience utilisateur et le référencement naturel
- NE RETOURNE PAS d'exemple ou de balise markdown de démonstration, seulement le contenu réel

ÉTAPE 2 - Génère les métadonnées SEO (dans la MÊME langue que le contenu transformé) :
- translatedTitle : Traduis le titre original dans la même langue que le contenu. Si le contenu est en français, traduis le titre en français. Si le contenu est en anglais, traduis le titre en anglais.
- description : 150-160 caractères optimisée SEO, accrocheuse et pertinente
- seoTitle : Titre SEO optimisé pour le référencement, dans la même langue que le contenu

IMPORTANT : 
- Toutes les métadonnées doivent être dans la MÊME langue que le contenu de l'article
- Le translatedTitle doit être une traduction naturelle et fluide du titre original
- La description doit être engageante et optimisée pour les résultats de recherche

Article :
Titre original: ${article.title}
Contenu: ${article.content}

Réponds avec ce format EXACT :
===CONTENT===
{Contenu Markdown structuré uniquement, sans frontmatter, sans explications}
===METADATA===
{
  "translatedTitle": "...",
  "description": "...",
  "seoTitle": "..."
}
===END===`;
}

function parseCombinedResponse(
	response: string,
	logger?: Logger,
): {
	content: string;
	metadata: SEOMetadata;
} {
	try {
		const contentMatch = response.match(
			/===CONTENT===\s*([\s\S]*?)\s*===METADATA===/,
		);
		const metadataMatch = response.match(
			/===METADATA===\s*([\s\S]*?)\s*===END===/,
		);

		let content = contentMatch ? contentMatch[1].trim() : "";

		// Nettoyer les artefacts markdown au début/fin
		content = content.replace(/^```markdown\s*/i, "");
		content = content.replace(/^```\s*/i, "");
		content = content.replace(/\s*```\s*$/i, "");
		content = content.trim();

		let metadata: SEOMetadata = {};
		if (metadataMatch) {
			const cleanedMetadata = metadataMatch[1]
				.replace(/```json\n?/g, "")
				.replace(/```\n?/g, "")
				.trim();
			metadata = JSON.parse(cleanedMetadata);
		}

		return { content, metadata };
	} catch (error) {
		logger?.error(
			"Error parsing combined response",
			error instanceof Error ? error : new Error(String(error)),
		);
		return { content: "", metadata: {} };
	}
}

async function callOpenAI(
	apiKey: string,
	prompt: string,
	model: string = "gpt-4o-mini",
	maxTokens: number = 4000,
): Promise<string> {
	if (!apiKey || apiKey.trim() === "") {
		throw new Error(
			"OpenAI API key is missing. Please set OPENAI_API_KEY environment variable.",
		);
	}

	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model,
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
			temperature: 0.7,
			max_tokens: maxTokens,
		}),
	});

	if (!response.ok) {
		throw new Error(
			`OpenAI API error: ${response.status} ${response.statusText}`,
		);
	}

	const data = await response.json();
	return data.choices[0]?.message?.content || "";
}

export function createOpenAIMarkdownTransformer(
	apiKey: string,
	logger?: Logger,
): MarkdownTransformerWithSEO {
	return {
		transformToMarkdownWithSEO: async (article: Article): Promise<string> => {
			let structuredContent = article.content;
			let seoMetadata: SEOMetadata = {};

			try {
				const prompt = createCombinedPrompt(article);
				const response = await callOpenAI(apiKey, prompt, "gpt-4o-mini", 4000);

				// Nettoyer les artefacts potentiels
				let cleanedResponse = response.trim();
				cleanedResponse = cleanedResponse.replace(/^```markdown\s*/i, "");
				cleanedResponse = cleanedResponse.replace(/\s*```\s*$/i, "");

				const parsed = parseCombinedResponse(cleanedResponse, logger);
				structuredContent = parsed.content || article.content;
				seoMetadata = parsed.metadata;
			} catch (error) {
				logger?.error(
					"OpenAI transformation failed, using original content",
					error instanceof Error ? error : new Error(String(error)),
					{
						model: "gpt-4o-mini",
					},
				);
				// Le contenu original est conservé dans structuredContent
			}

			// Calculer les métadonnées sur le contenu structuré final
			const { readingTime, wordCount } = calculateMetadata(structuredContent);

			// Créer le frontmatter
			const frontmatter: Record<string, unknown> = {
				title: seoMetadata.translatedTitle || article.title,
				description: seoMetadata.description || article.title,
				date: article.date,
				readingTime,
				wordCount,
			};

			if (seoMetadata.seoTitle) {
				frontmatter.seoTitle = seoMetadata.seoTitle;
			}

			// Générer le markdown final avec frontmatter
			return matter.stringify(structuredContent, frontmatter);
		},
	};
}

