import { z } from "zod";
// ============================================
// SCHÉMAS DE BASE SANITY
// ============================================
// Référence Sanity
export const SanityReferenceSchema = z.object({
    _type: z.literal("reference"),
    _ref: z.string(),
});
// Slug Sanity
export const SanitySlugSchema = z.object({
    _type: z.literal("slug"),
    current: z.string().max(96),
});
// Image Crop Sanity
export const SanityImageCropSchema = z.object({
    top: z.number().min(0).max(1),
    bottom: z.number().min(0).max(1),
    left: z.number().min(0).max(1),
    right: z.number().min(0).max(1),
});
// Image Hotspot Sanity
export const SanityImageHotspotSchema = z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    height: z.number().min(0).max(1),
    width: z.number().min(0).max(1),
});
// Image Sanity (générique)
export const SanityImageSchema = z.object({
    _type: z.literal("image"),
    asset: SanityReferenceSchema,
    crop: SanityImageCropSchema.optional(),
    hotspot: SanityImageHotspotSchema.optional(),
});
// ============================================
// SCHÉMAS DE BLOCS DE CONTENU
// ============================================
// Annotation de lien interne
export const InternalLinkAnnotationSchema = z.object({
    _type: z.literal("internalLink"),
    _key: z.string(),
    reference: SanityReferenceSchema,
});
// Annotation de lien externe
export const ExternalLinkAnnotationSchema = z.object({
    _type: z.literal("link"),
    _key: z.string(),
    href: z.string().url(),
});
// Span de texte avec marks
export const TextSpanSchema = z.object({
    _type: z.literal("span"),
    text: z.string(),
    marks: z.array(z.string()).optional(),
});
// Bloc de texte Sanity
export const SanityBlockSchema = z.object({
    _type: z.literal("block"),
    _key: z.string().optional(),
    style: z.enum(["normal", "h1", "h2", "h3", "h4", "blockquote"]).optional(),
    listItem: z.enum(["bullet"]).optional(),
    markDefs: z
        .array(z.union([InternalLinkAnnotationSchema, ExternalLinkAnnotationSchema]))
        .optional(),
    children: z.array(TextSpanSchema).min(1),
    level: z.number().optional(),
});
// Image principale (mainImage)
export const MainImageSchema = z.object({
    _type: z.literal("mainImage"),
    _key: z.string().optional(),
    asset: SanityReferenceSchema,
    crop: SanityImageCropSchema.optional(),
    hotspot: SanityImageHotspotSchema.optional(),
    caption: z.string().optional(),
    alt: z.string().optional(),
});
// Bloc de code (structure standard Sanity)
export const CodeBlockSchema = z.object({
    _type: z.literal("code"),
    _key: z.string().optional(),
    code: z.string(),
    language: z.string().optional(),
    filename: z.string().optional(),
    highlightedLines: z.array(z.number()).optional(),
});
// Embed YouTube
export const YouTubeEmbedSchema = z.object({
    _type: z.literal("youtube"),
    _key: z.string().optional(),
    url: z.string().url(),
});
// BlockContent (union de tous les types de blocs)
export const BlockContentSchema = z
    .array(z.union([
    SanityBlockSchema,
    MainImageSchema,
    CodeBlockSchema,
    YouTubeEmbedSchema,
]))
    .min(1, "Le contenu doit contenir au moins un bloc");
// ============================================
// SCHÉMAS SEO
// ============================================
// Questions/Réponses
export const QuestionsAnswersSchema = z.object({
    _type: z.literal("questionsAnswers"),
    _key: z.string().optional(),
    question: z.string(),
    answer: z.string(),
});
// Open Graph
export const OpenGraphSchema = z.object({
    _type: z.literal("openGraph"),
    title: z.string().max(60).optional(),
    description: z.string().max(160).optional(),
    image: SanityImageSchema.optional(),
    type: z.enum(["website", "article", "profile"]).optional(),
});
// ============================================
// SCHÉMA PRINCIPAL DU POST
// ============================================
export const PostSchema = z.object({
    _type: z.literal("post"),
    // Champs obligatoires (Content)
    title: z.string().min(1, "Le titre est requis"),
    description: z.string().min(1, "La description est requise"),
    type: z.enum(["definition", "post"]),
    isHome: z.boolean(),
    slug: SanitySlugSchema,
    mainImage: SanityImageSchema,
    categories: z
        .array(SanityReferenceSchema)
        .min(1, "Au moins une catégorie est requise"),
    body: BlockContentSchema,
    // Champs SEO (optionnels mais recommandés)
    seoTitle: z
        .string()
        .max(60, "Le titre SEO doit faire moins de 60 caractères")
        .optional(),
    seoDescription: z
        .string()
        .max(160, "La description SEO doit faire moins de 160 caractères")
        .optional(),
    seoImage: SanityImageSchema.optional(),
    seoKeywords: z.string().optional(),
    noIndex: z.boolean().optional(),
    canonicalUrl: z
        .string()
        .url("L'URL canonique doit être une URL valide")
        .optional(),
    questionsAnswers: z.array(QuestionsAnswersSchema).optional(),
    openGraph: OpenGraphSchema.optional(),
    // Champs système Sanity (optionnels, généralement générés automatiquement)
    _id: z.string().optional(),
    _rev: z.string().optional(),
    _createdAt: z.string().optional(),
    _updatedAt: z.string().optional(),
});
