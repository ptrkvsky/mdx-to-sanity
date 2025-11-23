# Documentation du projet : Backend Scraping & Publication Sanity

## 1. Présentation

Ce projet est un backend léger construit avec **Hono**.  
Il permet de :

1. Scraper du contenu depuis le web.
2. Transformer le contenu en Markdown.
3. Stocker les articles dans des fichiers `.md`.
4. Publier les articles sur **Sanity**.

L’architecture suit les principes de la **Clean Architecture**, séparant les responsabilités pour un code maintenable et évolutif.

---

## 2. Architecture

### 2.1 Vue d’ensemble

```
src/
  application/
    use-cases/
      scrapeContent.ts
      convertToMarkdown.ts
      saveMarkdownFile.ts
      publishToSanity.ts
  domain/
    entities/
      Article.ts
    services/
      MarkdownTransformer.ts
      Scraper.ts
  infrastructure/
    adapters/
      fileSystemRepository.ts
      sanityPublisher.ts
      scraperAdapter.ts
    config/
      env.ts
  interfaces/
    http/
      routes/
        scrapeRoutes.ts
      controllers/
        scrapeController.ts
  server.ts
```

---

### 2.2 Couches

#### 2.2.1 Domain

- Contient le **modèle métier** et les **interfaces abstraites**.
- Exemples :
  - `Article.ts` : représente un article (`title`, `content`, `rawHtml`, `date`).
  - `MarkdownTransformer.ts` : interface pour transformer HTML → Markdown.
  - `Scraper.ts` : interface pour le scraping (`scrape(url)`).

#### 2.2.2 Application (Use-cases)

- Contient la **logique métier orchestrée**.
- Implémente les scénarios :
  - `scrapeContent` : récupérer le contenu depuis une URL.
  - `convertToMarkdown` : transformer le contenu en Markdown.
  - `saveMarkdownFile` : sauvegarder le Markdown dans un fichier.
  - `publishToSanity` : envoyer l’article vers Sanity.

#### 2.2.3 Infrastructure

- Implémente les interfaces du Domain avec les **technologies concrètes**.
- Exemples :
  - `fileSystemRepository.ts` : écrit les fichiers `.md`.
  - `scraperAdapter.ts` : utilise `cheerio` ou `playwright` pour le scraping.
  - `sanityPublisher.ts` : client Sanity pour publier des documents.

#### 2.2.4 Interfaces / Entrées

- Points d’entrée de l’application.
- Pour le backend Hono :
  - `routes/` : définit les routes REST.
  - `controllers/` : appelle les use-cases avec les dépendances injectées.

#### 2.2.5 Injection de dépendances

- Les dépendances concrètes sont **construites une seule fois** dans `server.ts`.
- Exemple :

```ts
const scraper = new PlaywrightScraper();
const mdTransformer = new RemarkTransformer();
const repo = new FileSystemRepository();
const sanity = new SanityPublisher();

const deps = { scraper, mdTransformer, repo, sanity };
```

- Les use-cases reçoivent ces dépendances via paramètres (dependency injection).

---

## 3. Installation

```bash
git clone <repo-url>
cd project
npm install
```

### Variables d’environnement (exemple `.env`)

```env
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_TOKEN=your_sanity_token
SCRAPER_USER_AGENT=Mozilla/5.0
```

---

## 4. Structure des fichiers Markdown

- Chaque article est sauvegardé sous `content/articles/`.
- Exemple : `2025-11-23-mon-article.md`
- Format Markdown :

```md
---
title: "Titre de l'article"
date: "2025-11-23"
---

Contenu de l'article en Markdown...
```

---

## 5. Routes HTTP (exemple Hono)

- `POST /scrape` → scrap un article et le stocke en Markdown.
- `POST /publish` → publie un article sur Sanity.

Exemple de route :

```ts
app.post("/scrape", scrapeController(deps));
```

---

## 6. Bonnes pratiques

- **Séparer les responsabilités** : scraping, transformation, stockage, publication.
- **Injecter les dépendances** pour faciliter les tests.
- **Ne jamais mettre de logique métier dans les adapters** (infrastructure) ou routes.
- **Versionner les fichiers Markdown** si nécessaire pour audit.
- **Écrire des tests unitaires** pour chaque use-case.

---

## 7. Étapes futures

1. Ajouter un scheduler / cron pour scraper automatiquement.
2. Ajouter des tests unitaires et d’intégration.
3. Ajouter un système de logs et monitoring.
4. Permettre de publier plusieurs articles en batch sur Sanity.
