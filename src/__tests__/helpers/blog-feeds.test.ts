import { SITE_URL } from '@/common/constant/site';
import {
  buildBlogRssXml,
  buildBlogSitemapXml,
  escapeXml,
} from '@/common/libs/blog-feeds';
import type { BlogPostSummaryProps } from '@/common/types/blog';

const summary = (
  overrides: Partial<BlogPostSummaryProps> = {},
): BlogPostSummaryProps => ({
  id: 'post-1',
  slug: 'nextjs-caching',
  title: 'Caching & you <part 1>',
  excerpt: 'Why "fresh" isn\'t the default',
  coverImageUrl: null,
  coverImageAlt: null,
  tags: ['nextjs'],
  readingMinutes: 8,
  publishedAt: '2026-09-01T10:00:00.000Z',
  contentUpdatedAt: null,
  category: { name: 'Next.js', slug: 'nextjs' },
  ...overrides,
});

describe('escapeXml', () => {
  test('escapes all five XML special characters', () => {
    expect(escapeXml(`a & b < c > "d" 'e'`)).toBe(
      'a &amp; b &lt; c &gt; &quot;d&quot; &apos;e&apos;',
    );
  });
});

describe('buildBlogSitemapXml', () => {
  const xml = buildBlogSitemapXml({
    posts: [
      {
        slug: 'nextjs-caching',
        title: 'Caching',
        coverImageUrl: 'https://cdn.example.com/a.png?w=1200&h=630',
        coverImageAlt: null,
        lastModified: '2026-09-20T10:00:00.000Z',
      },
      {
        slug: 'older-post',
        title: 'Older',
        coverImageUrl: null,
        coverImageAlt: null,
        lastModified: null,
      },
    ],
    categories: [{ slug: 'nextjs', lastModified: '2026-09-20T10:00:00.000Z' }],
  });

  test('lists the blog, its categories and its posts', () => {
    expect(xml).toContain(
      `<loc>${SITE_URL}/blog</loc>\n    <lastmod>2026-09-20</lastmod>`,
    );
    expect(xml).toContain(`<loc>${SITE_URL}/blog/category/nextjs</loc>`);
    expect(xml).toContain(`<loc>${SITE_URL}/blog/nextjs-caching</loc>`);
    expect(xml).toContain(`<loc>${SITE_URL}/blog/older-post</loc>\n  </url>`);
  });

  test('adds cover images, escaped', () => {
    expect(xml).toContain(
      '<image:loc>https://cdn.example.com/a.png?w=1200&amp;h=630</image:loc>',
    );
    expect(xml).toContain('xmlns:image=');
  });
});

describe('buildBlogRssXml', () => {
  test('escapes text and carries the full post in CDATA', () => {
    const xml = buildBlogRssXml([
      {
        post: summary(),
        html: '<p>Body with ]]> inside</p>',
      },
    ]);

    expect(xml).toContain('<title>Caching &amp; you &lt;part 1&gt;</title>');
    expect(xml).toContain(
      '<description>Why &quot;fresh&quot; isn&apos;t the default</description>',
    );
    expect(xml).toContain(
      `<guid isPermaLink="true">${SITE_URL}/blog/nextjs-caching</guid>`,
    );
    expect(xml).toContain('<pubDate>Tue, 01 Sep 2026 10:00:00 GMT</pubDate>');
    expect(xml).toContain('<category>Next.js</category>');
    expect(xml).toContain(
      '<content:encoded><![CDATA[<p>Body with ]]]]><![CDATA[> inside</p>]]></content:encoded>',
    );
  });

  test('dates the feed by its newest change', () => {
    const xml = buildBlogRssXml([
      { post: summary({ contentUpdatedAt: '2026-09-20T10:00:00.000Z' }) },
      { post: summary({ id: 'post-2', slug: 'older' }) },
    ]);
    expect(xml).toContain(
      '<lastBuildDate>Sun, 20 Sep 2026 10:00:00 GMT</lastBuildDate>',
    );
  });

  test('an empty feed is still valid and dated now', () => {
    const now = new Date('2026-10-03T00:00:00.000Z');
    const xml = buildBlogRssXml([], now);
    expect(xml).toContain(
      `<lastBuildDate>${now.toUTCString()}</lastBuildDate>`,
    );
    expect(xml).not.toContain('<item>');
  });
});
