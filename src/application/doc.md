# Application (Use-cases / Logique métier orchestrée)

La couche **Application** contient la logique métier orchestrée. C'est ici que vous définissez **CE QUE VOTRE APPLICATION FAIT** en combinant les services du Domain.

## Rôle

Cette couche est responsable de :
- Orchestrer les scénarios métier (use-cases)
- Combiner les services du Domain pour réaliser une action complète
- Ne pas connaître les détails techniques (comment on scrape, comment on sauvegarde)

## Structure

```
application/
  use-cases/
    scrapeContent.ts        # Scraper une URL
    convertToMarkdown.ts    # Transformer HTML en Markdown (futur)
    saveMarkdownFile.ts     # Sauvegarder un fichier (futur)
    publishToSanity.ts      # Publier sur Sanity (futur)
```

## Exemple concret : scrapeContent

### Code actuel

```typescript
// application/use-cases/scrapeContent.ts
export const scrapeContent =
  (scraper: Scraper) =>
  async (url: string): Promise<Article> => {
    return await scraper.scrape(url);
  };
```

### Explication étape par étape

1. **Currying** : `scrapeContent` prend d'abord le `scraper` en paramètre
2. **Retourne une fonction** : Qui prend l'`url` et retourne une `Promise<Article>`
3. **Injection de dépendances** : Le scraper est injecté, pas créé dans le use-case

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
scrapeContent(scraper)  ← Injection de dépendance
    ↓
Retourne une fonction qui prend l'URL
    ↓
scrapeArticle(url)      ← Appel avec les données
    ↓
scraper.scrape(url)     ← Utilise l'interface du Domain
    ↓
Retourne Article
```

## Exemple d'utilisation

Dans le controller :

```typescript
// 1. Créer le scraper (dans index.ts)
const scraper = createCheerioScraper();

// 2. Injecter dans le controller
const scrapeController = createScrapeController(scraper);

// 3. Dans le controller, utiliser le use-case
const scrapeArticle = scrapeContent(scraper);
const article = await scrapeArticle(url);
```

## Use-cases futurs

### Exemple : Scraper + Transformer + Sauvegarder

```typescript
export const scrapeAndSave = (
  scraper: Scraper,
  transformer: MarkdownTransformer,
  repository: FileRepository
) => async (url: string) => {
  // 1. Scraper
  const article = await scraper.scrape(url);
  
  // 2. Transformer en Markdown
  const markdown = transformer.toMarkdown(article.rawHtml);
  
  // 3. Sauvegarder
  const filename = `${article.date}-${article.title}.md`;
  await repository.saveMarkdown(filename, markdown);
  
  return { article, filename };
};
```

**Rôle** : Orchestrer plusieurs services pour réaliser un scénario complet.

## Bonnes pratiques

1. **Une fonction = Un use-case** : Chaque fichier contient un seul use-case
2. **Injection de dépendances** : Les services sont injectés, pas créés
3. **Fonctions pures** : Les use-cases sont des fonctions pures (pas d'effets de bord cachés)
4. **Pas de détails techniques** : Le use-case ne sait pas comment le scraper fonctionne, juste ce qu'il fait

## Dépendances

- **Dépend de** : `domain/` (utilise les interfaces abstraites)
- **Ne dépend PAS de** : `infrastructure/` (ne connaît pas les implémentations concrètes)
- **Ne dépend PAS de** : `interfaces/` (ne connaît pas HTTP, CLI, etc.)

## Schéma du flux

```
┌─────────────────────────────────────┐
│    Interfaces (Controller)          │
│  createScrapeController(scraper)   │
└──────────────┬─────────────────────┘
               │ appelle
               ↓
┌─────────────────────────────────────┐
│    Application (Use-case)           │  ← Vous êtes ici
│  scrapeContent(scraper)(url)       │
└──────────────┬─────────────────────┘
               │ utilise
               ↓
┌─────────────────────────────────────┐
│    Domain (Interface)                │
│  type Scraper = { scrape(...) }    │
└──────────────┬─────────────────────┘
               ↑ implémenté par
               │
┌─────────────────────────────────────┐
│    Infrastructure (Adapter)          │
│  createCheerioScraper()             │
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
