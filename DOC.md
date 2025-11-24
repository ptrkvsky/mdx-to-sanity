# Documentation du projet : Backend Scraping & Transformation Markdown

## 1. Présentation

Ce projet est un backend léger construit avec **Hono**.  
Il permet de :

1. Scraper du contenu depuis le web.
2. Transformer le contenu en Markdown structuré et optimisé SEO.
3. Enrichir le contenu avec des métadonnées SEO (description, tags, keywords, etc.).
4. Sauvegarder automatiquement les fichiers Markdown générés dans `storage/markdown/`.

L'architecture suit les principes de la **Clean Architecture**, séparant les responsabilités pour un code maintenable et évolutif.

---

## 2. Architecture

### 2.1 Vue d'ensemble

```
src/
  application/
    use-cases/
      scrapeContent.ts          # Scraper une URL
      scrapeAndTransform.ts     # Scraper et transformer en Markdown
      enrichArticle.ts          # Enrichir un article avec métadonnées
      convertToMarkdown.ts      # Convertir un article enrichi en Markdown
  domain/
    entities.ts                 # Types des objets métier (Article, ArticleEnrichi)
    services.ts                 # Interfaces abstraites (Scraper, MarkdownTransformer, etc.)
  infrastructure/
    adapters/
      cheerioScraper.ts         # Implémentation du scraper avec cheerio
      openAIMarkdownTransformer.ts  # Transformation Markdown avec OpenAI
      openAIEnricher.ts         # Enrichissement avec OpenAI
      markdownFormatter.ts      # Formatage Markdown avec frontmatter
      markdownTransformer.ts    # Transformer HTML basique (stub)
      fileRepository.ts          # Sauvegarde des fichiers Markdown
  interfaces/
    http/
      routes/
        scrapeRoutes.ts         # Définition des routes HTTP
      controllers/
        scrapeController.ts     # Contrôleur pour le scraping
  index.ts                      # Point d'entrée de l'application
```

---

### 2.2 Couches

#### 2.2.1 Domain

- Contient le **modèle métier** et les **interfaces abstraites**.
- Exemples :
  - `Article` : représente un article (`title`, `content`, `date`).
  - `ArticleEnrichi` : article avec métadonnées SEO enrichies.
  - `Scraper` : interface pour le scraping (`scrape(url)`).
  - `MarkdownTransformerWithSEO` : interface pour transformer avec SEO.
  - `ArticleEnrichiService` : interface pour enrichir un article.

#### 2.2.2 Application (Use-cases)

- Contient la **logique métier orchestrée**.
- Implémente les scénarios :
  - `scrapeContent` : récupérer le contenu depuis une URL.
  - `scrapeAndTransform` : scraper et transformer directement en Markdown avec SEO.
  - `enrichArticle` : enrichir un article avec des métadonnées SEO.
  - `convertToMarkdown` : convertir un article enrichi en Markdown formaté.

#### 2.2.3 Infrastructure

- Implémente les interfaces du Domain avec les **technologies concrètes**.
- Exemples :
  - `cheerioScraper.ts` : utilise `cheerio` pour le scraping.
  - `openAIMarkdownTransformer.ts` : utilise OpenAI pour transformer en Markdown avec SEO.
  - `openAIEnricher.ts` : utilise OpenAI pour enrichir avec métadonnées.
  - `markdownFormatter.ts` : formate le Markdown avec frontmatter (gray-matter).

#### 2.2.4 Interfaces / Entrées

- Points d'entrée de l'application.
- Pour le backend Hono :
  - `routes/` : définit les routes REST.
  - `controllers/` : appelle les use-cases avec les dépendances injectées.

#### 2.2.5 Injection de dépendances

- Les dépendances concrètes sont **construites une seule fois** dans `index.ts`.
- Exemple :

```ts
const scraper = createCheerioScraper();
const transformer = createOpenAIMarkdownTransformer(apiKey);

const scrapeRouter = createScrapeRouter(scraper, transformer);
app.route("/api/scrape", scrapeRouter);
```

- Les use-cases reçoivent ces dépendances via paramètres (dependency injection).

---

## 3. Installation

```bash
git clone <repo-url>
cd project
pnpm install
```

### Variables d'environnement (exemple `.env`)

```env
OPENAI_API_KEY=your_openai_api_key
PORT=7777
```

