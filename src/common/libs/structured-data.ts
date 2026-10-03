import { absoluteUrl } from './seo';
import { SITE_NAME, SITE_URL } from '../constant/site';

/*
 * schema.org data for search engines. Every blog post points at the same
 * Person the site already publishes in _app.tsx, through PERSON_ID, so search
 * engines see one author across the whole site.
 */

export const PERSON_ID = `${SITE_URL}/#person`;
export const BLOG_ID = `${SITE_URL}/blog#blog`;

/**
 * JSON for a <script type="application/ld+json"> tag. `<` is escaped so a
 * title containing "</script>" can't close the tag early.
 */
export const serializeJsonLd = (data: object): string =>
  JSON.stringify(data).replace(/</g, '\\u003c');

type BlogPostingInput = {
  /** The post's own absolute address. */
  url: string;
  headline: string;
  description: string;
  imageUrl: string;
  datePublished: string;
  dateModified: string;
  section?: string;
  tags: string[];
  wordCount: number;
};

export const buildBlogPostingJsonLd = ({
  url,
  headline,
  description,
  imageUrl,
  datePublished,
  dateModified,
  section,
  tags,
  wordCount,
}: BlogPostingInput) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  '@id': `${url}#article`,
  mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  // Google truncates longer headlines in rich results.
  headline: headline.slice(0, 110),
  description,
  image: [imageUrl],
  datePublished,
  dateModified,
  author: {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SITE_NAME,
    url: absoluteUrl('/about'),
  },
  publisher: { '@type': 'Person', '@id': PERSON_ID, name: SITE_NAME },
  isPartOf: {
    '@type': 'Blog',
    '@id': BLOG_ID,
    name: `${SITE_NAME} Blog`,
    url: absoluteUrl('/blog'),
  },
  ...(section ? { articleSection: section } : {}),
  ...(tags.length ? { keywords: tags.join(', ') } : {}),
  wordCount,
  inLanguage: 'en',
});

export const buildBreadcrumbJsonLd = (
  items: { name: string; path: string }[],
) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});
