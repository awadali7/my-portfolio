import type { GetServerSideProps, NextPage } from 'next';
import { NextSeo } from 'next-seo';

import JsonLd from '@/common/components/elements/JsonLd';
import { getBlogListingSeo } from '@/common/constant/seo';
import {
  BLOG_LISTING_CACHE_CONTROL,
  parsePageParam,
  SLUG_PATTERN,
} from '@/common/helpers/blog';
import { buildSeo } from '@/common/libs/seo';
import { buildBreadcrumbJsonLd } from '@/common/libs/structured-data';
import type { BlogCategoryProps, BlogPostListProps } from '@/common/types/blog';
import BlogListing from '@/modules/blog';
import { getBlogCategories, getBlogPosts } from '@/services/blog';

type BlogCategoryPageProps = {
  posts: BlogPostListProps | null;
  categories: BlogCategoryProps[];
  category: BlogCategoryProps;
  page: number;
};

const BlogCategoryPage: NextPage<BlogCategoryPageProps> = ({
  posts,
  categories,
  category,
  page,
}) => {
  const seo = getBlogListingSeo({ page, category });

  return (
    <>
      <NextSeo
        {...buildSeo({ ...seo, noindex: seo.noindex || posts === null })}
      />
      <JsonLd
        id='breadcrumb'
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: category.name, path: `/blog/category/${category.slug}` },
        ])}
      />
      <BlogListing
        posts={posts}
        categories={categories}
        activeCategory={category}
        page={page}
        q=''
        tag=''
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<
  BlogCategoryPageProps,
  { category: string }
> = async ({ params, query, res }) => {
  const slug = params?.category ?? '';
  const page = parsePageParam(query.page);
  if (!SLUG_PATTERN.test(slug) || page === null) return { notFound: true };

  try {
    const [posts, categories] = await Promise.all([
      getBlogPosts({ page, category: slug }),
      getBlogCategories(),
    ]);
    // The public list only holds categories with published posts, so this
    // turns unknown and empty categories alike into a real 404.
    const category = categories.find((item) => item.slug === slug);
    if (!category || (page > 1 && page > posts.totalPages)) {
      return { notFound: true };
    }

    res.setHeader('Cache-Control', BLOG_LISTING_CACHE_CONTROL);
    return { props: { posts, categories, category, page } };
  } catch {
    res.setHeader('Cache-Control', 'no-store');
    return {
      props: {
        posts: null,
        categories: [],
        category: {
          id: slug,
          name: slug,
          slug,
          description: null,
          postCount: 0,
        },
        page,
      },
    };
  }
};

export default BlogCategoryPage;
