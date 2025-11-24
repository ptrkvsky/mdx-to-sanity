export const convertToMarkdown = (formatter) => (articleEnriched) => {
    return formatter.formatMarkdown(articleEnriched);
};
