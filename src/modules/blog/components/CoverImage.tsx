import NextImage from 'next/image';

import cn from '@/common/libs/cn';
import type { BlogPostSummaryProps } from '@/common/types/blog';

type CoverImageProps = {
  post: Pick<
    BlogPostSummaryProps,
    'coverImageUrl' | 'coverImageAlt' | 'category'
  >;
  /** Rendered widths, so the browser downloads the right size. */
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * Fills its positioned parent with the post's cover, or with a gradient and
 * the category name when the post has no cover.
 */
const CoverImage = ({
  post,
  sizes,
  priority = false,
  className,
}: CoverImageProps) =>
  post.coverImageUrl ? (
    <NextImage
      src={post.coverImageUrl}
      alt={post.coverImageAlt ?? ''}
      fill
      sizes={sizes}
      priority={priority}
      className={cn('object-cover', className)}
    />
  ) : (
    <span
      aria-hidden='true'
      className={cn(
        'absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-teal-700 via-neutral-800 to-neutral-950',
        className,
      )}
    >
      <span className='select-none px-4 text-center text-5xl font-bold uppercase tracking-tight text-white/10'>
        {post.category?.name ?? 'Blog'}
      </span>
    </span>
  );

export default CoverImage;
