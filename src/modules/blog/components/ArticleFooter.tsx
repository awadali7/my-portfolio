import NextImage from 'next/image';
import Link from 'next/link';

import { BLOG_AUTHOR } from '@/common/constant/blog';

import ShareLinks from './ShareLinks';

type ArticleFooterProps = {
  url: string;
  title: string;
  tags: string[];
};

const ArticleFooter = ({ url, title, tags }: ArticleFooterProps) => (
  <footer className='mt-12 space-y-8 border-t border-neutral-200 pt-8 dark:border-neutral-800'>
    {tags.length > 0 && (
      <ul aria-label='Tags' className='flex flex-wrap gap-2'>
        {tags.map((tag) => (
          <li key={tag}>
            <Link
              href={`/blog?tag=${encodeURIComponent(tag)}`}
              className='rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
            >
              #{tag}
            </Link>
          </li>
        ))}
      </ul>
    )}

    <ShareLinks url={url} title={title} />

    <div className='flex gap-4 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800'>
      <NextImage
        src={BLOG_AUTHOR.avatar}
        alt=''
        width={56}
        height={56}
        className='h-14 w-14 shrink-0 rounded-full border border-neutral-300 dark:border-neutral-700'
      />
      <div>
        <p className='text-xs uppercase tracking-wide text-neutral-500'>
          Written by
        </p>
        <p className='font-medium text-neutral-900 dark:text-neutral-100'>
          <Link
            href={BLOG_AUTHOR.href}
            rel='author'
            className='hover:underline'
          >
            {BLOG_AUTHOR.name}
          </Link>
        </p>
        <p className='mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400'>
          {BLOG_AUTHOR.bio}
        </p>
        <div className='mt-3 flex gap-4 text-sm'>
          <Link
            href='/about'
            className='text-teal-600 hover:underline dark:text-teal-400'
          >
            About me
          </Link>
          <Link
            href='/contact'
            className='text-teal-600 hover:underline dark:text-teal-400'
          >
            Get in touch
          </Link>
        </div>
      </div>
    </div>
  </footer>
);

export default ArticleFooter;
