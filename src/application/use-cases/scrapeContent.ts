import type { Article } from "../../domain/entities.js";
import type { Scraper } from "../../domain/services.js";

export const scrapeContent =
  (scraper: Scraper) =>
  async (url: string): Promise<Article> => {
    return await scraper.scrape(url);
  };
