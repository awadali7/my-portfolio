import type { IconType } from 'react-icons';

import { BLOG_TABS } from '@/common/types/blog';
import { MONEY_TABS } from '@/common/types/money';
import {
  ADMIN_NAV_GROUPS,
  ADMIN_NAV_ITEMS,
  AdminNavTab,
  findActiveTab,
} from '@/modules/admin/components/adminNav';

const Icon = (() => null) as unknown as IconType;
const withIcons = (
  tabs: readonly { key: string; label: string; href: string }[],
) => tabs.map((tab): AdminNavTab => ({ ...tab, icon: Icon }));

describe('findActiveTab', () => {
  test('lights up the money tab that owns the page', () => {
    const tabs = withIcons(MONEY_TABS);
    expect(findActiveTab(tabs, '/admin')).toBe('dashboard');
    expect(findActiveTab(tabs, '/admin/emi')).toBe('emi');
    expect(findActiveTab(tabs, '/admin/settings')).toBe('settings');
  });

  test('keeps Posts lit in the editor but not on Categories', () => {
    const tabs = withIcons(BLOG_TABS);
    expect(findActiveTab(tabs, '/admin/blog')).toBe('posts');
    expect(findActiveTab(tabs, '/admin/blog/new')).toBe('posts');
    expect(findActiveTab(tabs, '/admin/blog/[id]')).toBe('posts');
    expect(findActiveTab(tabs, '/admin/blog/categories')).toBe('categories');
  });

  test('lights exactly one item across both sidebar groups', () => {
    expect(findActiveTab(ADMIN_NAV_ITEMS, '/admin')).toBe('dashboard');
    expect(findActiveTab(ADMIN_NAV_ITEMS, '/admin/borrow')).toBe('borrow');
    expect(findActiveTab(ADMIN_NAV_ITEMS, '/admin/blog')).toBe('posts');
    expect(findActiveTab(ADMIN_NAV_ITEMS, '/admin/blog/[id]/preview')).toBe(
      'posts',
    );
    expect(findActiveTab(ADMIN_NAV_ITEMS, '/admin/blog/categories')).toBe(
      'categories',
    );
  });
});

describe('ADMIN_NAV_GROUPS', () => {
  test('lists every money and blog tab once, each with an icon', () => {
    expect(ADMIN_NAV_GROUPS.map((group) => group.title)).toEqual([
      'Money',
      'Blog',
    ]);
    expect(ADMIN_NAV_ITEMS.map((item) => item.key)).toEqual([
      ...MONEY_TABS.map((tab) => tab.key),
      ...BLOG_TABS.map((tab) => tab.key),
    ]);
    ADMIN_NAV_ITEMS.forEach((item) => expect(item.icon).toBeDefined());
  });
});
