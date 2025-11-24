export function publishPostToSanity(sanityClient) {
    return async (post) => {
        const documentId = await sanityClient.createDocument(post);
        return documentId;
    };
}
