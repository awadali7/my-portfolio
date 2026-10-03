import {
  getBlogListingSeo,
  getBlogPostSeo,
  getBlogSocialImage,
  PAGE_SEO,
  personJsonLd,
} from '@/common/constant/seo';
import { SITE_URL } from '@/common/constant/site';
import { buildSeo } from '@/common/libs/seo';
import {
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
  PERSON_ID,
  serializeJsonLd,
} from '@/common/libs/structured-data';

const post = {
  slug: 'nextjs-caching',
  title: 'What changed in Next.js caching',
  excerpt:
    'Requests are no longer cached by default. Here is how to opt back in.',
  coverImageUrl: null,
  coverImageAlt: null,
  publishedAt: '2026-09-01T10:00:00.000Z',
  contentUpdatedAt: null,
  readingMinutes: 8,
  category: { name: 'Next.js', slug: 'nextjs' },
  tags: ['nextjs', 'caching'],
  seoTitle: null,
  seoDescription: null,
  canonicalUrl: null,
};

describe('blog post metadata', () => {
  test('titles the page after the post and describes it with the excerpt', () => {
    const seo = getBlogPostSeo(post);
    expect(seo.path).toBe('/blog/nextjs-caching');
    expect(seo.title).toBe('What changed in Next.js caching | Awad Ali');
    expect(seo.description).toBe(post.excerpt);
  });

  test('SEO fields replace the title tag and description only', () => {
    const seo = getBlogPostSeo({
      ...post,
      seoTitle: 'Next.js caching',
      seoDescription: 'A shorter description for search results.',
    });
    expect(seo.title).toBe('Next.js caching | Awad Ali');
    expect(seo.description).toBe('A shorter description for search results.');
  });

  test('sends article tags and the reading-time labels', () => {
    const tags = buildSeo(getBlogPostSeo(post));
    expect(tags.canonical).toBe(`${SITE_URL}/blog/nextjs-caching`);
    expect(tags.openGraph?.type).toBe('article');
    expect(tags.openGraph?.article).toMatchObject({
      publishedTime: post.publishedAt,
      modifiedTime: post.publishedAt,
      section: 'Next.js',
      tags: ['nextjs', 'caching'],
    });
    expect(tags.additionalMetaTags).toEqual(
      expect.arrayContaining([
        { name: 'twitter:label2', content: 'Reading time' },
        { name: 'twitter:data2', content: '8 min read' },
      ]),
    );
  });

  test('points the canonical at the original when the post came from elsewhere', () => {
    const tags = buildSeo(
      getBlogPostSeo({ ...post, canonicalUrl: 'https://dev.to/awad/caching' }),
    );
    expect(tags.canonical).toBe('https://dev.to/awad/caching');
  });

  test('uses the cover as the social image when there is one', () => {
    expect(
      getBlogSocialImage({
        ...post,
        coverImageUrl: 'https://cdn.example.com/cover.png',
        coverImageAlt: 'Cache diagram',
      }),
    ).toEqual({
      url: 'https://cdn.example.com/cover.png',
      alt: 'Cache diagram',
    });
  });

  test('otherwise uses a generated card whose address changes with the post', () => {
    const first = getBlogSocialImage(post);
    const edited = getBlogSocialImage({
      ...post,
      contentUpdatedAt: '2026-09-20T10:00:00.000Z',
    });
    expect(first).toMatchObject({ width: 1200, height: 630 });
    expect(first.url).toMatch(/^\/api\/og\?slug=nextjs-caching&v=[a-z0-9]+$/);
    expect(edited.url).not.toBe(first.url);
  });
});

describe('blog listing metadata', () => {
  test('the first page is the blog page itself', () => {
    expect(getBlogListingSeo({ page: 1 })).toEqual({
      path: '/blog',
      title: PAGE_SEO.blog.title,
      description: PAGE_SEO.blog.description,
    });
  });

  test('later pages keep their own address, title and description', () => {
    const second = getBlogListingSeo({ page: 2 });
    expect(second.path).toBe('/blog?page=2');
    expect(second.title).toContain('Page 2');
    expect(second.description).not.toBe(PAGE_SEO.blog.description);
    expect(buildSeo(second).canonical).toBe(`${SITE_URL}/blog?page=2`);
  });

  test('categories get their own page, with a description either way', () => {
    const withDescription = getBlogListingSeo({
      page: 1,
      category: {
        name: 'React',
        slug: 'react',
        description: 'Hooks and more.',
      },
    });
    expect(withDescription).toEqual({
      path: '/blog/category/react',
      title: 'React Articles | Awad Ali',
      description: 'Hooks and more.',
    });
    expect(
      getBlogListingSeo({
        page: 1,
        category: { name: 'React', slug: 'react', description: null },
      }).description,
    ).toContain('React');
  });

  test('search results and tag filters stay out of the index', () => {
    [
      getBlogListingSeo({ page: 1, q: 'hooks' }),
      getBlogListingSeo({ page: 1, tag: 'nextjs' }),
    ].forEach((seo) => {
      const tags = buildSeo(seo);
      expect(tags.noindex).toBe(true);
      expect(tags.canonical).toBeUndefined();
    });
  });
});

describe('structured data', () => {
  test('a post names the site-wide Person as its author', () => {
    const data = buildBlogPostingJsonLd({
      url: `${SITE_URL}/blog/nextjs-caching`,
      headline: 'x'.repeat(150),
      description: post.excerpt,
      imageUrl: `${SITE_URL}/api/og?slug=nextjs-caching`,
      datePublished: post.publishedAt,
      dateModified: post.publishedAt,
      section: 'Next.js',
      tags: post.tags,
      wordCount: 1200,
    });
    expect(data['@type']).toBe('BlogPosting');
    expect(data.author['@id']).toBe(PERSON_ID);
    expect(personJsonLd['@id']).toBe(PERSON_ID);
    expect(data.headline).toHaveLength(110);
    expect(data).toMatchObject({
      articleSection: 'Next.js',
      keywords: 'nextjs, caching',
      wordCount: 1200,
    });
  });

  test('leaves out keywords when a post has no tags', () => {
    const data = buildBlogPostingJsonLd({
      url: `${SITE_URL}/blog/a`,
      headline: 'A',
      description: 'B',
      imageUrl: `${SITE_URL}/a.png`,
      datePublished: post.publishedAt,
      dateModified: post.publishedAt,
      tags: [],
      wordCount: 10,
    });
    expect(data).not.toHaveProperty('keywords');
    expect(data).not.toHaveProperty('articleSection');
  });

  test('breadcrumbs are numbered from one with absolute addresses', () => {
    expect(
      buildBreadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
      ]).itemListElement,
    ).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_URL}/blog`,
      },
    ]);
  });

  test('a title cannot close the script tag it is embedded in', () => {
    const data = { headline: 'Avoid </script><script>alert(1)</script>' };
    const json = serializeJsonLd(data);
    expect(json).not.toContain('</script>');
    expect(JSON.parse(json)).toEqual(data);
  });
});
