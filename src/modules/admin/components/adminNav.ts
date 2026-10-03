import type { IconType } from 'react-icons';
import {
  FiCreditCard,
  FiFileText,
  FiFolder,
  FiGrid,
  FiSettings,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';

import { BLOG_TABS } from '@/common/types/blog';
import { MONEY_TABS } from '@/common/types/money';

export type AdminNavTab = {
  key: string;
  label: string;
  href: string;
  icon: IconType;
};

export type AdminNavGroup = {
  key: 'money' | 'blog';
  title: string;
  items: AdminNavTab[];
};

const MONEY_ICONS: Record<(typeof MONEY_TABS)[number]['key'], IconType> = {
  dashboard: FiGrid,
  emi: FiCreditCard,
  // EMI and Borrow sit next to each other in the menu, so they get
  // different glyphs.
  borrow: FiUsers,
  income: FiTrendingUp,
  expense: FiShoppingBag,
  settings: FiSettings,
};

const BLOG_ICONS: Record<(typeof BLOG_TABS)[number]['key'], IconType> = {
  posts: FiFileText,
  categories: FiFolder,
};

/** The console's sidebar: one group per section. */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    key: 'money',
    title: 'Money',
    items: MONEY_TABS.map((tab) => ({ ...tab, icon: MONEY_ICONS[tab.key] })),
  },
  {
    key: 'blog',
    title: 'Blog',
    items: BLOG_TABS.map((tab) => ({ ...tab, icon: BLOG_ICONS[tab.key] })),
  },
];

export const ADMIN_NAV_ITEMS: AdminNavTab[] = ADMIN_NAV_GROUPS.flatMap(
  (group) => group.items,
);

/**
 * The item whose address is the longest prefix of the current path, so
 * /admin/blog/categories lights Categories, /admin/blog/[id] lights Posts,
 * and /admin itself lights only Dashboard.
 */
export const findActiveTab = (tabs: AdminNavTab[], pathname: string) =>
  tabs
    .filter(
      (tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.key;
