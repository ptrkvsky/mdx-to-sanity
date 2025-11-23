import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createCheerioScraper } from "./infrastructure/adapters/cheerioScraper.js";
import { createOpenAIMarkdownTransformer } from "./infrastructure/adapters/openAIMarkdownTransformer.js";
import { createScrapeRouter } from "./interfaces/http/routes/scrapeRoutes.js";

const app = new Hono();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

// Injection de dépendances
const scraper = createCheerioScraper();

const apiKey = process.env.OPENAI_API_KEY || "";
if (!apiKey) {
	console.warn(
		"⚠️  OPENAI_API_KEY n'est pas définie. Les fonctionnalités de transformation OpenAI ne fonctionneront pas.",
	);
}
const transformer = createOpenAIMarkdownTransformer(apiKey);

const scrapeRouter = createScrapeRouter(scraper, transformer);
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
