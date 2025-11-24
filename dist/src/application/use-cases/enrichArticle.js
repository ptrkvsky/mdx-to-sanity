export const enrichArticle = (enricher) => async (article) => {
    return await enricher.enrichArticle(article);
};
