import { Hono } from "hono";
import type {
	FileRepository,
	Logger,
	MarkdownTransformerWithSEO,
	Scraper,
} from "../../../domain/services.js";
import { createScrapeController } from "../controllers/scrapeController.js";

export const createScrapeRouter = (
	scraper: Scraper,
	transformer: MarkdownTransformerWithSEO,
	repository?: FileRepository,
	logger?: Logger,
) => {
	const router = new Hono();
	const scrapeController = createScrapeController(
		scraper,
		transformer,
		repository,
		logger,
	);

	router.post("/", scrapeController);

	router.get("/status", (c) => {
		return c.json({ status: "ok" }, 200);
	});

	router.get("/:id", (c) => {
		return c.json({ status: "ok" }, 200);
	});

	return router;
};
