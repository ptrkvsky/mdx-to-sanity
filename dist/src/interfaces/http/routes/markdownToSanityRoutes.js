import { Hono } from "hono";
import { createMarkdownToSanityController } from "../controllers/markdownToSanityController.js";
export function createMarkdownToSanityRouter(converter, sanityClient) {
    const router = new Hono();
    const controller = createMarkdownToSanityController(converter, sanityClient);
    router.post("/", controller);
    return router;
}
