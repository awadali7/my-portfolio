import Link from 'next/link';
import { FiCalendar, FiClock, FiFolder } from 'react-icons/fi';

import { formatBlogDate } from '@/common/helpers/blog';
import type { BlogPostSummaryProps } from '@/common/types/blog';

import CoverImage from './CoverImage';

type BlogListCardProps = {
  post: BlogPostSummaryProps;
  headingLevel?: 'h2' | 'h3';
};

const pill =
  'flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300';

/** The list card: cover on the left, title, excerpt and details on the right. */
const BlogListCard = ({ post, headingLevel = 'h2' }: BlogListCardProps) => {
  const Heading = headingLevel;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className='group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/60 sm:flex-row'
    >
      <div className='relative h-48 shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-800 sm:h-auto sm:w-64'>
        <CoverImage
          post={post}
          sizes='(min-width: 640px) 256px, 100vw'
          className='transition-transform duration-500 group-hover:scale-105'
        />
      </div>
      <div className='flex flex-1 flex-col gap-3 p-5'>
        <Heading className='text-lg font-medium leading-snug text-neutral-900 transition-colors group-hover:text-teal-600 dark:text-neutral-100 dark:group-hover:text-teal-400'>
          {post.title}
        </Heading>
        <p className='line-clamp-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400'>
          {post.excerpt}
        </p>
        <div className='mt-auto flex flex-wrap gap-2 text-xs'>
          <span className={pill}>
            <FiCalendar size={12} aria-hidden='true' />
            <time dateTime={post.publishedAt}>
              {formatBlogDate(post.publishedAt)}
            </time>
          </span>
          <span className={pill}>
            <FiClock size={12} aria-hidden='true' />
            {post.readingMinutes} min read
          </span>
          {post.category && (
            <span className={pill}>
              <FiFolder size={12} aria-hidden='true' />
              {post.category.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default BlogListCard;
