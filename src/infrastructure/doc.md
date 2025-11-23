# Infrastructure (Implémentations concrètes)

L'**infrastructure** contient les implémentations concrètes des interfaces définies dans le **Domain**. C'est ici que vous utilisez les technologies réelles (cheerio, OpenAI API, gray-matter, etc.).

## Rôle

Cette couche est responsable de :
- Implémenter les interfaces abstraites du Domain
- Utiliser les technologies concrètes (librairies externes)
- Gérer les détails techniques (réseau, API externes, formatage, etc.)

## Principe : Inversion de Dépendance

En Clean Architecture, les dépendances pointent **vers l'intérieur** :

```
Infrastructure → Domain (implémente les interfaces)
     ↑
     |
Application (utilise les interfaces du Domain)
```

Le Domain définit **CE QU'ON VEUT FAIRE** (interface `Scraper`), et l'Infrastructure définit **COMMENT ON LE FAIT** (implémentation avec cheerio).

## Structure

```
infrastructure/
  adapters/
    cheerioScraper.ts              # Implémente Scraper avec cheerio
    openAIMarkdownTransformer.ts    # Implémente MarkdownTransformerWithSEO avec OpenAI
    openAIEnricher.ts               # Implémente ArticleEnrichiService avec OpenAI
    markdownFormatter.ts            # Implémente MarkdownFormatter avec gray-matter
    markdownTransformer.ts          # Implémentation basique de MarkdownTransformer (stub)
```

## Adapters disponibles

### 1. CheerioScraper

Implémente l'interface `Scraper` avec la bibliothèque cheerio.

**Interface dans le Domain :**

```typescript
// domain/services.ts
export type Scraper = {
  scrape(url: string): Promise<Article>;
};
```

**Implémentation :**

```typescript
// infrastructure/adapters/cheerioScraper.ts
export const createCheerioScraper = (): Scraper => ({
  scrape: async (url: string) => {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const title = $("title").text().trim();
    const content = $("article, main, .content").text().trim();
    const date = new Date().toISOString().split("T")[0];
    
    return { title, content, date };
  }
});
```

**Rôle** : Utiliser cheerio pour extraire le contenu d'une page web.

### 2. OpenAIMarkdownTransformer

Implémente l'interface `MarkdownTransformerWithSEO` avec l'API OpenAI.

**Interface dans le Domain :**

```typescript
// domain/services.ts
export type MarkdownTransformerWithSEO = {
  transformToMarkdownWithSEO(article: Article): Promise<string>;
};
```

**Implémentation :**

```typescript
// infrastructure/adapters/openAIMarkdownTransformer.ts
export function createOpenAIMarkdownTransformer(
  apiKey: string,
): MarkdownTransformerWithSEO {
  return {
    transformToMarkdownWithSEO: async (article: Article): Promise<string> => {
      // 1. Appel OpenAI pour transformer le contenu en Markdown structuré
      // 2. Génération de métadonnées SEO (description, tags, keywords, seoTitle)
      // 3. Calcul des métadonnées (readingTime, wordCount)
      // 4. Génération du frontmatter avec gray-matter
      // 5. Retour du Markdown complet avec frontmatter
    }
  };
}
```

**Rôle** : 
- Transformer le contenu HTML en Markdown structuré et optimisé SEO
- Générer des métadonnées SEO (description, tags, keywords, seoTitle)
- Calculer le temps de lecture et le nombre de mots
- Générer le frontmatter YAML avec gray-matter

**Fonctionnalités** :
- Structure hiérarchique (h2, h3) pour le SEO
- Formatage automatique du code avec détection du langage
- Nettoyage des métadonnées mélangées dans le contenu
- Optimisation SEO du contenu

### 3. OpenAIEnricher

Implémente l'interface `ArticleEnrichiService` avec l'API OpenAI.

**Interface dans le Domain :**

```typescript
// domain/services.ts
export type ArticleEnrichiService = {
  enrichArticle(article: Article): Promise<ArticleEnrichi>;
};
```

**Implémentation :**

