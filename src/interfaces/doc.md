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

## Exemple concret : Scraping

### 1. Route (`routes/scrapeRoutes.ts`)

La route définit l'endpoint HTTP et crée le contrôleur :

```typescript
export const createScrapeRouter = (scraper: Scraper) => {
  const router = new Hono();
  const scrapeController = createScrapeController(scraper);

  router.post("/scrape", scrapeController);
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
export const createScrapeController = (scraper: Scraper) => {
  return async (c: Context) => {
    const body = await c.req.json();
    const url = validateUrl(body);

    if (!url) {
      return c.json({ error: "URL is required" }, 400);
    }

    const scrapeArticle = scrapeContent(scraper);
    const article = await scrapeArticle(url);

    return c.json(article, 200);
  };
};
```

**Rôle** : Orchestrer l'appel au use-case et gérer la réponse HTTP.

## Bonnes pratiques

1. **Validation des entrées** : Toujours valider les données avant d'appeler les use-cases
2. **Gestion d'erreurs** : Capturer les erreurs et retourner des codes HTTP appropriés
3. **Pas de logique métier** : Le controller ne doit contenir QUE la logique de communication HTTP
4. **Injection de dépendances** : Les use-cases sont injectés via les paramètres

## Dépendances

- **Dépend de** : `application/` (use-cases)
- **Ne dépend PAS de** : `infrastructure/` (les implémentations concrètes)

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

