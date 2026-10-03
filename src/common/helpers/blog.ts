import { formatInTimeZone } from 'date-fns-tz';

import type {
  BlogCategoryInputProps,
  BlogHeadingProps,
  BlogPostInputProps,
} from '../types/blog';

/** Dates on the blog are shown in India time, where the author works. */
export const BLOG_TIME_ZONE = 'Asia/Kolkata';

/** Appended to every blog page's title tag. */
export const BLOG_TITLE_SUFFIX = ' | Awad Ali';

/**
 * Listing pages are rendered per request and cached at the edge for a minute,
 * then served stale while they refresh, so a new post shows up within a minute.
 */
export const BLOG_LISTING_CACHE_CONTROL =
  'public, s-maxage=60, stale-while-revalidate=300';

/** Article pages are rebuilt on publish; this is only the safety net. */
export const BLOG_POST_REVALIDATE_SECONDS = 3600;

/** Lowercase letters and digits joined by single hyphens, as the backend requires. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const BLOG_LIMITS = {
  /** Characters of a title tag Google shows before cutting it off. */
  titleTag: 60,
  descriptionMin: 70,
  descriptionMax: 160,
  excerpt: 300,
  /** Matches the backend's cap, which keeps a post inside its body limit. */
  content: 60_000,
  slug: 80,
  tags: 10,
} as const;

/**
 * Largest image the console sends. Vercel caps a request at 4.5 MB, so this
 * leaves room for the multipart wrapper; the backend itself allows 5 MB.
 */
export const BLOG_IMAGE_MAX_BYTES = 4 * 1024 * 1024;

/** Text a newly inserted image gets as its alt text, selected for retyping. */
export const IMAGE_ALT_PLACEHOLDER = 'Describe the image';

/**
 * Inserts text at a selection, replacing it. With `block`, the text gets its
 * own paragraph: blank lines are added only where they are missing.
 * Returns the new value and where the inserted text starts and ends.
 */
export const insertAtSelection = (
  value: string,
  start: number,
  end: number,
  text: string,
  { block = false }: { block?: boolean } = {},
) => {
  const from = Math.min(Math.max(start, 0), value.length);
  const to = Math.min(Math.max(end, from), value.length);
  const before = value.slice(0, from);
  const after = value.slice(to);

  let prefix = '';
  let suffix = '';
  if (block) {
    if (before && !before.endsWith('\n\n')) {
      prefix = before.endsWith('\n') ? '\n' : '\n\n';
    }
    if (after && !after.startsWith('\n\n')) {
      suffix = after.startsWith('\n') ? '\n' : '\n\n';
    }
  }

  const insertStart = before.length + prefix.length;
  return {
    value: `${before}${prefix}${text}${suffix}${after}`,
    insertStart,
    insertEnd: insertStart + text.length,
  };
};

/** "Hello, Wörld!" -> "hello-world". Same rules as the backend's slugify. */
export const slugify = (text: string, maxLength = 80): string =>
  text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/-+$/g, '');

/** A heading line's readable text: no emphasis marks, code ticks or link targets. */
const toHeadingText = (raw: string): string =>
  raw
    .replace(/[ \t]+#+[ \t]*$/, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/(^|\W)(__|_)(\S(?:.*?\S)?)\2(?=\W|$)/g, '$1$3')
    .replace(/[*`]|~~/g, '')
    .trim();

const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})/;
const ATX_HEADING = /^ {0,3}(#{1,6})[ \t]+(.+?)[ \t]*$/;

/**
 * Every `#` heading outside code blocks, in order, with a unique anchor id.
 *
 * Works line by line rather than through a markdown parser so it runs the same
 * on the server, in the editor and in Jest. The renderer matches headings to
 * these ids by source line, so the table of contents and the page always agree.
 */
export const extractHeadings = (markdown: string): BlogHeadingProps[] => {
  const headings: BlogHeadingProps[] = [];
  const taken = new Set<string>();
  let fence: string | null = null;

  markdown.split(/\r?\n/).forEach((line, index) => {
    if (fence) {
      const close = line.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);
      if (
        close &&
        close[1][0] === fence[0] &&
        close[1].length >= fence.length
      ) {
        fence = null;
      }
      return;
    }

    const open = line.match(FENCE_OPEN);
    if (open) {
      fence = open[1];
      return;
    }

    const heading = line.match(ATX_HEADING);
    if (!heading) return;

    const text = toHeadingText(heading[2]);
    if (!text) return;

    const base = slugify(text) || 'section';
    let id = base;
    for (let suffix = 2; taken.has(id); suffix += 1) id = `${base}-${suffix}`;
    taken.add(id);

    headings.push({ depth: heading[1].length, text, id, line: index + 1 });
  });

  return headings;
};

/** The top-level sections. A `#` heading in the body renders as an H2 too. */
export const tableOfContents = (headings: BlogHeadingProps[]) =>
  headings.filter((heading) => heading.depth <= 2);

/** Words a reader reads: link and image addresses don't count. */
export const countWords = (markdown: string): number =>
  markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~|]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

/** Same estimate as the backend: 200 words a minute, at least one minute. */
export const readingMinutes = (markdown: string): number =>
  Math.max(1, Math.ceil(countWords(markdown) / 200));

export const formatBlogDate = (iso: string, pattern = 'MMM d, yyyy') =>
  formatInTimeZone(new Date(iso), BLOG_TIME_ZONE, pattern);

/** True when the words changed on a later day than the post went live. */
export const wasUpdatedLater = (
  publishedAt: string | null,
  contentUpdatedAt: string | null,
): boolean => {
  if (!publishedAt || !contentUpdatedAt) return false;
  const day = (iso: string) => formatBlogDate(iso, 'yyyy-MM-dd');
  return day(contentUpdatedAt) > day(publishedAt);
};

/** First value of a query parameter, trimmed and cut to `maxLength`. */
export const singleParam = (
  value: string | string[] | undefined,
  maxLength = 100,
): string => {
  const first = Array.isArray(value) ? value[0] : value;
  return (first ?? '').trim().slice(0, maxLength);
};

/** A listing page number from the query: 1 when absent, null when invalid. */
export const parsePageParam = (
  value: string | string[] | undefined,
): number | null => {
  if (value === undefined) return 1;
  if (Array.isArray(value) || !/^[1-9]\d{0,3}$/.test(value)) return null;
  return Number(value);
};

/** "React, next js ,react" -> ["react", "next-js"], like the backend stores them. */
export const parseTags = (input: string | string[]): string[] => {
  const raw = Array.isArray(input) ? input : input.split(',');
  const unique = new Set<string>();
  raw.forEach((value) => {
    const tag = value.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag) unique.add(tag);
  });
  return Array.from(unique).slice(0, BLOG_LIMITS.tags);
};

