import Link from 'next/link';

import type { BlogPostProps } from '@/common/types/blog';

import AuthorMeta from './AuthorMeta';

type ArticleHeaderProps = {
  post: Pick<
    BlogPostProps,
    'title' | 'excerpt' | 'category' | 'readingMinutes' | 'contentUpdatedAt'
  > & { publishedAt: string | null };
};

/** Title, excerpt and byline, finished with the site's dashed rule. */
const ArticleHeader = ({ post }: ArticleHeaderProps) => (
  <header className='border-b border-dashed border-neutral-600 pb-6'>
    {post.category && (
      <Link
        href={`/blog/category/${post.category.slug}`}
        className='inline-block rounded-full bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-600 hover:bg-teal-500/20 dark:text-teal-400'
      >
        {post.category.name}
      </Link>
    )}
    <h1 className='mt-3 text-2xl font-medium leading-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl'>
      {post.title}
    </h1>
    <p className='mt-3 leading-relaxed text-neutral-600 dark:text-neutral-400'>
      {post.excerpt}
    </p>
    <AuthorMeta
      publishedAt={post.publishedAt}
      contentUpdatedAt={post.contentUpdatedAt}
      readingMinutes={post.readingMinutes}
      className='mt-5'
    />
  </header>
);

export default ArticleHeader;
