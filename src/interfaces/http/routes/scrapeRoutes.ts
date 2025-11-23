import { Hono } from "hono";
import type {
	MarkdownTransformerWithSEO,
	Scraper,
} from "../../../domain/services.js";
import { createScrapeController } from "../controllers/scrapeController.js";

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

	router.get("/:id", (c) => {
		return c.json({ status: "ok" }, 200);
	});

	return router;
};
