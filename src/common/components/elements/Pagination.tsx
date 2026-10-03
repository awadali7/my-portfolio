import clsx from 'clsx';
import Link from 'next/link';
import { ReactNode } from 'react';
import {
  BiChevronLeft as PrevIcon,
  BiChevronRight as NextIcon,
} from 'react-icons/bi';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  /** Client-side paging. Ignored when `getHref` is given. */
  onPageChange?: (page: number) => void;
  /** Renders real links instead of buttons, so crawlers can follow every page. */
  getHref?: (page: number) => string;
}

const VISIBLE_PAGES = 3;

/** e.g. [1, '...', 4, 5, 6, '...', 12] around the current page. */
const pageItems = (currentPage: number, totalPages: number) => {
  const firstPage = Math.max(1, currentPage - Math.floor(VISIBLE_PAGES / 2));
  const lastPage = Math.min(totalPages, firstPage + VISIBLE_PAGES - 1);
  const items: (number | '...')[] = [];

  if (firstPage > 1) items.push(1, '...');
  for (let page = firstPage; page <= lastPage; page += 1) items.push(page);
  if (lastPage < totalPages) items.push('...', totalPages);

  return items;
};

const arrowClass =
  'mx-1 rounded bg-neutral-200 px-2 py-1.5 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200';

const Pagination = ({
  totalPages,
  currentPage,
  onPageChange,
  getHref,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const control = (
    key: string,
    page: number,
    content: ReactNode,
    className: string,
    options: { label?: string; rel?: string; current?: boolean } = {},
  ) =>
    getHref ? (
      <Link
        key={key}
        href={getHref(page)}
        rel={options.rel}
        aria-label={options.label}
        aria-current={options.current ? 'page' : undefined}
        className={className}
      >
        {content}
      </Link>
    ) : (
      <button
        key={key}
        type='button'
        onClick={() => onPageChange?.(page)}
        aria-label={options.label}
        aria-current={options.current ? 'page' : undefined}
        className={className}
      >
        {content}
      </button>
    );

  return (
    <nav
      aria-label='Pagination'
      className='flex items-center justify-center pt-8'
    >
      {currentPage > 1 &&
        control('prev', currentPage - 1, <PrevIcon size={24} />, arrowClass, {
          label: 'Previous page',
          rel: 'prev',
        })}

      <div className='hidden sm:flex'>
        {pageItems(currentPage, totalPages).map((page, index) =>
          page === '...' ? (
            <span
              key={`gap-${index}`}
              className='mx-1 px-2 py-1.5 text-neutral-500'
            >
              …
            </span>
          ) : (
            control(
              `page-${page}`,
              page,
              page,
              clsx(
                'mx-1 items-center rounded px-4 py-1.5',
                currentPage === page
                  ? 'bg-sky-600 text-white'
                  : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200',
              ),
              { current: currentPage === page, label: `Page ${page}` },
            )
          ),
        )}
      </div>

      <span className='px-3 text-sm text-neutral-500 sm:hidden'>
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages &&
        control('next', currentPage + 1, <NextIcon size={24} />, arrowClass, {
          label: 'Next page',
          rel: 'next',
        })}
    </nav>
  );
};

export default Pagination;
