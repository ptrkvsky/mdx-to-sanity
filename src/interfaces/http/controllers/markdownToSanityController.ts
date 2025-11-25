import type { Context } from "hono";
import { convertMarkdownToSanityPost } from "../../../application/use-cases/convertMarkdownToSanityPost.js";
import { publishPostToSanity } from "../../../application/use-cases/publishPostToSanity.js";
import type {
	Logger,
	MarkdownToPortableTextConverter,
	SanityClient,
} from "../../../domain/services.js";
import { parseMarkdownFile } from "../../../infrastructure/adapters/markdownFileParser.js";
import type { CategorySelector } from "../../../infrastructure/adapters/openAICategorySelector.js";

type RequestBody =
	| { filePath: string; publish?: boolean }
	| {
			markdown: string;
			frontmatter?: Record<string, unknown>;
			publish?: boolean;
	  };

function validateRequestBody(body: unknown): RequestBody | null {
	if (typeof body === "object" && body !== null) {
		const bodyObj = body as Record<string, unknown>;
		if ("filePath" in bodyObj && typeof bodyObj.filePath === "string") {
			return {
				filePath: bodyObj.filePath,
				publish: bodyObj.publish === true,
			};
		}
		if ("markdown" in bodyObj && typeof bodyObj.markdown === "string") {
			return {
				markdown: bodyObj.markdown,
				frontmatter:
					"frontmatter" in bodyObj &&
					typeof bodyObj.frontmatter === "object" &&
					bodyObj.frontmatter !== null
						? (bodyObj.frontmatter as Record<string, unknown>)
						: undefined,
				publish: bodyObj.publish === true,
			};
		}
	}
	return null;
}

export function createMarkdownToSanityController(
	converter: MarkdownToPortableTextConverter,
	sanityClient?: SanityClient,
	categorySelector?: CategorySelector,
	logger?: Logger,
) {
	return async (c: Context) => {
		try {
			const body = await c.req.json();
			const request = validateRequestBody(body);

			if (!request) {
				return c.json(
					{
						error:
							"Request body must contain either 'filePath' (string) or 'markdown' (string) with optional 'frontmatter'",
					},
					400,
				);
			}

			const convertPost = convertMarkdownToSanityPost(
				converter,
				sanityClient,
				categorySelector,
				logger,
			);

			let post;
			if ("filePath" in request) {
				const parsed = parseMarkdownFile(request.filePath);
				post = await convertPost(parsed.content, parsed.frontmatter);
			} else {
				post = await convertPost(request.markdown, request.frontmatter);
			}

			if (request.publish && sanityClient) {
				const publish = publishPostToSanity(sanityClient);
				const documentId = await publish(post);
				return c.json(
					{
						success: true,
						post,
						documentId,
						published: true,
					},
					201,
				);
			}

			return c.json(
				{
					success: true,
					post,
					published: false,
				},
				200,
			);
		} catch (error) {
			logger?.error(
				"Markdown to Sanity conversion error",
				error instanceof Error ? error : new Error(String(error)),
				{
					endpoint: c.req.path,
					method: c.req.method,
				},
			);
			return c.json(
				{
					error:
						error instanceof Error
							? error.message
							: "Failed to convert markdown to Sanity post",
				},
				500,
			);
		}
	};
}
