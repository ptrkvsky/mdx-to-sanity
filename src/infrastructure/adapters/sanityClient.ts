import { createClient } from "@sanity/client";
import type { Post } from "../../domain/schemas.js";
import type { SanityClient } from "../../domain/services.js";

export function createSanityClient(
	projectId: string,
	dataset: string,
	token: string,
): SanityClient {
	const client = createClient({
		projectId,
		dataset,
		useCdn: false,
		apiVersion: "2024-01-01",
		token,
	});

	return {
		createDocument: async (document: Post): Promise<string> => {
			try {
				const result = await client.create(document);
				return result._id;
			} catch (error) {
				throw new Error(
					`Failed to create document in Sanity: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		},
	};
}

