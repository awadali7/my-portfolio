import Link from 'next/link';
import { FiStar } from 'react-icons/fi';

import SectionHeading from '@/common/components/elements/SectionHeading';
import { formatBlogDate } from '@/common/helpers/blog';
import type { BlogPostSummaryProps } from '@/common/types/blog';

import CoverImage from './CoverImage';

/** The newest post as a full-width hero at the top of the blog. */
const FeaturedPost = ({ post }: { post: BlogPostSummaryProps }) => (
  <section aria-label='Featured post' className='mb-12'>
    <SectionHeading
      title='Featured'
      icon={<FiStar size={20} />}
      className='mb-4'
    />
    <Link
      href={`/blog/${post.slug}`}
      className='group relative flex h-80 flex-col justify-end overflow-hidden rounded-xl bg-neutral-900 sm:h-96'
    >
      {/* The largest element on the page, so it loads first. */}
      <CoverImage
        post={post}
        priority
        sizes='(min-width: 1152px) 1090px, 100vw'
        className='transition-transform duration-700 group-hover:scale-105'
      />
      <span
        aria-hidden='true'
        className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10'
      />
      <div className='relative max-w-3xl space-y-3 p-6 sm:p-8'>
        {post.category && (
          <span className='inline-block rounded-full bg-teal-500 px-3 py-1 text-xs font-medium text-white'>
            {post.category.name}
          </span>
        )}
        <h3 className='text-2xl font-semibold leading-tight text-white sm:text-3xl'>
          {post.title}
        </h3>
        <p className='hidden leading-relaxed text-neutral-200 sm:line-clamp-2'>
          {post.excerpt}
        </p>
        <p className='text-sm text-neutral-300'>
          <time dateTime={post.publishedAt}>
            {formatBlogDate(post.publishedAt)}
          </time>
          {` · ${post.readingMinutes} min read`}
        </p>
      </div>
    </Link>
  </section>
);

export default FeaturedPost;
