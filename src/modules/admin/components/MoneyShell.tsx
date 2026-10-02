import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  FiCreditCard,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiSettings,
  FiShoppingBag,
  FiTrendingUp,
  FiX,
} from 'react-icons/fi';

import type { AdminProfileProps } from '@/common/types/emi';
import { MONEY_TABS } from '@/common/types/money';

import MoneyChat from './MoneyChat';
import MoneyDock from './MoneyDock';
import MyyeePwa from './MyyeePwa';

const TAB_ICONS: Record<string, ReactNode> = {
  dashboard: <FiGrid size={15} />,
  emi: <FiCreditCard size={15} />,
  borrow: <FiCreditCard size={15} />,
  income: <FiTrendingUp size={15} />,
  expense: <FiShoppingBag size={15} />,
  settings: <FiSettings size={15} />,
};

type MoneyShellProps = {
  admin: AdminProfileProps;
  children: ReactNode;
  /** Optional controls (month switcher, Add button) shown beside the heading. */
  actions?: ReactNode;
  title: string;
  description?: string;
  /** Month in view, passed to the assistant so "this month" resolves right. */
  cycle?: string;
};

const MoneyShell = ({
  admin,
  children,
  actions,
  title,
  description,
  cycle,
}: MoneyShellProps) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDockOpen, setIsDockOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLAnchorElement>(null);

  const isActive = (href: string) =>
    href === '/admin'
      ? router.pathname === '/admin'
      : router.pathname.startsWith(href);

  // Dismiss on an outside click or Escape — a dropdown that only closes via
  // its own button is a trap on touch screens.
  useEffect(() => {
    if (!isMenuOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!menuRef.current?.contains(event.target as Node))
        setIsMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMenuOpen]);

  // On a narrow screen the active tab can start off-screen in the scroller.
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
    });
  }, [router.pathname]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    await router.replace('/admin/login');
  };

  return (
    <div className='space-y-5'>
      <MyyeePwa />
      <div className='flex items-center justify-between gap-3'>
        <div className='min-w-0'>
          <p className='text-sm font-medium'>Money Manage</p>
          <p className='truncate text-xs text-neutral-500'>{admin.username}</p>
        </div>

        <div ref={menuRef} className='relative shrink-0'>
          <button
            type='button'
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label='Menu'
            aria-expanded={isMenuOpen}
            aria-haspopup='menu'
            className='flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800'
          >
            {isMenuOpen ? <FiX size={16} /> : <FiMenu size={16} />}
          </button>

          {isMenuOpen && (
            <div
              role='menu'
              className='absolute right-0 z-30 mt-2 w-44 overflow-hidden rounded-lg border border-neutral-300 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900'
            >
              <div className='border-b border-neutral-200 px-3 py-2 dark:border-neutral-800'>
                <p className='truncate text-xs text-neutral-500'>
                  Signed in as {admin.username}
                </p>
              </div>
              <button
                type='button'
                role='menuitem'
                onClick={handleLogout}
                className='flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              >
                <FiLogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* One scrolling row: tabs never wrap, so the bar keeps a fixed height
          however many are added. */}
      <nav className='-mx-1 hidden gap-1 overflow-x-auto px-1 scrollbar-hide md:flex'>
        {MONEY_TABS.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.key}
              href={tab.href}
              ref={active ? activeTabRef : undefined}
              aria-current={active ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-neutral-200 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/60'
              }`}
            >
              {TAB_ICONS[tab.key]}
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className='flex flex-wrap items-start justify-between gap-3 border-y border-dashed border-neutral-300 py-4 dark:border-neutral-700'>
        <div>
          <h1 className='text-xl font-medium'>{title}</h1>
          {/* {description && (
            <p className='mt-0.5 text-sm text-neutral-600 dark:text-neutral-400'>
              {description}
            </p>
          )} */}
        </div>
        {actions}
      </div>

      <main>{children}</main>

      <MoneyDock isOpen={isDockOpen} onToggle={setIsDockOpen} />
      <MoneyChat cycle={cycle} />
    </div>
  );
};

export default MoneyShell;
