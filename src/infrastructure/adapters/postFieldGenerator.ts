import type { Post } from "../../domain/schemas.js";
import { slugify } from "./fileRepository.js";

function generateSlug(title: string): { _type: "slug"; current: string } {
	const slug = slugify(title);
	return {
		_type: "slug",
		current: slug || "untitled",
	};
}

function generateDefaultMainImage(
	defaultImageId?: string | null,
): Post["mainImage"] | null {
	if (!defaultImageId) {
		return null;
	}
	return {
		_type: "image",
		asset: {
			_type: "reference",
			_ref: defaultImageId,
		},
	};
}

function generateDefaultCategories(): Post["categories"] {
	return [
		{
			_type: "reference",
			_ref: "category-default",
		},
	];
}

export function generateMissingPostFields(
	frontmatter: Record<string, unknown>,
	defaultImageId?: string | null,
): {
	slug: Post["slug"];
	mainImage: Post["mainImage"] | null;
	categories: Post["categories"];
	type: Post["type"];
	isHome: Post["isHome"];
} {
	const title = (frontmatter.title as string) || "Untitled";

	return {
		slug: generateSlug(title),
		mainImage: generateDefaultMainImage(defaultImageId),
		categories: generateDefaultCategories(),
		type: "post",
		isHome: false,
	};
}
