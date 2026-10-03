import type { GetServerSideProps, NextPage } from 'next';
import { NextSeo } from 'next-seo';

import { getBlogListingSeo } from '@/common/constant/seo';
import {
  BLOG_LISTING_CACHE_CONTROL,
  parsePageParam,
  singleParam,
} from '@/common/helpers/blog';
import { buildSeo } from '@/common/libs/seo';
import type { BlogCategoryProps, BlogPostListProps } from '@/common/types/blog';
import BlogListing from '@/modules/blog';
import { getBlogCategories, getBlogPosts } from '@/services/blog';

type BlogPageProps = {
  posts: BlogPostListProps | null;
  categories: BlogCategoryProps[];
  page: number;
  q: string;
  tag: string;
};

const BlogPage: NextPage<BlogPageProps> = ({
  posts,
  categories,
  page,
  q,
  tag,
}) => {
  const seo = getBlogListingSeo({ page, q, tag });

  return (
    <>
      <NextSeo
        {...buildSeo({ ...seo, noindex: seo.noindex || posts === null })}
      />
      <BlogListing
        posts={posts}
        categories={categories}
        activeCategory={null}
        page={page}
        q={q}
        tag={tag}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<BlogPageProps> = async ({
  query,
  res,
}) => {
  const page = parsePageParam(query.page);
  if (page === null) return { notFound: true };
  const q = singleParam(query.q, 100);
  const tag = singleParam(query.tag, 30);

  try {
    const [posts, categories] = await Promise.all([
      getBlogPosts({ page, q: q || undefined, tag: tag || undefined }),
      getBlogCategories(),
    ]);
    // An empty page past the end is a soft 404; say so properly.
    if (page > 1 && page > posts.totalPages) return { notFound: true };

    res.setHeader('Cache-Control', BLOG_LISTING_CACHE_CONTROL);
    return { props: { posts, categories, page, q, tag } };
  } catch {
    // Keep the page up with a notice instead of a 500, and never cache it.
    res.setHeader('Cache-Control', 'no-store');
    return { props: { posts: null, categories: [], page, q, tag } };
  }
};

export default BlogPage;
