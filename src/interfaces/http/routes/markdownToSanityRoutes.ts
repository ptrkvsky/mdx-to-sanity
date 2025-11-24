import { Hono } from "hono";
import type {
	MarkdownToPortableTextConverter,
	SanityClient,
} from "../../../domain/services.js";
import { createMarkdownToSanityController } from "../controllers/markdownToSanityController.js";

export function createMarkdownToSanityRouter(
	converter: MarkdownToPortableTextConverter,
	sanityClient?: SanityClient,
) {
	const router = new Hono();
	const controller = createMarkdownToSanityController(converter, sanityClient);

	router.post("/", controller);

	return router;
}

