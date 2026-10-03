/*
 * Shapes returned by awad-backend's blog endpoints. Dates arrive as ISO strings.
 * Public types never carry draft state or authorship; admin types do.
 */

export type BlogCategoryRefProps = {
  name: string;
  slug: string;
};

/** What a post card needs. */
export type BlogPostSummaryProps = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  tags: string[];
  readingMinutes: number;
  publishedAt: string;
  contentUpdatedAt: string | null;
  category: BlogCategoryRefProps | null;
};

/** A published post with its markdown body and three posts to read next. */
export type BlogPostProps = BlogPostSummaryProps & {
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  related: BlogPostSummaryProps[];
};

/** A feed entry: the card fields plus the markdown body. */
export type BlogFeedItemProps = BlogPostSummaryProps & { content: string };

export type BlogPostListProps = {
  items: BlogPostSummaryProps[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

/** A category that has at least one published post. */
export type BlogCategoryProps = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
};

export type BlogSitemapProps = {
  posts: {
    slug: string;
    title: string;
    coverImageUrl: string | null;
    coverImageAlt: string | null;
    lastModified: string | null;
  }[];
  categories: { slug: string; lastModified: string }[];
};

/** A heading found in a post body, in document order. */
export type BlogHeadingProps = {
  depth: number;
  text: string;
  id: string;
  /** 1-based source line, used to give the rendered heading the same id. */
  line: number;
};

/* ------------------------------------------------------------------- admin */

export type BlogPostStatus = 'draft' | 'published';

export type AdminBlogCategoryRefProps = {
  id: string;
  name: string;
  slug: string;
};

/** A row in the admin posts list: no body. */
export type AdminBlogPostRowProps = {
  id: string;
  slug: string;
  title: string;
  status: BlogPostStatus;
  tags: string[];
  readingMinutes: number;
  publishedAt: string | null;
  contentUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category: AdminBlogCategoryRefProps | null;
  author: { name: string | null; username: string } | null;
};

/** Everything the editor needs, drafts included. */
export type AdminBlogPostProps = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  tags: string[];
  status: BlogPostStatus;
  readingMinutes: number;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  publishedAt: string | null;
  contentUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  categoryId: string | null;
  authorId: string | null;
  category: AdminBlogCategoryRefProps | null;
};

/** What the backend returns for an uploaded image. */
export type BlogImageUploadProps = {
  /** Full address to use as a cover or in a markdown image. */
  url: string;
  path: string;
  size: number;
  type: string;
};

/** The exact body the backend accepts for creating or saving a post. */
export type BlogPostInputProps = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  categoryId: string | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
};

export type AdminBlogCategoryProps = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postCount: number;
  createdAt: string;
  updatedAt: string;
};

export type BlogCategoryInputProps = {
  name: string;
  slug?: string | null;
  description: string | null;
};

/** The tabs across the top of the console's Blog section. */
export const BLOG_TABS = [
  { key: 'posts', label: 'Posts', href: '/admin/blog' },
  { key: 'categories', label: 'Categories', href: '/admin/blog/categories' },
] as const;
