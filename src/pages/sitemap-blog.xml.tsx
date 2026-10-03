import type { GetServerSideProps } from 'next';

import { buildBlogSitemapXml } from '@/common/libs/blog-feeds';
import { getBlogSitemap } from '@/services/blog';

/** /sitemap-blog.xml, listed in robots.txt beside the static sitemap. */
const BlogSitemap = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    const xml = buildBlogSitemapXml(await getBlogSitemap());
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=600, stale-while-revalidate=86400',
    );
    res.write(xml);
  } catch {
    res.statusCode = 503;
    res.setHeader('Retry-After', '600');
    res.setHeader('Cache-Control', 'no-store');
    res.write('The blog sitemap is temporarily unavailable.');
  }
  res.end();
  return { props: {} };
};

export default BlogSitemap;
