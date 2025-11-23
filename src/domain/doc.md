# Domain (Domaine / Cœur métier)

Le **Domain** est le cœur de votre application. Il contient le modèle métier et les interfaces abstraites, **sans aucune dépendance externe**.

## Pourquoi cette couche existe ?

Le Domain est la **fondation** de votre architecture. Il définit :
- **CE QUE votre application sait faire** (les interfaces)
- **SANS savoir COMMENT** (pas d'implémentations)

C'est le principe de **Dependency Inversion** : les couches externes dépendent du Domain, pas l'inverse.

## Rôle

Cette couche est responsable de :
- Définir les entités métier (objets du domaine)
- Définir les interfaces abstraites des services
- **Ne JAMAIS dépendre** d'autres couches (infrastructure, interfaces, application)

## Structure

```
domain/
  entities.ts    # Types des objets métier (Article, etc.)
  services.ts    # Interfaces abstraites (Scraper, MarkdownTransformer, etc.)
```

## Les Entités (`entities.ts`)

Les entités représentent les objets métier de votre application.

### Exemple : Article

```typescript
export type Article = {
  title: string;
  content: string;
  rawHtml: string;
  date: string;
};
```

**Rôle** : Définir la structure d'un article dans votre domaine métier.

## Les Services (`services.ts`)

Les services définissent **CE QUE l'application peut faire**, mais **PAS COMMENT**.

### Exemple : Scraper

```typescript
export type Scraper = {
  scrape(url: string): Promise<Article>;
};
```

**Rôle** : Définir qu'on peut scraper une URL pour obtenir un Article, sans dire comment (cheerio, Playwright, etc.).

### Autres services

```typescript
export type MarkdownTransformer = {
  toMarkdown: (html: string) => string;
};

export type FileRepository = {
  saveMarkdown: (filename: string, content: string): Promise<void>;
};
```

## Principe : Dependency Inversion

En Clean Architecture, **les dépendances pointent vers l'intérieur** :

```
┌─────────────────────────────────────┐
│         Domain (vous êtes ici)      │
│  - entities.ts                      │
│  - services.ts                      │
│                                     │
│  Ne dépend de RIEN                 │
└─────────────────────────────────────┘
           ↑ dépend de
           │
┌─────────────────────────────────────┐
│         Application                 │
│  Utilise les interfaces du Domain   │
└─────────────────────────────────────┘
           ↑ dépend de
           │
┌─────────────────────────────────────┐
│         Infrastructure              │
│  Implémente les interfaces          │
└─────────────────────────────────────┘
           ↑ utilisé par
           │
┌─────────────────────────────────────┐
│         Interfaces                  │
│  Appelle les use-cases              │
└─────────────────────────────────────┘
```

## Pourquoi le Domain ne dépend de rien ?

### 1. Indépendance technologique

Le Domain ne sait pas que vous utilisez :
- Cheerio ou Playwright pour le scraping
- Le système de fichiers ou une base de données
- Hono ou Express pour HTTP

**Résultat** : Vous pouvez changer de technologie sans toucher au Domain.

### 2. Testabilité

Vous pouvez tester le Domain sans aucune dépendance externe :

```typescript
// Test du Domain - pas besoin de cheerio, de fichiers, etc.
const mockScraper: Scraper = {
  scrape: async (url) => ({ title: "Test", ... })
};
```

### 3. Réutilisabilité

Le Domain peut être réutilisé dans différents contextes :
- Application web (Hono)
- Application CLI
- Tests
- Autres projets

## Schéma des dépendances

```
                    Domain
                      ↑
                      │ dépend de
         ┌────────────┴────────────┐
         │                         │
    Application              Infrastructure
         │                         │
         │ utilise                 │ implémente
         │                         │
         └────────────┬────────────┘
                      │
                  Interfaces
```

**Règle d'or** : Toutes les flèches pointent vers le Domain (vers l'intérieur).

## Bonnes pratiques

1. **Pas d'imports externes** : Le Domain ne doit importer QUE des types TypeScript natifs
2. **Interfaces minimales** : Chaque interface doit avoir une seule responsabilité
3. **Types explicites** : Utiliser des types TypeScript, pas de classes
4. **Pas de logique** : Le Domain définit la structure, pas l'implémentation

## Exemple concret dans le projet

### 1. Le Domain définit l'interface

```typescript
// domain/services.ts
export type Scraper = {
  scrape(url: string): Promise<Article>;
};
```

### 2. L'Infrastructure implémente

```typescript
// infrastructure/adapters/cheerioScraper.ts
export const createCheerioScraper = (): Scraper => ({
  scrape: async (url) => {
    // Implémentation avec cheerio
  }
});
```

### 3. L'Application utilise

```typescript
// application/use-cases/scrapeContent.ts
export const scrapeContent = (scraper: Scraper) => async (url: string) => {
  return await scraper.scrape(url);
};
```

**Le Domain ne sait pas que cheerio existe !**

## Relation avec les autres couches

```
Domain (vous êtes ici - cœur métier)
    ↑ définit les interfaces pour
    │
    ├─→ Application (utilise les interfaces)
    │
    └─→ Infrastructure (implémente les interfaces)
```

## Avantages de cette approche

1. **Flexibilité** : Changez d'implémentation sans toucher au Domain
2. **Testabilité** : Testez le Domain isolément
3. **Maintenabilité** : Le Domain reste stable même si les technologies changent
4. **Compréhension** : Le Domain exprime clairement le métier, sans détails techniques

## Résumé

Le Domain est le **contrat** de votre application :
- Il dit **CE QU'ON VEUT FAIRE** (interfaces)
- Il ne dit **PAS COMMENT** (pas d'implémentations)
- Il ne dépend **DE RIEN** (indépendance totale)

C'est la base solide sur laquelle tout le reste s'appuie.