export const countImagesWithoutAlt = (markdown: string): number =>
  (markdown.match(/!\[\s*\]\(/g) ?? []).length;

type WarningInput = Pick<
  BlogPostInputProps,
  | 'title'
  | 'excerpt'
  | 'content'
  | 'coverImageUrl'
  | 'coverImageAlt'
  | 'seoTitle'
  | 'seoDescription'
>;

/** Things worth fixing before publishing. Advice only: none of them block it. */
export const getPublishWarnings = (
  post: WarningInput,
  otherTitles: string[],
): string[] => {
  const warnings: string[] = [];

  const titleTag = `${post.seoTitle?.trim() || post.title.trim()}${BLOG_TITLE_SUFFIX}`;
  if (titleTag.length > BLOG_LIMITS.titleTag) {
    warnings.push(
      `The title tag is ${titleTag.length} characters and Google shows about ${BLOG_LIMITS.titleTag}. Add a shorter SEO title.`,
    );
  }

  const description = post.seoDescription?.trim() || post.excerpt.trim();
  if (description.length < BLOG_LIMITS.descriptionMin) {
    warnings.push(
      `The description is ${description.length} characters. Aim for ${BLOG_LIMITS.descriptionMin} to ${BLOG_LIMITS.descriptionMax}.`,
    );
  } else if (description.length > BLOG_LIMITS.descriptionMax) {
    warnings.push(
      `The description is ${description.length} characters and Google cuts it at about ${BLOG_LIMITS.descriptionMax}.`,
    );
  }

  if (post.coverImageUrl?.trim() && !post.coverImageAlt?.trim()) {
    warnings.push('The cover image has no alt text.');
  }

  const missingAlt = countImagesWithoutAlt(post.content);
  if (missingAlt === 1) {
    warnings.push('One image in the body has no alt text.');
  } else if (missingAlt > 1) {
    warnings.push(`${missingAlt} images in the body have no alt text.`);
  }

  if (tableOfContents(extractHeadings(post.content)).length === 0) {
    warnings.push(
      'The body has no ## headings, so the post gets no table of contents.',
    );
  }

  const title = post.title.trim().toLowerCase();
  if (
    title &&
    otherTitles.some((other) => other.trim().toLowerCase() === title)
  ) {
    warnings.push('Another post already uses this title.');
  }

  return warnings;
};

const optionalText = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

/**
 * Shapes an editor request into exactly the fields the backend accepts. The
 * backend rejects unknown fields, so nothing else is passed through. Returns
 * an error message instead when a required field is missing.
 */
export const toBlogPostInput = (body: unknown): BlogPostInputProps | string => {
  if (!body || typeof body !== 'object') return 'Missing post data';
  const data = body as Record<string, unknown>;

  const title = optionalText(data.title);
  if (!title) return 'Title is required';
  const slug = optionalText(data.slug);
  if (!slug) return 'Slug is required';
  const excerpt = optionalText(data.excerpt);
  if (!excerpt) return 'Excerpt is required';
  if (typeof data.content !== 'string' || !data.content.trim()) {
    return 'The post body is empty';
  }

  const tags =
    Array.isArray(data.tags) || typeof data.tags === 'string'
      ? parseTags(
          Array.isArray(data.tags)
            ? data.tags.filter((tag): tag is string => typeof tag === 'string')
            : data.tags,
        )
      : [];

  return {
    title,
    slug,
    excerpt,
    content: data.content,
    coverImageUrl: optionalText(data.coverImageUrl),
    coverImageAlt: optionalText(data.coverImageAlt),
    categoryId: optionalText(data.categoryId),
    tags,
    seoTitle: optionalText(data.seoTitle),
    seoDescription: optionalText(data.seoDescription),
    canonicalUrl: optionalText(data.canonicalUrl),
  };
};

/** Same idea for categories: a name is required, the rest is optional. */
export const toBlogCategoryInput = (
  body: unknown,
): BlogCategoryInputProps | string => {
  if (!body || typeof body !== 'object') return 'Missing category data';
  const data = body as Record<string, unknown>;
  const name = optionalText(data.name);
  if (!name) return 'Name is required';
  return {
    name,
    slug: optionalText(data.slug),
    description: optionalText(data.description),
  };
};
