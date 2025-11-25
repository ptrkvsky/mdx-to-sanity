async function callOpenAI(
	apiKey: string,
	prompt: string,
	model: string = "gpt-4o-mini",
	maxTokens: number = 200,
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
			temperature: 0.3,
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

function createCategorySelectionPrompt(
	title: string,
	description: string,
	content: string,
	categories: Array<{ _id: string; title: string; slug?: { current: string } }>,
): string {
	const categoriesList = categories
		.map((cat, index) => `${index + 1}. ${cat.title} (ID: ${cat._id})`)
		.join("\n");

	return `Tu es un expert en classification de contenu.

Analyse ce contenu et choisis la catégorie la plus appropriée parmi la liste disponible.

TITRE : ${title}
DESCRIPTION : ${description}
CONTENU (extrait) : ${content.substring(0, 500)}...

CATÉGORIES DISPONIBLES :
${categoriesList}

Retourne UNIQUEMENT l'ID de la catégorie choisie (format: _id de la catégorie), sans explications, sans texte supplémentaire. Juste l'ID.

Si aucune catégorie ne correspond vraiment, choisis la première catégorie de la liste.`;
}

import type { Logger } from "../../domain/services.js";

export type CategorySelector = {
	selectCategory: (
		title: string,
		description: string,
		content: string,
		categories: Array<{ _id: string; title: string; slug?: { current: string } }>,
	) => Promise<string>;
};

export function createOpenAICategorySelector(
	apiKey: string,
	logger?: Logger,
): CategorySelector {
	return {
		selectCategory: async (
			title: string,
			description: string,
			content: string,
			categories: Array<{ _id: string; title: string; slug?: { current: string } }>,
		): Promise<string> => {
			if (categories.length === 0) {
				throw new Error("No categories available");
			}

			try {
				const prompt = createCategorySelectionPrompt(
					title,
					description,
					content,
					categories,
				);
				const response = await callOpenAI(apiKey, prompt, "gpt-4o-mini", 200);
				const selectedId = response.trim();

				// Vérifier que l'ID sélectionné existe dans la liste
				const category = categories.find((cat) => cat._id === selectedId);
				if (category) {
					return category._id;
				}

				// Si l'ID n'est pas trouvé, utiliser la première catégorie
				logger?.warn(
					`OpenAI selected category ID "${selectedId}" not found, using first category "${categories[0]._id}"`,
					{
						selectedId,
						availableCategories: categories.map((c) => c._id),
					},
				);
				return categories[0]._id;
			} catch (error) {
				logger?.error(
					"OpenAI category selection failed",
					error instanceof Error ? error : new Error(String(error)),
					{
						model: "gpt-4o-mini",
					},
				);
				// En cas d'erreur, utiliser la première catégorie
				return categories[0]._id;
			}
		},
	};
}

