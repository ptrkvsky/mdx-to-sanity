import { slugify } from "./fileRepository.js";
function generateSlug(title) {
    const slug = slugify(title);
    return {
        _type: "slug",
        current: slug || "untitled",
    };
}
function generateDefaultMainImage() {
    return {
        _type: "image",
        asset: {
            _type: "reference",
            _ref: "image-placeholder-default",
        },
    };
}
function generateDefaultCategories() {
    return [
        {
            _type: "reference",
            _ref: "category-default",
        },
    ];
}
export function generateMissingPostFields(frontmatter) {
    const title = frontmatter.title || "Untitled";
    return {
        slug: generateSlug(title),
        mainImage: generateDefaultMainImage(),
        categories: generateDefaultCategories(),
        type: "post",
        isHome: false,
    };
}
