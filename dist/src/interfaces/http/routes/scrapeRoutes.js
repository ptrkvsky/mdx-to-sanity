import { Hono } from "hono";
import { createScrapeController } from "../controllers/scrapeController.js";
export const createScrapeRouter = (scraper, transformer, repository) => {
    const router = new Hono();
    const scrapeController = createScrapeController(scraper, transformer, repository);
    router.post("/", scrapeController);
    router.get("/status", (c) => {
        return c.json({ status: "ok" }, 200);
    });
    router.get("/:id", (c) => {
        return c.json({ status: "ok" }, 200);
    });
    return router;
};
