# MDX to Sanity - Backend Scraping & Transformation

[![Tests](https://github.com/ptrkvsky/mdx-to-sanity/actions/workflows/test.yml/badge.svg)](https://github.com/ptrkvsky/mdx-to-sanity/actions/workflows/test.yml)
[![Coverage](https://img.shields.io/badge/coverage-98.5%25-brightgreen)](https://github.com/ptrkvsky/mdx-to-sanity)

Backend léger construit avec **Hono** permettant de scraper du contenu web et de le transformer en Markdown optimisé SEO avec l'aide d'OpenAI.

## Fonctionnalités

- **Scraping web** : Extraction de contenu depuis n'importe quelle URL
- **Transformation Markdown** : Conversion automatique du HTML en Markdown structuré
- **Optimisation SEO** : Enrichissement automatique avec métadonnées SEO (description, tags, keywords, etc.)
- **Sauvegarde automatique** : Les fichiers Markdown générés sont automatiquement sauvegardés dans `storage/markdown/` avec le format `YYYY-MM-DD-slug-du-titre.md`
- **Architecture Clean** : Architecture modulaire suivant les principes de Clean Architecture

## Installation

```bash
# Cloner le projet
git clone <repo-url>
cd mdx-to-sanity

# Installer les dépendances avec pnpm
pnpm install
```

## Configuration

Créez un fichier `.env` à la racine du projet :

```env
OPENAI_API_KEY=your_openai_api_key
PORT=7777
```

- `OPENAI_API_KEY` : Clé API OpenAI (requis pour la transformation markdown)
- `PORT` : Port du serveur (défaut : 7777)

## Démarrage

```bash
# Mode développement (avec watch)
pnpm run dev

# Build
pnpm run build

# Production
pnpm start
```

Le serveur démarre sur `http://localhost:7777` par défaut.

## Routes API

### POST `/api/scrape`

Scrape une URL et retourne le contenu transformé en Markdown avec métadonnées SEO.

**Requête :**
```json
{
  "url": "https://example.com/article"
}
```

**Réponse :**
- **200 OK** : Retourne le Markdown avec frontmatter (Content-Type: `text/markdown`)
  - Le fichier est également sauvegardé automatiquement dans `storage/markdown/` avec le format `YYYY-MM-DD-slug-du-titre.md`
- **400 Bad Request** : URL manquante ou invalide
- **500 Internal Server Error** : Erreur lors du scraping ou de la transformation

**Exemple :**
```bash
curl -X POST http://localhost:7777/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'
```

### GET `/api/scrape/status`

Vérifie le statut du service.

**Réponse :**
```json
{
  "status": "ok"
}
```

## Exemple d'utilisation

Le projet inclut un fichier `requests.http` avec des exemples de requêtes :

```http
POST http://localhost:7777/api/scrape
Content-Type: application/json

{
  "url": "https://tkdodo.eu/blog/tooltip-components-should-not-exist"
}
```

## Architecture

Le projet suit une architecture Clean Architecture avec les couches suivantes :

- **Domain** : Entités métier et interfaces abstraites
- **Application** : Use-cases (logique métier orchestrée)
- **Infrastructure** : Implémentations concrètes (adapters)
- **Interfaces** : Points d'entrée HTTP (routes, controllers)

Voir `DOC.md` pour la documentation complète de l'architecture.

## Technologies

- **Hono** : Framework web léger
- **Cheerio** : Scraping HTML
- **OpenAI API** : Transformation et enrichissement du contenu
- **gray-matter** : Gestion du frontmatter Markdown
- **TypeScript** : Typage statique
- **PNPM** : Gestionnaire de paquets

## Structure du projet

```
src/
  application/        # Use-cases (logique métier)
  domain/            # Entités et interfaces abstraites
  infrastructure/    # Implémentations concrètes (adapters)
  interfaces/        # Points d'entrée HTTP
  index.ts          # Point d'entrée de l'application
```

## Tests

Le projet inclut une suite de tests complète avec **Vitest**.

```bash
# Exécuter les tests
pnpm test

# Mode watch
pnpm test:watch

# Avec couverture de code
pnpm test:coverage
```

**Couverture actuelle : 98.5%**

- Statements : 98.46%
- Branches : 94.04%
- Functions : 100%
- Lines : 98.45%

## Documentation

- `DOC.md` : Documentation complète de l'architecture
- `src/domain/doc.md` : Documentation de la couche Domain
- `src/application/doc.md` : Documentation de la couche Application
- `src/infrastructure/doc.md` : Documentation de la couche Infrastructure
- `src/interfaces/doc.md` : Documentation de la couche Interfaces
