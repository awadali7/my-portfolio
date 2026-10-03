import { absoluteUrl } from './seo';
import { BLOG_INTRO, BLOG_NAME } from '../constant/blog';
import type { BlogPostSummaryProps, BlogSitemapProps } from '../types/blog';

/*
 * XML for /sitemap-blog.xml and /blog/feed.xml. Kept free of Next and React so
 * both builders can be tested as plain functions.
 */

const XML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

export const escapeXml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => XML_ENTITIES[char]);

/** CDATA can hold any HTML except its own terminator, which is split up. */
const cdata = (value: string): string =>
  `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

/** W3C date for <lastmod>: the day is all search engines need. */
const toDay = (iso: string): string => new Date(iso).toISOString().slice(0, 10);

const urlEntry = (
  loc: string,
  lastModified?: string | null,
  imageUrl?: string | null,
): string =>
  [
    '  <url>',
    `    <loc>${escapeXml(loc)}</loc>`,
    lastModified ? `    <lastmod>${toDay(lastModified)}</lastmod>` : null,
    imageUrl
      ? `    <image:image>\n      <image:loc>${escapeXml(imageUrl)}</image:loc>\n    </image:image>`
      : null,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');

/** The blog index, every category with posts, and every published post. */
export const buildBlogSitemapXml = ({
  posts,
  categories,
}: BlogSitemapProps): string => {
  const newest = posts
    .map((post) => post.lastModified)
    .filter((date): date is string => Boolean(date))
    .sort()
    .pop();

  const entries = [
    urlEntry(absoluteUrl('/blog'), newest),
    ...categories.map((category) =>
      urlEntry(
        absoluteUrl(`/blog/category/${category.slug}`),
        category.lastModified,
      ),
    ),
    ...posts.map((post) =>
      urlEntry(
        absoluteUrl(`/blog/${post.slug}`),
        post.lastModified,
        post.coverImageUrl,
      ),
    ),
  ];

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');
};

export type BlogFeedEntry = {
  post: BlogPostSummaryProps;
  /** The rendered body. Readers and dev.to's importer use it when present. */
  html?: string;
};

/** RSS 2.0 with the full post in content:encoded. */
export const buildBlogRssXml = (
  entries: BlogFeedEntry[],
  now: Date = new Date(),
): string => {
  const lastBuild = entries.reduce<Date>((latest, { post }) => {
    const date = new Date(post.contentUpdatedAt ?? post.publishedAt);
    return date > latest ? date : latest;
  }, new Date(0));

  const items = entries.map(({ post, html }) => {
    const link = absoluteUrl(`/blog/${post.slug}`);
    return [
      '    <item>',
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${escapeXml(link)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
      `      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>`,
      `      <description>${escapeXml(post.excerpt)}</description>`,
      post.category
        ? `      <category>${escapeXml(post.category.name)}</category>`
        : null,
      ...post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`),
      html ? `      <content:encoded>${cdata(html)}</content:encoded>` : null,
      '    </item>',
    ]
      .filter(Boolean)
      .join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
    '  <channel>',
    `    <title>${escapeXml(BLOG_NAME)}</title>`,
    `    <link>${escapeXml(absoluteUrl('/blog'))}</link>`,
    `    <description>${escapeXml(BLOG_INTRO)}</description>`,
    '    <language>en</language>',
    `    <lastBuildDate>${(entries.length ? lastBuild : now).toUTCString()}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(absoluteUrl('/blog/feed.xml'))}" rel="self" type="application/rss+xml"/>`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
};
