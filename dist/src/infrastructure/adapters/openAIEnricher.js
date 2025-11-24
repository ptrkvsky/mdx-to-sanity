const calculateMetadata = (article) => {
    const wordCount = article.content
        .split(/\s+/)
        .filter((word) => word.length > 0).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 mots par minute
    return {
        readingTime,
        wordCount,
    };
};
const createMetadataPrompt = (article) => {
    return `Analyse cet article et génère un JSON avec les métadonnées SEO suivantes :
- description : une description optimisée SEO de 150-160 caractères
- tags : un tableau de 3-5 tags pertinents
- keywords : un tableau de 5-10 mots-clés pertinents
- author : l'auteur si mentionné dans l'article
- seoTitle : un titre SEO optimisé

Article :
Titre: ${article.title}
Contenu: ${article.content.substring(0, 2000)}

Réponds UNIQUEMENT avec un JSON valide, sans texte supplémentaire.`;
};
const createContentTransformationPrompt = (article) => {
    return `Tu es un expert en transformation de contenu pour le SEO. Transforme ce contenu d'article en Markdown optimisé pour le SEO.

RÈGLES STRICTES À SUIVRE :

1. STRUCTURE HIÉRARCHIQUE :
   - Commence par un titre h2 (##) pour l'introduction ou le premier sujet principal
   - Utilise des titres h2 (##) pour les sections principales
   - Utilise des titres h3 (###) pour les sous-sections
   - Crée une hiérarchie logique même si le texte original n'en a pas
   - Analyse le contenu pour identifier les sections logiques et créer des titres descriptifs

2. CODE :
   - Les blocs de code doivent être dans des balises \`\`\` avec le langage approprié (ex: \`\`\`javascript, \`\`\`typescript, \`\`\`jsx, \`\`\`python)
   - Le code inline doit être dans des backticks simples \`
   - Identifie automatiquement le langage du code en fonction du contexte

3. NETTOYAGE :
   - Supprime les métadonnées qui sont mélangées dans le contenu (dates, tags, temps de lecture, "min read", etc.)
   - Supprime les éléments de navigation ou de menu
   - Supprime les informations de traduction ou de partage social
   - Garde uniquement le contenu de l'article propre

4. FORMATAGE :
   - Paragraphes séparés par une ligne vide
   - Listes à puces (-) ou numérotées (1.) quand approprié
   - Mots-clés importants en **gras** si pertinent pour le SEO
   - Sauts de ligne appropriés pour la lisibilité

5. EXEMPLE DE STRUCTURE ATTENDUE :
\`\`\`markdown
## Introduction

Paragraphe d'introduction qui présente le sujet...

## Section Principale

### Sous-section

Contenu de la sous-section avec des détails...

\`\`\`javascript
// Exemple de code
const example = "code";
\`\`\`

## Autre Section

Contenu de l'autre section...
\`\`\`

IMPORTANT :
- Analyse le contenu pour identifier les sections logiques
- Crée des titres descriptifs et pertinents pour le SEO
- Ne garde QUE le contenu de l'article (pas de métadonnées, navigation, etc.)
- Le contenu doit être prêt à être publié directement
- Conserve toute l'information importante du contenu original
- Ne modifie pas le sens ou le contenu, seulement la structure et le formatage

Contenu à transformer :
Titre: ${article.title}
Contenu brut: ${article.content}

Retourne UNIQUEMENT le Markdown structuré, sans frontmatter, sans explications, sans commentaires.`;
};
const callOpenAI = async (apiKey, prompt, model = "gpt-3.5-turbo", maxTokens = 500) => {
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
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.choices[0]?.message?.content || "";
};
const parseOpenAIResponse = (response) => {
    try {
        // Nettoyer la réponse (enlever markdown code blocks si présents)
        const cleanedResponse = response
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
        const parsed = JSON.parse(cleanedResponse);
        return {
            description: parsed.description || "",
            tags: parsed.tags || [],
            keywords: parsed.keywords || [],
            author: parsed.author,
            seoTitle: parsed.seoTitle,
        };
    }
    catch (error) {
        console.error("Error parsing OpenAI response:", error);
        return {};
    }
};
export function createOpenAIEnricher(apiKey) {
    return {
        enrichArticle: async (article) => {
            let structuredContent = article.content;
            let openAIMetadata = {};
            // Appel 1 : Générer les métadonnées SEO
            try {
                const metadataPrompt = createMetadataPrompt(article);
                const metadataResponse = await callOpenAI(apiKey, metadataPrompt, "gpt-3.5-turbo", 500);
                openAIMetadata = parseOpenAIResponse(metadataResponse);
            }
            catch (error) {
                console.error("OpenAI metadata generation failed:", error);
            }
            // Appel 2 : Transformer le contenu en markdown structuré
            try {
                const contentPrompt = createContentTransformationPrompt(article);
                const transformedContent = await callOpenAI(apiKey, contentPrompt, "gpt-4o-mini", 4000);
                structuredContent = transformedContent.trim();
            }
            catch (error) {
                console.error("OpenAI content transformation failed, using original content:", error);
                // Le contenu original est conservé dans structuredContent
            }
            // Recalculer les métadonnées sur le contenu structuré final
            const articleWithStructuredContent = {
                ...article,
                content: structuredContent,
            };
            const calculatedMetadata = calculateMetadata(articleWithStructuredContent);
            return {
                ...articleWithStructuredContent,
                metadata: {
                    title: article.title,
                    description: openAIMetadata.description || article.title,
                    date: article.date,
                    readingTime: calculatedMetadata.readingTime,
                    wordCount: calculatedMetadata.wordCount,
                    tags: openAIMetadata.tags,
                    keywords: openAIMetadata.keywords,
                    author: openAIMetadata.author,
                    seoTitle: openAIMetadata.seoTitle,
                },
            };
        },
    };
}
