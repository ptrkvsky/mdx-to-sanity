# Interfaces (Points d'entrée de l'application)

Les **interfaces** représentent les points d'entrée de votre application. C'est ici que le monde extérieur (clients HTTP, CLI, etc.) communique avec votre application.

## Rôle

Cette couche est responsable de :
- Recevoir les requêtes externes (HTTP, CLI, etc.)
- Valider les données d'entrée
- Appeler les use-cases de la couche **Application**
- Formater les réponses pour le client

## Structure

```
interfaces/
  http/
    routes/        # Définit les routes HTTP (POST /api/scrape, etc.)
    controllers/   # Contrôleurs qui appellent les use-cases
```

## Flux de données

```
Requête HTTP
    ↓
Route (scrapeRoutes.ts)
    ↓
Controller (scrapeController.ts)
    ↓
Use-case (application/use-cases/)
    ↓
Réponse HTTP
```

## Routes disponibles

### POST `/api/scrape`

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

### GET `/api/scrape/status`

Vérifie le statut du service.

**Réponse :**
```json
{
  "status": "ok"
}
```

## Exemple concret : Scraping

### 1. Route (`routes/scrapeRoutes.ts`)

La route définit l'endpoint HTTP et crée le contrôleur :

```typescript
export const createScrapeRouter = (
  scraper: Scraper,
  transformer: MarkdownTransformerWithSEO,
) => {
  const router = new Hono();
  const scrapeController = createScrapeController(scraper, transformer);

  router.post("/", scrapeController);

  router.get("/status", (c) => {
    return c.json({ status: "ok" }, 200);
  });

  return router;
};
```

**Rôle** : Définir les routes et connecter les contrôleurs.

### 2. Controller (`controllers/scrapeController.ts`)

Le contrôleur :
- Reçoit la requête HTTP
- Valide les données (URL dans le body)
- Appelle le use-case
- Gère les erreurs
- Retourne la réponse

```typescript
export function createScrapeController(
  scraper: Scraper,
  transformer: MarkdownTransformerWithSEO,
) {
  return async (c: Context) => {
    try {
      const body = await c.req.json();
      const url = validateUrl(body);

      if (!url) {
        return c.json({ error: "URL is required and must be a string" }, 400);
      }

      const scrapeAndTransformArticle = scrapeAndTransform(
        scraper,
        transformer,
      );
      const markdown = await scrapeAndTransformArticle(url);

      return c.text(markdown, 200, {
        "Content-Type": "text/markdown",
      });
    } catch (error) {
      console.error("Scraping error:", error);
      return c.json({ error: "Failed to scrape and transform content" }, 500);
    }
  };
}
```

**Rôle** : Orchestrer l'appel au use-case et gérer la réponse HTTP.

## Validation des données

Le controller valide les données d'entrée avant d'appeler le use-case :

```typescript
function validateUrl(body: unknown): string | null {
  if (typeof body === "object" && body !== null && "url" in body) {
    const url = (body as { url: unknown }).url;
    return typeof url === "string" ? url : null;
  }
  return null;
}
```

**Rôle** : S'assurer que l'URL est présente et valide avant de procéder au scraping.

## Format de réponse

### Succès (200 OK)

Le controller retourne le Markdown avec le Content-Type approprié :

```typescript
return c.text(markdown, 200, {
  "Content-Type": "text/markdown",
});
```

Le Markdown retourné inclut un frontmatter YAML :

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

### Erreurs

- **400 Bad Request** : URL manquante ou invalide
- **500 Internal Server Error** : Erreur lors du scraping ou de la transformation

## Bonnes pratiques

1. **Validation des entrées** : Toujours valider les données avant d'appeler les use-cases
2. **Gestion d'erreurs** : Capturer les erreurs et retourner des codes HTTP appropriés
3. **Pas de logique métier** : Le controller ne doit contenir QUE la logique de communication HTTP
4. **Injection de dépendances** : Les use-cases sont injectés via les paramètres
5. **Format de réponse cohérent** : Utiliser les bons Content-Type (text/markdown pour le Markdown)

## Dépendances

- **Dépend de** : `application/` (use-cases)
- **Ne dépend PAS de** : `infrastructure/` (les implémentations concrètes sont injectées)

## Pourquoi cette séparation ?

En séparant les routes et les controllers :
- Vous pouvez facilement changer de framework HTTP (Hono → Express, etc.)
- Les controllers sont testables indépendamment
- La logique de communication HTTP est isolée de la logique métier

## Relation avec les autres couches

```
Interfaces (vous êtes ici)
    ↓ utilise
Application (use-cases)
    ↓ utilise
Domain (interfaces abstraites)
    ↑ implémenté par
Infrastructure (adapters concrets)
```

## Exemple d'utilisation

Dans `index.ts`, les routes sont configurées :

```typescript
const scraper = createCheerioScraper();
const transformer = createOpenAIMarkdownTransformer(apiKey);

const scrapeRouter = createScrapeRouter(scraper, transformer);
app.route("/api/scrape", scrapeRouter);
```

Le client peut alors appeler :

```bash
curl -X POST http://localhost:7777/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'
```

Et recevoir le Markdown avec frontmatter en réponse.