```typescript
// infrastructure/adapters/openAIEnricher.ts
export function createOpenAIEnricher(apiKey: string): ArticleEnrichiService {
  return {
    enrichArticle: async (article: Article): Promise<ArticleEnrichi> => {
      // 1. Appel OpenAI pour générer les métadonnées SEO
      // 2. Appel OpenAI pour transformer le contenu en Markdown structuré
      // 3. Calcul des métadonnées (readingTime, wordCount)
      // 4. Retour de l'article enrichi avec toutes les métadonnées
    }
  };
}
```

**Rôle** : Enrichir un article avec des métadonnées SEO complètes en utilisant OpenAI.

### 4. MarkdownFormatter

Implémente l'interface `MarkdownFormatter` avec gray-matter.

**Interface dans le Domain :**

```typescript
// domain/services.ts
export type MarkdownFormatter = {
  formatMarkdown(articleEnriched: ArticleEnrichi): string;
};
```

**Implémentation :**

```typescript
// infrastructure/adapters/markdownFormatter.ts
export const createMarkdownFormatter = (): MarkdownFormatter => {
  return {
    formatMarkdown: (articleEnriched: ArticleEnrichi): string => {
      const frontmatter = createFrontmatter(articleEnriched);
      return matter.stringify(articleEnriched.content, frontmatter);
    },
  };
};
```

**Rôle** : Formater un article enrichi en Markdown avec frontmatter YAML en utilisant gray-matter.

### 5. MarkdownTransformer

Implémentation basique (stub) de l'interface `MarkdownTransformer`.

**Rôle** : Implémentation de base pour transformer HTML en Markdown (actuellement retourne le HTML tel quel).

## Pourquoi cette séparation est puissante ?

### 1. Facile de changer d'implémentation

Vous pouvez créer un autre scraper sans changer le reste du code :

```typescript
// Implémentation avec Playwright (pour JavaScript dynamique)
export const createPlaywrightScraper = (): Scraper => ({
  scrape: async (url: string) => {
    // Utilise Playwright au lieu de cheerio
  }
});
```

Le reste de l'application (use-cases, controllers) reste **inchangé** !

### 2. Testabilité

Vous pouvez créer des adapters de test (mock) :

```typescript
export const createMockScraper = (): Scraper => ({
  scrape: async (url: string) => {
    return { 
      title: "Test", 
      content: "Test content", 
      date: "2024-01-01" 
    };
  }
});
```

### 3. Le Domain reste indépendant

Le Domain ne sait pas que vous utilisez cheerio, OpenAI, gray-matter, ou autre chose. Il ne dépend que de l'interface abstraite.

## Schéma de l'inversion de dépendance

```
┌─────────────────────────────────────┐
│         Domain (services.ts)        │
│  export type Scraper = { ... }       │  ← Interface abstraite
│  export type MarkdownTransformerWithSEO
└─────────────────────────────────────┘
           ↑ implémenté par
           │
┌─────────────────────────────────────┐
│    Infrastructure (adapters)        │
│  createCheerioScraper()             │  ← Implémentations concrètes
│  createOpenAIMarkdownTransformer()  │
│  createOpenAIEnricher()             │
│  createMarkdownFormatter()          │
└─────────────────────────────────────┘
           ↑ utilisé par
           │
┌─────────────────────────────────────┐
│    Application (use-cases)          │
│  scrapeAndTransform(...)             │  ← Utilise l'interface
└─────────────────────────────────────┘
```

## Bonnes pratiques

1. **Une seule responsabilité** : Chaque adapter implémente une seule interface
2. **Fonctions pures quand possible** : Extraire la logique en petites fonctions testables
3. **Gestion d'erreurs** : Gérer les erreurs techniques (réseau, API, etc.)
4. **Pas de logique métier** : L'infrastructure ne doit contenir QUE les détails techniques
5. **Factory functions** : Utiliser des fonctions factory (`createXxx`) pour créer les adapters

## Dépendances

- **Dépend de** : `domain/` (implémente les interfaces)
- **Peut dépendre de** : Librairies externes (cheerio, OpenAI API, gray-matter, etc.)
- **Ne dépend PAS de** : `application/`, `interfaces/`

## Relation avec les autres couches

```
Domain (définit les interfaces)
    ↑ implémenté par
Infrastructure (vous êtes ici)
    ↑ utilisé par
Application (use-cases)
    ↑ appelé par
Interfaces (controllers)
```
