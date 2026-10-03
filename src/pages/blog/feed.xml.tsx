import type { GetServerSideProps } from 'next';

import { buildBlogRssXml } from '@/common/libs/blog-feeds';
import { markdownToHtml } from '@/common/libs/markdown-html';
import { getBlogFeed } from '@/services/blog';

/**
 * /blog/feed.xml: the twenty newest posts in full. Feed readers show the
 * whole article, and dev.to's RSS import can pull posts with the original
 * marked as canonical.
 */
const BlogFeed = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    const posts = await getBlogFeed();
    const xml = buildBlogRssXml(
      posts.map(({ content, ...post }) => ({
        post,
        html: markdownToHtml(content, `/blog/${post.slug}`),
      })),
    );
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=600, stale-while-revalidate=86400',
    );
    res.write(xml);
  } catch {
    res.statusCode = 503;
    res.setHeader('Retry-After', '600');
    res.setHeader('Cache-Control', 'no-store');
    res.write('The blog feed is temporarily unavailable.');
  }
  res.end();
  return { props: {} };
};

export default BlogFeed;