- `OPENAI_API_KEY` : Clé API OpenAI (requis pour la transformation et l'enrichissement)
- `PORT` : Port du serveur (défaut : 7777)

---

## 4. Flux de traitement

### 4.1 Flux principal : Scraping et Transformation

```
URL → Scraper (cheerio) → Article
                          ↓
                    Transformer (OpenAI)
                          ↓
                    Markdown avec SEO
```

1. **Scraping** : Le scraper extrait le titre, le contenu et la date depuis l'URL.
2. **Transformation** : OpenAI transforme le contenu HTML en Markdown structuré avec :
   - Structure hiérarchique (h2, h3)
   - Formatage du code
   - Nettoyage des métadonnées
   - Optimisation SEO
3. **Enrichissement** : Génération de métadonnées SEO :
   - Description (150-160 caractères)
   - Tags
   - Keywords
   - SEO Title
   - Temps de lecture
   - Nombre de mots
4. **Sauvegarde** : Le fichier Markdown est automatiquement sauvegardé dans `storage/markdown/` avec le format `YYYY-MM-DD-slug-du-titre.md`

### 4.2 Format Markdown généré

Le Markdown généré inclut un frontmatter YAML :

```markdown
---
title: "Titre de l'article"
description: "Description optimisée SEO"
date: "2025-01-23"
readingTime: 5
wordCount: 1000
seoTitle: "Titre SEO optimisé"
tags:
  - tag1
  - tag2
keywords:
  - keyword1
  - keyword2
---

## Introduction

Contenu de l'article en Markdown structuré...
```

---

## 5. Routes HTTP

### 5.1 POST `/api/scrape`

Scrape une URL et retourne le contenu transformé en Markdown avec métadonnées SEO.

**Requête :**
```json
{
  "url": "https://example.com/article"
}
```

**Réponse :**
- **200 OK** : Markdown avec frontmatter (Content-Type: `text/markdown`)
- **400 Bad Request** : URL manquante ou invalide
- **500 Internal Server Error** : Erreur lors du scraping ou de la transformation

**Exemple :**
```bash
curl -X POST http://localhost:7777/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'
```

### 5.2 GET `/api/scrape/status`

Vérifie le statut du service.

**Réponse :**
```json
{
  "status": "ok"
}
```

---

## 6. Bonnes pratiques

- **Séparer les responsabilités** : scraping, transformation, enrichissement.
- **Injecter les dépendances** pour faciliter les tests.
- **Ne jamais mettre de logique métier dans les adapters** (infrastructure) ou routes.
- **Utiliser des interfaces abstraites** pour découpler les couches.
- **Gérer les erreurs** explicitement avec des messages clairs.

---

## 7. Structure des entités

### Article

```typescript
type Article = {
  title: string;
  content: string;
  date: string;
};
```

### ArticleEnrichi

```typescript
type ArticleEnrichi = Article & {
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
```

---

## 8. Services disponibles

### Scraper

```typescript
type Scraper = {
  scrape(url: string): Promise<Article>;
};
```

### MarkdownTransformerWithSEO

```typescript
type MarkdownTransformerWithSEO = {
  transformToMarkdownWithSEO(article: Article): Promise<string>;
};
```

### ArticleEnrichiService

```typescript
type ArticleEnrichiService = {
  enrichArticle(article: Article): Promise<ArticleEnrichi>;
};
```

### MarkdownFormatter

```typescript
type MarkdownFormatter = {
  formatMarkdown(articleEnriched: ArticleEnrichi): string;
};
```

### FileRepository

```typescript
type FileRepository = {
  saveMarkdown(filename: string, content: string): Promise<void>;
};
```

**Rôle** : Sauvegarder les fichiers Markdown générés sur le système de fichiers. Les fichiers sont sauvegardés dans `storage/markdown/` avec un nom de fichier généré automatiquement au format `YYYY-MM-DD-slug-du-titre.md`.

---

## 9. Sauvegarde des fichiers

Les fichiers Markdown générés sont automatiquement sauvegardés dans le dossier `storage/markdown/` lors de chaque transformation.

### Format de nommage

Les fichiers sont nommés selon le format : `YYYY-MM-DD-slug-du-titre.md`

- `YYYY-MM-DD` : Date extraite du frontmatter ou date du jour par défaut
- `slug-du-titre` : Titre de l'article converti en slug (minuscules, tirets, caractères spéciaux supprimés)

**Exemple** : `2024-01-15-les-composants-tooltip-ne-devraient-pas-exister.md`

### Emplacement

Les fichiers sont sauvegardés dans `storage/markdown/` à la racine du projet. Le dossier est créé automatiquement s'il n'existe pas.

### Gestion des erreurs

Si la sauvegarde échoue (permissions, espace disque, etc.), l'erreur est loggée mais n'empêche pas la transformation de retourner le Markdown. Le processus de sauvegarde est non-bloquant.

## 10. Étapes futures

1. Ajouter un système de cache pour éviter de re-scraper les mêmes URLs.
2. Ajouter un système de logs et monitoring.
3. Ajouter un système de queue pour traiter plusieurs URLs en parallèle.
4. Permettre de configurer le chemin de sauvegarde via variable d'environnement.
