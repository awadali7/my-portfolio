import { useRouter } from 'next/router';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import { formatCycle, shiftCycle, toCycle } from '@/common/helpers/emi';

type MonthSwitcherProps = {
  cycle: string;
};

/**
 * Drives the selected month through the URL (`?cycle=YYYY-MM`) rather than
 * component state, so each month is linkable and the server can render the
 * right data directly instead of the page fetching it after mount.
 */
const MonthSwitcher = ({ cycle }: MonthSwitcherProps) => {
  const router = useRouter();

  const go = (next: string) =>
    router.push(
      { pathname: router.pathname, query: { ...router.query, cycle: next } },
      undefined,
      { scroll: false },
    );

  const isCurrent = cycle === toCycle();

  return (
    <div className='flex items-center gap-2'>
      <button
        type='button'
        onClick={() => go(shiftCycle(cycle, -1))}
        aria-label='Previous month'
        className='rounded-lg border border-neutral-300 p-1.5 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800'
      >
        <FiChevronLeft size={14} />
      </button>
      <span className='min-w-[9rem] text-center text-sm font-medium'>
        {formatCycle(cycle)}
      </span>
      <button
        type='button'
        onClick={() => go(shiftCycle(cycle, 1))}
        aria-label='Next month'
        className='rounded-lg border border-neutral-300 p-1.5 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800'
      >
        <FiChevronRight size={14} />
      </button>
      {!isCurrent && (
        <button
          type='button'
          onClick={() => go(toCycle())}
          className='text-xs text-neutral-500 underline underline-offset-2'
        >
          Today
        </button>
      )}
    </div>
  );
};

export default MonthSwitcher;
