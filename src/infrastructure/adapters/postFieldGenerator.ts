import type { Post } from "../../domain/schemas.js";
import { slugify } from "./fileRepository.js";

function generateSlug(title: string): { _type: "slug"; current: string } {
	const slug = slugify(title);
	return {
		_type: "slug",
		current: slug || "untitled",
	};
}

function generateDefaultMainImage(): Post["mainImage"] {
	return {
		_type: "image",
		asset: {
			_type: "reference",
			_ref: "image-placeholder-default",
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
): {
	slug: Post["slug"];
	mainImage: Post["mainImage"];
	categories: Post["categories"];
	type: Post["type"];
	isHome: Post["isHome"];
} {
	const title = (frontmatter.title as string) || "Untitled";

	return {
		slug: generateSlug(title),
		mainImage: generateDefaultMainImage(),
		categories: generateDefaultCategories(),
		type: "post",
		isHome: false,
	};
}

