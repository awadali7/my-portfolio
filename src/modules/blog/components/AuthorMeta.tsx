import NextImage from 'next/image';
import Link from 'next/link';

import { BLOG_AUTHOR } from '@/common/constant/blog';
import { formatBlogDate, wasUpdatedLater } from '@/common/helpers/blog';
import cn from '@/common/libs/cn';

type AuthorMetaProps = {
  publishedAt: string | null;
  contentUpdatedAt: string | null;
  readingMinutes: number;
  className?: string;
};

/** The article byline: photo, name, dates and reading time. */
const AuthorMeta = ({
  publishedAt,
  contentUpdatedAt,
  readingMinutes,
  className,
}: AuthorMetaProps) => {
  const showUpdated =
    contentUpdatedAt !== null && wasUpdatedLater(publishedAt, contentUpdatedAt);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <NextImage
        src={BLOG_AUTHOR.avatar}
        alt=''
        width={44}
        height={44}
        className='shrink-0 rounded-full border border-neutral-300 dark:border-neutral-700'
      />
      <div className='min-w-0 text-sm'>
        <p className='font-medium text-neutral-800 dark:text-neutral-200'>
          <Link
            href={BLOG_AUTHOR.href}
            rel='author'
            className='hover:underline'
          >
            {BLOG_AUTHOR.name}
          </Link>
        </p>
        <p className='text-neutral-500 dark:text-neutral-400'>
          {publishedAt ? (
            <time dateTime={publishedAt}>{formatBlogDate(publishedAt)}</time>
          ) : (
            'Not published yet'
          )}
          {showUpdated && (
            <>
              {' · Updated '}
              <time dateTime={contentUpdatedAt}>
                {formatBlogDate(contentUpdatedAt)}
              </time>
            </>
          )}
          {` · ${readingMinutes} min read`}
        </p>
      </div>
    </div>
  );
};

export default AuthorMeta;
