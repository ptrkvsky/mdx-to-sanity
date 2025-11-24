import { createClient } from "@sanity/client";
export function createSanityClient(projectId, dataset, token) {
    const client = createClient({
        projectId,
        dataset,
        useCdn: false,
        apiVersion: "2024-01-01",
        token,
    });
    return {
        createDocument: async (document) => {
            try {
                const result = await client.create(document);
                return result._id;
            }
            catch (error) {
                throw new Error(`Failed to create document in Sanity: ${error instanceof Error ? error.message : String(error)}`);
            }
        },
    };
}
