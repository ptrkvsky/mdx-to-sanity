# Application (Use-cases / Logique métier orchestrée)

La couche **Application** contient la logique métier orchestrée. C'est ici que vous définissez **CE QUE VOTRE APPLICATION FAIT** en combinant les services du Domain.

## Rôle

Cette couche est responsable de :
- Orchestrer les scénarios métier (use-cases)
- Combiner les services du Domain pour réaliser une action complète
- Ne pas connaître les détails techniques (comment on scrape, comment on transforme)

## Structure

```
application/
  use-cases/
    scrapeContent.ts          # Scraper une URL
    scrapeAndTransform.ts     # Scraper et transformer en Markdown avec SEO
    enrichArticle.ts           # Enrichir un article avec métadonnées SEO
    convertToMarkdown.ts      # Convertir un article enrichi en Markdown formaté
```

## Use-cases disponibles

### 1. scrapeContent

Scrape une URL et retourne un Article.

**Code actuel :**

```typescript
// application/use-cases/scrapeContent.ts
export const scrapeContent =
  (scraper: Scraper) =>
  async (url: string): Promise<Article> => {
    return await scraper.scrape(url);
  };
```

**Rôle** : Récupérer le contenu depuis une URL en utilisant le scraper injecté.

### 2. scrapeAndTransform

Scrape une URL et transforme directement le contenu en Markdown avec métadonnées SEO.

**Code actuel :**

```typescript
// application/use-cases/scrapeAndTransform.ts
export const scrapeAndTransform =
  (scraper: Scraper, transformer: MarkdownTransformerWithSEO) =>
  async (url: string): Promise<string> => {
    // 1. Scraper
    const scrapeArticle = scrapeContent(scraper);
    const article = await scrapeArticle(url);

    // 2. Transformer directement en Markdown avec métadonnées SEO
    const markdown = await transformer.transformToMarkdownWithSEO(article);

    return markdown;
  };
```

**Rôle** : Orchestrer le scraping et la transformation en Markdown optimisé SEO. C'est le use-case principal utilisé par le controller.

### 3. enrichArticle

Enrichit un article avec des métadonnées SEO (description, tags, keywords, etc.).

**Code actuel :**

```typescript
// application/use-cases/enrichArticle.ts
export const enrichArticle =
  (enricher: ArticleEnrichiService) =>
  async (article: Article): Promise<ArticleEnrichi> => {
    return await enricher.enrichArticle(article);
  };
```

**Rôle** : Enrichir un article avec des métadonnées SEO en utilisant le service d'enrichissement injecté.

### 4. convertToMarkdown

Convertit un article enrichi en Markdown formaté avec frontmatter.

**Code actuel :**

```typescript
// application/use-cases/convertToMarkdown.ts
export const convertToMarkdown =
  (formatter: MarkdownFormatter) =>
  (articleEnriched: ArticleEnrichi): string => {
    return formatter.formatMarkdown(articleEnriched);
  };
```

**Rôle** : Formater un article enrichi en Markdown avec frontmatter YAML.

## Explication : Currying et Injection de Dépendances

### Pourquoi cette approche ?

**Avant (mauvaise approche)** :
```typescript
// ❌ Le use-case crée sa propre dépendance
export const scrapeContent = async (url: string) => {
  const scraper = new CheerioScraper(); // Couplage fort !
  return await scraper.scrape(url);
};
```

**Maintenant (bonne approche)** :
```typescript
// ✅ Le scraper est injecté (dépendance inversée)
export const scrapeContent = (scraper: Scraper) => async (url: string) => {
  return await scraper.scrape(url);
};
```

**Avantages** :
- Testable : vous pouvez injecter un scraper de test
- Flexible : vous pouvez changer d'implémentation facilement
- Respecte le principe de Dependency Inversion

## Flux de données

```
Controller appelle le use-case
    ↓
scrapeAndTransform(scraper, transformer)  ← Injection de dépendances
    ↓
Retourne une fonction qui prend l'URL
    ↓
scrapeAndTransformArticle(url)      ← Appel avec les données
    ↓
scrapeContent(scraper)(url)         ← Scraping
    ↓
transformer.transformToMarkdownWithSEO(article)  ← Transformation
    ↓
Retourne Markdown avec frontmatter
```

## Exemple d'utilisation

Dans le controller :

```typescript
// 1. Créer les dépendances (dans index.ts)
const scraper = createCheerioScraper();
const transformer = createOpenAIMarkdownTransformer(apiKey);

// 2. Injecter dans le controller
const scrapeController = createScrapeController(scraper, transformer);

// 3. Dans le controller, utiliser le use-case
const scrapeAndTransformArticle = scrapeAndTransform(scraper, transformer);
const markdown = await scrapeAndTransformArticle(url);
```

## Bonnes pratiques

1. **Une fonction = Un use-case** : Chaque fichier contient un seul use-case
2. **Injection de dépendances** : Les services sont injectés, pas créés
3. **Fonctions pures** : Les use-cases sont des fonctions pures (pas d'effets de bord cachés)
4. **Pas de détails techniques** : Le use-case ne sait pas comment le scraper fonctionne, juste ce qu'il fait
5. **Composition** : Les use-cases peuvent composer d'autres use-cases (ex: `scrapeAndTransform` utilise `scrapeContent`)

## Dépendances

- **Dépend de** : `domain/` (utilise les interfaces abstraites)
- **Ne dépend PAS de** : `infrastructure/` (ne connaît pas les implémentations concrètes)
- **Ne dépend PAS de** : `interfaces/` (ne connaît pas HTTP, CLI, etc.)

## Schéma du flux

```
┌─────────────────────────────────────┐
│    Interfaces (Controller)          │
│  createScrapeController(...)        │
└──────────────┬─────────────────────┘
               │ appelle
               ↓
┌─────────────────────────────────────┐
│    Application (Use-case)            │  ← Vous êtes ici
│  scrapeAndTransform(...)(url)       │
└──────────────┬─────────────────────┘
               │ utilise
               ↓
┌─────────────────────────────────────┐
│    Domain (Interface)                │
│  type Scraper = { scrape(...) }     │
│  type MarkdownTransformerWithSEO    │
└──────────────┬─────────────────────┘
               ↑ implémenté par
               │
┌─────────────────────────────────────┐
│    Infrastructure (Adapter)          │
│  createCheerioScraper()             │
│  createOpenAIMarkdownTransformer() │
└─────────────────────────────────────┘
```

## Relation avec les autres couches

```
Interfaces (controllers)
    ↓ appelle
Application (vous êtes ici - use-cases)
    ↓ utilise
Domain (interfaces abstraites)
    ↑ implémenté par
Infrastructure (adapters concrets)
```

## Pourquoi cette couche existe ?

Sans cette couche, vous mettriez la logique métier directement dans les controllers ou dans l'infrastructure. Cela créerait :
- Du code dupliqué
- Des tests difficiles
- Un couplage fort entre les couches

Avec cette couche, vous avez :
- Une logique métier centralisée et testable
- Des use-cases réutilisables
- Une séparation claire des responsabilités
