import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { FiExternalLink, FiLogOut } from 'react-icons/fi';

import Breakline from '@/common/components/elements/Breakline';
import ThemeSwitcher from '@/common/components/elements/ThemeSwitcher';
import ThemeToggleButton from '@/common/components/elements/ThemeToggleButton';
import MenuItem from '@/common/components/sidebar/MenuItem';
import MobileMenuButton from '@/common/components/sidebar/MobileMenuButton';
import { MenuContext } from '@/common/context/MenuContext';
import type { AdminProfileProps } from '@/common/types/emi';

import { ADMIN_NAV_GROUPS, ADMIN_NAV_ITEMS, findActiveTab } from './adminNav';

/*
 * The console's navigation, built from the site sidebar's own pieces
 * (MenuItem, Breakline, ThemeSwitcher, MobileMenuButton) so both look the
 * same. Wide screens get a sticky sidebar; phones get the site's top bar with
 * a menu that folds down. Which one shows is decided by CSS, not by measuring
 * the window, so the server and browser always render the same markup.
 */

type AdminSidebarProps = {
  admin: AdminProfileProps;
};

/** Initials rather than a photo: there is more than one admin account. */
const AdminAvatar = ({
  admin,
  size,
}: {
  admin: AdminProfileProps;
  size: 'sm' | 'lg';
}) => (
  <span
    aria-hidden='true'
    className={clsx(
      'flex shrink-0 rotate-3 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-sky-600 font-semibold text-white',
      size === 'lg' ? 'h-20 w-20 text-3xl' : 'h-10 w-10 text-lg',
    )}
  >
    {(admin.name || admin.username).trim().charAt(0).toUpperCase()}
  </span>
);

const groupTitle = 'text-sm text-neutral-600';

const AdminNavigation = ({
  activeKey,
  onSignOut,
}: {
  activeKey: string | undefined;
  onSignOut: () => void;
}) => (
  <div className='space-y-1'>
    {ADMIN_NAV_GROUPS.map((group, index) => (
      <div key={group.key} className='space-y-1'>
        {index > 0 && <Breakline className='mx-1' />}
        <div className='px-4'>
          <span className={groupTitle}>{group.title}</span>
        </div>
        <div className='flex flex-col space-y-1'>
          {group.items.map((item) => {
            const Icon = item.icon;
            return (
              <MenuItem
                key={item.key}
                title={item.label}
                href={item.href}
                icon={<Icon size={20} />}
                isExternal={false}
                isActive={item.key === activeKey}
              />
            );
          })}
        </div>
      </div>
    ))}

    <Breakline className='mx-1' />
    <div className='flex flex-col space-y-1'>
      <MenuItem
        title='View site'
        href='/'
        icon={<FiExternalLink size={20} />}
        isExternal={false}
        isActive={false}
      />
      <button
        type='button'
        onClick={onSignOut}
        className='group flex w-full items-center gap-2 rounded-lg py-2 pl-4 pr-2.5 text-left text-neutral-700 hover:text-neutral-900 dark:text-neutral-400 hover:dark:text-neutral-300 lg:transition-all lg:duration-300 hover:lg:bg-neutral-200 hover:dark:lg:bg-neutral-800'
      >
        <span className='transition-all duration-300 group-hover:-rotate-12'>
          <FiLogOut size={20} />
        </span>
        <span className='ml-0.5 flex-grow'>Sign out</span>
      </button>
    </div>
  </div>
);

const AdminSidebar = ({ admin }: AdminSidebarProps) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activeKey = findActiveTab(ADMIN_NAV_ITEMS, router.pathname);
  const displayName = admin.name || admin.username;

  const handleSignOut = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    await router.replace('/admin/login');
  };

  // Like the site menu: the page behind an open menu doesn't scroll.
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  // Close on Escape, once a navigation starts, and when the screen grows to
  // the desktop sidebar (a tablet turned sideways). Otherwise the hidden menu
  // would stay open and keep the page from scrolling.
  useEffect(() => {
    if (!isMenuOpen) return;
    const close = () => setIsMenuOpen(false);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => {
      if (desktop.matches) close();
    };
    document.addEventListener('keydown', onKeyDown);
    router.events.on('routeChangeStart', close);
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      router.events.off('routeChangeStart', close);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [isMenuOpen, router.events]);

  return (
    <MenuContext.Provider value={{ hideNavbar: () => setIsMenuOpen(false) }}>
      {/* Phones and tablets: the site's fixed top bar. */}
      <div
        className={clsx(
          'fixed inset-x-0 top-0 z-20 bg-light p-5 shadow-sm dark:border-b dark:border-neutral-800 dark:bg-dark lg:hidden',
          isMenuOpen && 'bottom-0 overflow-y-auto',
        )}
      >
        <div className='flex items-center justify-between gap-4'>
          <div className='flex min-w-0 items-center gap-4'>
            <AdminAvatar admin={admin} size='sm' />
            <div className='min-w-0'>
              <p className='truncate text-lg font-medium'>{displayName}</p>
              <p className='truncate text-xs text-neutral-500'>Admin console</p>
            </div>
          </div>
          <div className='flex shrink-0 items-center gap-5'>
            <ThemeToggleButton />
            {/* The site's animated bars, inside a real button so the menu
                also opens from the keyboard. */}
            <button
              type='button'
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls='admin-mobile-menu'
              className='flex rounded-md p-1'
            >
              <MobileMenuButton
                expandMenu={isMenuOpen}
                setExpandMenu={() => undefined}
              />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              id='admin-mobile-menu'
              aria-label='Console'
              className='pb-8 pt-6'
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <AdminNavigation
                activeKey={activeKey}
                onSignOut={handleSignOut}
              />
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      {/* Wide screens: the site's sticky sidebar. */}
      <div className='sticky top-0 z-10 hidden flex-col space-y-6 lg:flex lg:py-6'>
        <div className='flex flex-col items-start gap-0.5 px-2'>
          <AdminAvatar admin={admin} size='lg' />
          <p className='mt-4 text-xl font-medium'>{displayName}</p>
          <p className='text-sm text-neutral-600 dark:text-neutral-500'>
            @{admin.username}
          </p>
        </div>

        <div className='space-y-3'>
          <nav aria-label='Console'>
            <AdminNavigation activeKey={activeKey} onSignOut={handleSignOut} />
          </nav>
          <Breakline className='mx-1' />
          <div className='space-y-2.5 px-1'>
            <div className='px-3'>
              <span className={groupTitle}>Theme</span>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </MenuContext.Provider>
  );
};

export default AdminSidebar;
