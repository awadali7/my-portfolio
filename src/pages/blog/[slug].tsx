import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { NextSeo } from 'next-seo';

import JsonLd from '@/common/components/elements/JsonLd';
import { getBlogPostSeo } from '@/common/constant/seo';
import {
  BLOG_POST_REVALIDATE_SECONDS,
  countWords,
  extractHeadings,
  SLUG_PATTERN,
} from '@/common/helpers/blog';
import { absoluteUrl, buildSeo } from '@/common/libs/seo';
import {
  buildBlogPostingJsonLd,
  buildBreadcrumbJsonLd,
} from '@/common/libs/structured-data';
import type { BlogHeadingProps, BlogPostProps } from '@/common/types/blog';
import BlogArticle from '@/modules/blog/components/BlogArticle';
import { BackendError } from '@/services/backend';
import { getBlogPost } from '@/services/blog';

type BlogPostPageProps = {
  post: BlogPostProps;
  headings: BlogHeadingProps[];
  wordCount: number;
};

const BlogPostPage: NextPage<BlogPostPageProps> = ({
  post,
  headings,
  wordCount,
}) => {
  const seo = getBlogPostSeo(post);
  const path = `/blog/${post.slug}`;

  return (
    <>
      <NextSeo {...buildSeo(seo)} />
      <JsonLd
        id='article'
        data={buildBlogPostingJsonLd({
          url: absoluteUrl(path),
          headline: post.title,
          description: seo.description,
          imageUrl: absoluteUrl(seo.image?.url ?? '/images/awad-ali.jpeg'),
          datePublished: post.publishedAt,
          dateModified: post.contentUpdatedAt ?? post.publishedAt,
          section: post.category?.name,
          tags: post.tags,
          wordCount,
        })}
      />
      <JsonLd
        id='breadcrumb'
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          ...(post.category
            ? [
                {
                  name: post.category.name,
                  path: `/blog/category/${post.category.slug}`,
                },
              ]
            : []),
          { name: post.title, path },
        ])}
      />
      <BlogArticle post={post} headings={headings} />
    </>
  );
};

/**
 * No paths at build time: the build never calls the backend, so a backend
 * outage can't break a deploy. Each post is built on its first request and
 * rebuilt when the admin publishes, edits, unpublishes or deletes it.
 */
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export const getStaticProps: GetStaticProps<
  BlogPostPageProps,
  { slug: string }
> = async ({ params }) => {
  const slug = params?.slug ?? '';
  if (!SLUG_PATTERN.test(slug)) return { notFound: true };

  try {
    const post = await getBlogPost(slug);
    return {
      props: {
        post,
        headings: extractHeadings(post.content),
        wordCount: countWords(post.content),
      },
      revalidate: BLOG_POST_REVALIDATE_SECONDS,
    };
  } catch (error) {
    // Drafts, unpublished and deleted posts are a real 404. Retried after a
    // minute in case the post goes live without an on-demand rebuild.
    if (error instanceof BackendError && error.status === 404) {
      return { notFound: true, revalidate: 60 };
    }
    // Anything else: throwing keeps the last good copy online during a
    // background rebuild instead of replacing it with an error.
    throw error;
  }
};

export default BlogPostPage;
