import NextImage from 'next/image';
import type { ReactNode } from 'react';

import BackButton from '@/common/components/elements/BackButton';
import Container from '@/common/components/elements/Container';
import { absoluteUrl } from '@/common/libs/seo';
import type { BlogHeadingProps, BlogPostProps } from '@/common/types/blog';

import ArticleBody from './ArticleBody';
import ArticleFooter from './ArticleFooter';
import ArticleHeader from './ArticleHeader';
import FeedLink from './FeedLink';
import RelatedPosts from './RelatedPosts';
import TableOfContents from './TableOfContents';

type BlogArticleProps = {
  /** `publishedAt` is null only when an admin previews a draft. */
  post: Omit<BlogPostProps, 'publishedAt'> & { publishedAt: string | null };
  headings: BlogHeadingProps[];
  /** Shown above the article, e.g. the admin preview notice. */
  banner?: ReactNode;
};

/**
 * One post in the site's content column, like the project pages. No fade-in
 * animation here, unlike other pages: it keeps text hidden until scripts run,
 * which delays the largest paint.
 */
const BlogArticle = ({ post, headings, banner }: BlogArticleProps) => (
  <Container>
    <FeedLink />
    <div>
      {banner}
      <BackButton url='/blog' />

      <article>
        <ArticleHeader post={post} />

        {post.coverImageUrl && (
          <div className='relative mt-8 aspect-video overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800'>
            {/* The largest element on the page, so it loads first. */}
            <NextImage
              src={post.coverImageUrl}
              alt={post.coverImageAlt ?? ''}
              fill
              priority
              sizes='(min-width: 1024px) 860px, 100vw'
              className='object-cover'
            />
          </div>
        )}

        <TableOfContents headings={headings} />

        <div className='mt-8'>
          <ArticleBody content={post.content} headings={headings} />
        </div>

        <ArticleFooter
          url={absoluteUrl(`/blog/${post.slug}`)}
          title={post.title}
          tags={post.tags}
        />
      </article>

      <RelatedPosts posts={post.related} />
    </div>
  </Container>
);

export default BlogArticle;
