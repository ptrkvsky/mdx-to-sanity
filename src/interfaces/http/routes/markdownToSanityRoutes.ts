import { Hono } from "hono";
import type {
	Logger,
	MarkdownToPortableTextConverter,
	SanityClient,
} from "../../../domain/services.js";
import { createMarkdownToSanityController } from "../controllers/markdownToSanityController.js";
import type { CategorySelector } from "../../../infrastructure/adapters/openAICategorySelector.js";

export function createMarkdownToSanityRouter(
	converter: MarkdownToPortableTextConverter,
	sanityClient?: SanityClient,
	categorySelector?: CategorySelector,
	logger?: Logger,
) {
	const router = new Hono();
	const controller = createMarkdownToSanityController(
		converter,
		sanityClient,
		categorySelector,
		logger,
	);

	router.post("/", controller);

	return router;
}
