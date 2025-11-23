# Infrastructure (Implémentations concrètes)

L'**infrastructure** contient les implémentations concrètes des interfaces définies dans le **Domain**. C'est ici que vous utilisez les technologies réelles (cheerio, fichiers système, base de données, etc.).

## Rôle

Cette couche est responsable de :
- Implémenter les interfaces abstraites du Domain
- Utiliser les technologies concrètes (librairies externes)
- Gérer les détails techniques (fichiers, réseau, base de données, etc.)

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
    cheerioScraper.ts      # Implémente Scraper avec cheerio
    fileSystemRepository.ts # Implémente FileRepository (futur)
    sanityPublisher.ts      # Implémente SanityPublisher (futur)
```

## Exemple concret : CheerioScraper

### Interface dans le Domain

Le Domain définit l'interface abstraite :

```typescript
// domain/services.ts
export type Scraper = {
  scrape(url: string): Promise<Article>;
};
```

### Implémentation dans l'Infrastructure

L'infrastructure implémente cette interface avec cheerio :

```typescript
// infrastructure/adapters/cheerioScraper.ts
export const createCheerioScraper = (): Scraper => ({
  scrape: async (url: string) => {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const title = $("title").text().trim();
    const content = $("article").text().trim();
    
    return { title, content, rawHtml: html, date: "..." };
  }
});
```

**Rôle** : Utiliser cheerio pour extraire le contenu d'une page web.

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

Vous pouvez créer un scraper de test (mock) :

```typescript
export const createMockScraper = (): Scraper => ({
  scrape: async (url: string) => {
    return { title: "Test", content: "Test content", rawHtml: "", date: "2024-01-01" };
  }
});
```

### 3. Le Domain reste indépendant

Le Domain ne sait pas que vous utilisez cheerio, Playwright, ou autre chose. Il ne dépend que de l'interface abstraite.

## Schéma de l'inversion de dépendance

```
┌─────────────────────────────────────┐
│         Domain (services.ts)         │
│  export type Scraper = { ... }       │  ← Interface abstraite
└─────────────────────────────────────┘
           ↑ implémenté par
           │
┌─────────────────────────────────────┐
│    Infrastructure (cheerioScraper) │
│  createCheerioScraper(): Scraper    │  ← Implémentation concrète
└─────────────────────────────────────┘
           ↑ utilisé par
           │
┌─────────────────────────────────────┐
│    Application (scrapeContent.ts)    │
│  scrapeContent(scraper: Scraper)     │  ← Utilise l'interface
└─────────────────────────────────────┘
```

## Bonnes pratiques

1. **Une seule responsabilité** : Chaque adapter implémente une seule interface
2. **Fonctions pures quand possible** : Extraire la logique en petites fonctions testables
3. **Gestion d'erreurs** : Gérer les erreurs techniques (réseau, fichiers, etc.)
4. **Pas de logique métier** : L'infrastructure ne doit contenir QUE les détails techniques

## Dépendances

- **Dépend de** : `domain/` (implémente les interfaces)
- **Peut dépendre de** : Librairies externes (cheerio, fs, etc.)
- **Ne dépend PAS de** : `application/`, `interfaces/`

## Exemples futurs

- `fileSystemRepository.ts` : Implémente `FileRepository` pour sauvegarder des fichiers `.md`
- `sanityPublisher.ts` : Implémente `SanityPublisher` pour publier sur Sanity
- `playwrightScraper.ts` : Alternative à cheerio pour les sites avec JavaScript

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

