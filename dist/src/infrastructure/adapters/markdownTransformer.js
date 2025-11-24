function toMarkdown(html) {
    return html;
}
export function createMarkdownTransformer() {
    return {
        toMarkdown: toMarkdown,
    };
}
