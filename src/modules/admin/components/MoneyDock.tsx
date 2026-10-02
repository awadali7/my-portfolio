import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import {
  FiChevronUp,
  FiCreditCard,
  FiGrid,
  FiSettings,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
  FiX,
} from 'react-icons/fi';

import cn from '@/common/libs/cn';
import { MONEY_TABS } from '@/common/types/money';

/**
 * Floating dock navigation for narrow screens, adapted from Aceternity's
 * FloatingDock.
 *
 * Adapted rather than copied: that component targets shadcn + Tailwind v4 +
 * `motion/react` + Tabler icons, none of which this project uses. The motion
 * APIs it needs all exist in framer-motion 10, so the behaviour is the same
 * with no new dependencies.
 *
 * Sits bottom-LEFT because the assistant button already owns bottom-right.
 */

const ICONS: Record<string, JSX.Element> = {
  dashboard: <FiGrid className='h-full w-full' />,
  emi: <FiCreditCard className='h-full w-full' />,
  // Deliberately not a card icon: EMI and Borrow sitting side by side with the
  // same glyph would be unreadable at this size.
  borrow: <FiUsers className='h-full w-full' />,
  income: <FiTrendingUp className='h-full w-full' />,
  expense: <FiShoppingBag className='h-full w-full' />,
  settings: <FiSettings className='h-full w-full' />,
};

type MoneyDockProps = {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
};

const MoneyDock = ({ isOpen, onToggle }: MoneyDockProps) => {
  const router = useRouter();

  const isActive = (href: string) =>
    href === '/admin'
      ? router.pathname === '/admin'
      : router.pathname.startsWith(href);

  // Close once navigation lands, otherwise the stack stays open over the page
  // it just moved to.
  useEffect(() => {
    const close = () => onToggle(false);
    router.events.on('routeChangeComplete', close);
    return () => router.events.off('routeChangeComplete', close);
  }, [router.events, onToggle]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onToggle(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onToggle]);

  return (
    <div className='fixed bottom-5 left-5 z-40 block md:hidden'>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            layoutId='money-dock'
            className='absolute inset-x-0 bottom-full mb-2 flex flex-col items-start gap-2'
          >
            {MONEY_TABS.map((tab, index) => {
              const active = isActive(tab.href);
              return (
                <motion.div
                  key={tab.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: 10,
                    transition: { delay: index * 0.05 },
                  }}
                  transition={{
                    delay: (MONEY_TABS.length - 1 - index) * 0.05,
                  }}
                >
                  <Link
                    href={tab.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => onToggle(false)}
                    className={cn(
                      'flex items-center gap-2 rounded-full border py-2 pl-2 pr-3 shadow-sm transition-colors',
                      active
                        ? 'border-neutral-900 bg-neutral-900 text-neutral-50 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
                        : 'border-neutral-300 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300',
                    )}
                  >
                    <span className='flex h-6 w-6 items-center justify-center'>
                      <span className='h-4 w-4'>{ICONS[tab.key]}</span>
                    </span>
                    {/* Labelled, unlike the original icon-only dock: six money
                        categories are not guessable from glyphs alone. */}
                    <span className='whitespace-nowrap text-xs font-medium'>
                      {tab.label}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type='button'
        onClick={() => onToggle(!isOpen)}
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isOpen}
        className='flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800 text-neutral-50 shadow-lg transition-transform hover:scale-105 dark:bg-neutral-100 dark:text-neutral-900'
      >
        {isOpen ? <FiX size={18} /> : <FiChevronUp size={20} />}
      </button>
    </div>
  );
};

export default MoneyDock;
