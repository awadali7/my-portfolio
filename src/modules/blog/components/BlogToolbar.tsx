import Link from 'next/link';
import { BiSearchAlt as SearchIcon } from 'react-icons/bi';
import { FiGrid, FiList } from 'react-icons/fi';

import type { BlogView } from '@/common/hooks/useBlogView';
import cn from '@/common/libs/cn';
import type { BlogCategoryProps } from '@/common/types/blog';

type BlogToolbarProps = {
  categories: BlogCategoryProps[];
  activeSlug: string | null;
  isAllActive: boolean;
  q: string;
  view: BlogView;
  onViewChange: (view: BlogView) => void;
};

const chipClass = (active: boolean) =>
  cn(
    'flex shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition-colors',
    active
      ? 'border-neutral-800 bg-neutral-800 text-neutral-50 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
      : 'border-neutral-300 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800',
  );

const toggleClass = (active: boolean) =>
  cn(
    'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
    active
      ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100'
      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200',
  );

/** Category chips on the left; search and the grid or list switch on the right. */
const BlogToolbar = ({
  categories,
  activeSlug,
  isAllActive,
  q,
  view,
  onViewChange,
}: BlogToolbarProps) => (
  <div className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
    <nav aria-label='Blog categories' className='min-w-0'>
      <ul className='-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide'>
        <li>
          <Link
            href='/blog'
            aria-current={isAllActive ? 'page' : undefined}
            className={chipClass(isAllActive)}
          >
            All
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/blog/category/${category.slug}`}
              aria-current={activeSlug === category.slug ? 'page' : undefined}
              className={chipClass(activeSlug === category.slug)}
            >
              {category.name}
              <span className='text-xs tabular-nums opacity-60'>
                {category.postCount}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>

    <div className='flex items-center gap-2'>
      {/* A plain GET form: search works before, and without, JavaScript. */}
      <form
        action='/blog'
        method='get'
        role='search'
        className='relative flex-1 lg:w-64 lg:flex-none'
      >
        <label htmlFor='blog-search' className='sr-only'>
          Search the blog
        </label>
        <SearchIcon
          size={18}
          aria-hidden='true'
          className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400'
        />
        <input
          id='blog-search'
          name='q'
          type='search'
          defaultValue={q}
          placeholder='Search posts'
          maxLength={100}
          className='w-full rounded-lg border border-neutral-300 bg-transparent py-2 pl-10 pr-3 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700'
        />
      </form>

      <div
        role='group'
        aria-label='Layout'
        className='flex shrink-0 rounded-lg border border-neutral-300 p-0.5 dark:border-neutral-700'
      >
        <button
          type='button'
          onClick={() => onViewChange('grid')}
          aria-pressed={view === 'grid'}
          aria-label='Grid view'
          className={toggleClass(view === 'grid')}
        >
          <FiGrid size={16} />
        </button>
        <button
          type='button'
          onClick={() => onViewChange('list')}
          aria-pressed={view === 'list'}
          aria-label='List view'
          className={toggleClass(view === 'list')}
        >
          <FiList size={16} />
        </button>
      </div>
    </div>
  </div>
);

export default BlogToolbar;
