import type { Post } from "../../domain/schemas.js";
import type { SanityClient } from "../../domain/services.js";

export function publishPostToSanity(sanityClient: SanityClient) {
	return async (post: Post): Promise<string> => {
		const documentId = await sanityClient.createDocument(post);
		return documentId;
	};
}

