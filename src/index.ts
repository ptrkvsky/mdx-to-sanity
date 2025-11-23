import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createCheerioScraper } from "./infrastructure/adapters/cheerioScraper.js";
import { createScrapeRouter } from "./interfaces/http/routes/scrapeRoutes.js";

const app = new Hono();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

const scraper = createCheerioScraper();
const scrapeRouter = createScrapeRouter(scraper);
app.route("/api/scrape", scrapeRouter);

const port = Number(process.env.PORT) || 7777;

serve(
	{
		fetch: app.fetch,
		port,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
