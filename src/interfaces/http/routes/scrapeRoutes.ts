import { Hono } from "hono";
import type { Scraper } from "../../../domain/services.js";
import { createScrapeController } from "../controllers/scrapeController.js";

export const createScrapeRouter = (scraper: Scraper) => {
	const router = new Hono();
	const scrapeController = createScrapeController(scraper);

	router.post("/", scrapeController);

	router.get("/scrape/status", (c) => {
		return c.json({ status: "ok" }, 200);
	});

	router.get("/scrape/:id", (c) => {
		return c.json({ status: "ok" }, 200);
	});

	return router;
};
