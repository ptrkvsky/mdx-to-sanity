import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createCheerioScraper } from "./infrastructure/adapters/cheerioScraper.js";
import { createFileRepository } from "./infrastructure/adapters/fileRepository.js";
import { createOpenAIMarkdownTransformer } from "./infrastructure/adapters/openAIMarkdownTransformer.js";
import { createOpenAIPortableTextConverter } from "./infrastructure/adapters/openAIPortableTextConverter.js";
import { createSanityClient } from "./infrastructure/adapters/sanityClient.js";
import { createScrapeRouter } from "./interfaces/http/routes/scrapeRoutes.js";
import { createMarkdownToSanityRouter } from "./interfaces/http/routes/markdownToSanityRoutes.js";
const app = new Hono();
app.get("/", (c) => {
    return c.text("Hello Hono!");
});
// Injection de dépendances
const scraper = createCheerioScraper();
const apiKey = process.env.OPENAI_API_KEY || "";
if (!apiKey) {
    console.warn("⚠️  OPENAI_API_KEY n'est pas définie. Les fonctionnalités de transformation OpenAI ne fonctionneront pas.");
}
const transformer = createOpenAIMarkdownTransformer(apiKey);
const repository = createFileRepository();
const scrapeRouter = createScrapeRouter(scraper, transformer, repository);
app.route("/api/scrape", scrapeRouter);
// Markdown to Sanity routes
const openAIPortableTextConverter = createOpenAIPortableTextConverter(apiKey);
const sanityProjectId = process.env.SANITY_PROJECT_ID;
const sanityDataset = process.env.SANITY_DATASET || "production";
const sanityToken = process.env.SANITY_API_TOKEN;
let sanityClient;
if (sanityProjectId && sanityToken) {
    sanityClient = createSanityClient(sanityProjectId, sanityDataset, sanityToken);
}
else {
    console.warn("⚠️  SANITY_PROJECT_ID ou SANITY_API_TOKEN non définis. La publication sur Sanity ne fonctionnera pas.");
}
const markdownToSanityRouter = createMarkdownToSanityRouter(openAIPortableTextConverter, sanityClient);
app.route("/api/markdown-to-sanity", markdownToSanityRouter);
const port = Number(process.env.PORT) || 7777;
serve({
    fetch: app.fetch,
    port,
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
