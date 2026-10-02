/** Shared types for the Money Manage console (EMIs, income, expenses). */

export type CategoryKind = 'emi' | 'income' | 'expense';

export type CategoryProps = {
  id: string;
  kind: CategoryKind;
  name: string;
};

export type ExpenseProps = {
  id: string;
  label: string;
  amount: number;
  /** "YYYY-MM" this expense counts towards. */
  cycle: string;
  category: string | null;
  notes: string | null;
};

export type ExpenseMonthProps = {
  cycle: string;
  expenses: ExpenseProps[];
  total: number;
  /** Largest first — drives the breakdown list. */
  byCategory: { category: string; amount: number }[];
};

/** Money borrowed from a person: one sum, taken on a date, owed back by another. */
export type BorrowingProps = {
  id: string;
  lender: string;
  amount: number;
  /** ISO datetime. */
  startDate: string;
  dueDate: string;
  /** Null while outstanding. */
  repaidOn: string | null;
  notes: string | null;
};

export type BorrowingSummaryProps = {
  borrowings: BorrowingProps[];
  outstandingTotal: number;
  repaidTotal: number;
  outstandingCount: number;
  overdueCount: number;
};

/** The tabs across the top of the console. */
export const MONEY_TABS = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin' },
  { key: 'emi', label: 'EMI', href: '/admin/emi' },
  { key: 'borrow', label: 'Borrow', href: '/admin/borrow' },
  { key: 'income', label: 'Income', href: '/admin/income' },
  { key: 'expense', label: 'Expense', href: '/admin/expense' },
  { key: 'settings', label: 'Settings', href: '/admin/settings' },
] as const;

export type MoneyTabKey = (typeof MONEY_TABS)[number]['key'];
