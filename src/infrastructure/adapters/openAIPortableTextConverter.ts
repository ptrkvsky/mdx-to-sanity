import type { BlockContent } from "../../domain/schemas.js";
import type { MarkdownToPortableTextConverter } from "../../domain/services.js";

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

function createPortableTextPrompt(markdown: string): string {
	return `Tu es un expert en conversion de contenu Markdown vers Portable Text Sanity.

Ta tâche est de convertir ce Markdown en structure BlockContent (Portable Text) pour Sanity CMS.

STRUCTURE ATTENDUE :

Le BlockContent est un tableau d'objets qui peuvent être :
1. Des blocs de texte (_type: "block") avec :
   - _key : identifiant unique (génère des clés comme "block1", "block2", etc.)
   - style : "normal" | "h1" | "h2" | "h3" | "h4" | "blockquote"
   - listItem : "bullet" (optionnel, pour les listes)
   - children : tableau de spans avec _type: "span", text, et marks (["strong"], ["em"], ["code"], ou clés de liens)
   - markDefs : (optionnel) tableau pour les liens avec _key, _type: "link", href

2. Des blocs de code (_type: "code") avec :
   - _key : identifiant unique
   - code : le code source
   - language : le langage (optionnel)

3. Des images (_type: "mainImage") avec :
   - _key : identifiant unique
   - asset : { _type: "reference", _ref: "image-id" }
   - caption, alt (optionnels)

4. Des embeds YouTube (_type: "youtube") avec :
   - _key : identifiant unique
   - url : l'URL YouTube

RÈGLES IMPORTANTES :
- Chaque block DOIT avoir un _key unique
- Pour les liens : créer un markDef avec _key unique, et référencer cette clé dans les marks du span
- Les marks peuvent être : ["strong"], ["em"], ["code"], ou une clé de lien (ex: ["link1"])
- Les listes à puces doivent avoir listItem: "bullet"
- Les blockquotes doivent avoir style: "blockquote"
- Les titres doivent avoir style: "h1", "h2", "h3", "h4" selon le niveau
- Le code inline doit avoir mark: ["code"]
- Les blocs de code doivent être de type "code" avec le language si disponible

EXEMPLE DE STRUCTURE :

\`\`\`json
[
  {
    "_type": "block",
    "_key": "block1",
    "style": "h2",
    "children": [
      {
        "_type": "span",
        "text": "Titre de section",
        "marks": []
      }
    ]
  },
  {
    "_type": "block",
    "_key": "block2",
    "style": "normal",
    "children": [
      {
        "_type": "span",
        "text": "Texte normal avec ",
        "marks": []
      },
      {
        "_type": "span",
        "text": "texte en gras",
        "marks": ["strong"]
      },
      {
        "_type": "span",
        "text": " et un ",
        "marks": []
      },
      {
        "_type": "span",
        "text": "lien",
        "marks": ["link1"]
      }
    ],
    "markDefs": [
      {
        "_key": "link1",
        "_type": "link",
        "href": "https://example.com"
      }
    ]
  },
  {
    "_type": "code",
    "_key": "code1",
    "code": "const x = 42;",
    "language": "javascript"
  }
]
\`\`\`

Markdown à convertir :

${markdown}

Retourne UNIQUEMENT le JSON valide du BlockContent, sans explications, sans markdown, sans code blocks. Juste le JSON brut.`;
}

function parseBlockContentResponse(response: string): BlockContent {
	let cleaned = response.trim();

	// Nettoyer les artefacts potentiels
	cleaned = cleaned.replace(/^```json\s*/i, "");
	cleaned = cleaned.replace(/^```\s*/i, "");
	cleaned = cleaned.replace(/\s*```\s*$/i, "");

	try {
		const parsed = JSON.parse(cleaned);
		return parsed as BlockContent;
	} catch (error) {
		throw new Error(
			`Failed to parse OpenAI response as JSON: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

export function createOpenAIPortableTextConverter(
	apiKey: string,
): MarkdownToPortableTextConverter {
	return {
		convertMarkdownToPortableText: async (
			markdown: string,
		): Promise<BlockContent> => {
			try {
				const prompt = createPortableTextPrompt(markdown);
				const response = await callOpenAI(apiKey, prompt, "gpt-4o-mini", 4000);
				return parseBlockContentResponse(response);
			} catch (error) {
				throw new Error(
					`OpenAI conversion failed: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		},
	};
}

