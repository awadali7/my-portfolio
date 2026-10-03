import Link from 'next/link';

import { formatBlogDate } from '@/common/helpers/blog';
import cn from '@/common/libs/cn';
import type { BlogPostSummaryProps } from '@/common/types/blog';

import CoverImage from './CoverImage';

type BlogCardProps = {
  post: BlogPostSummaryProps;
  headingLevel?: 'h2' | 'h3';
  /** `md` for the listing grid, `sm` for the shorter "Read next" cards. */
  size?: 'md' | 'sm';
  /** Load the cover eagerly: only for cards visible without scrolling. */
  priority?: boolean;
};

/** The grid card: a full-bleed cover with the title over a dark fade. */
const BlogCard = ({
  post,
  headingLevel = 'h2',
  size = 'md',
  priority = false,
}: BlogCardProps) => {
  const Heading = headingLevel;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        'group relative flex flex-col justify-end overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900 dark:border-neutral-800',
        size === 'md' ? 'h-96' : 'h-72',
      )}
    >
      <CoverImage
        post={post}
        priority={priority}
        sizes='(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw'
        className='transition-transform duration-500 group-hover:scale-105'
      />
      <span
        aria-hidden='true'
        className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10'
      />

      {post.category && (
        <span className='absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur'>
          {post.category.name}
        </span>
      )}

      <div className='relative space-y-2 p-5'>
        <Heading className='line-clamp-3 text-lg font-semibold leading-snug text-white'>
          {post.title}
        </Heading>
        {size === 'md' && (
          <p className='line-clamp-2 text-sm leading-relaxed text-neutral-300'>
            {post.excerpt}
          </p>
        )}
        <p className='text-xs text-neutral-300'>
          <time dateTime={post.publishedAt}>
            {formatBlogDate(post.publishedAt)}
          </time>
          {` · ${post.readingMinutes} min read`}
        </p>
      </div>
    </Link>
  );
};

export default BlogCard;
