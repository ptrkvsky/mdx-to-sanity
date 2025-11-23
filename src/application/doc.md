# Application (Use-cases / logique métier)

Contient les scénarios de ton application.

C’est là que tu dis :

"Je veux prendre un URL, le scraper, le transformer en Markdown et le sauvegarder."

Elle utilise les interfaces du domain et les implémentations fournies par l’infrastructure.

Chaque “use-case” est une fonction unique ou classe.

Exemple : scrapeContent.ts ou saveMarkdownFile.ts.

```ts
export const scrapeContent = (scraper: Scraper) => async (url: string) => {
  return await scraper.scrape(url);
};
```
