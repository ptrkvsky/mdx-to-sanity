import { createClient } from "@sanity/client";
import type { Post } from "../../domain/schemas.js";
import type { Logger, SanityClient } from "../../domain/services.js";

export function createSanityClient(
	projectId: string,
	dataset: string,
	token: string,
	logger?: Logger,
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
		getCategories: async () => {
			try {
				const query = `*[_type == "category"] {
					_id,
					title,
					slug
				} | order(title asc)`;
				const categories = await client.fetch(query);
				return categories;
			} catch (error) {
				throw new Error(
					`Failed to fetch categories from Sanity: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		},
		getDefaultImage: async () => {
			try {
				// Récupérer la première image disponible dans Sanity
				const query = `*[_type == "sanity.imageAsset"] | order(_createdAt desc) [0]._id`;
				const imageId = await client.fetch(query);
				return imageId || null;
			} catch (error) {
				logger?.warn("Failed to fetch default image from Sanity", {
					error: error instanceof Error ? error.message : String(error),
				});
				return null;
			}
		},
	};
}
