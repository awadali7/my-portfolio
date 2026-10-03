import { FiChevronDown } from 'react-icons/fi';

import { tableOfContents } from '@/common/helpers/blog';
import type { BlogHeadingProps } from '@/common/types/blog';

/**
 * The post's sections in a fold-out block above the body. <details> opens
 * and closes with no JavaScript at all.
 */
const TableOfContents = ({ headings }: { headings: BlogHeadingProps[] }) => {
  const items = tableOfContents(headings);
  if (items.length === 0) return null;

  return (
    <details className='group my-8 rounded-xl border border-neutral-200 px-2 py-1 dark:border-neutral-800'>
      <summary className='toc-summary flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-medium'>
        Table of contents
        <FiChevronDown
          size={16}
          aria-hidden='true'
          className='transition-transform group-open:rotate-180'
        />
      </summary>
      <nav aria-label='Table of contents' className='pb-2'>
        <ol className='space-y-1 text-sm'>
          {items.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className='block rounded-md px-3 py-1.5 leading-snug text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-100'
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
};

export default TableOfContents;
