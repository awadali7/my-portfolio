import type {
  AdminProfileProps,
  EmiProps,
  IncomeProps,
  IncomeSourceProps,
} from '@/common/types/emi';
import type {
  BorrowingProps,
  BorrowingSummaryProps,
  CategoryKind,
  CategoryProps,
  ExpenseMonthProps,
  ExpenseProps,
} from '@/common/types/money';

import { request } from './backend';

// Re-exported so existing imports of BackendError from here keep working.
export { BackendError } from './backend';

/*
 * The backend resource is `/bills`; the console calls them EMIs. This module is
 * the only place the two names meet.
 */

export const adminLogin = (username: string, password: string) =>
  request<{ accessToken: string; admin: AdminProfileProps }>(
    '/admin/auth/login',
    { method: 'POST', body: { username, password } },
  );

export const getAdminProfile = (token: string) =>
  request<AdminProfileProps>('/admin/auth/me', { token });

export const changeAdminPassword = (
  token: string,
  currentPassword: string,
  newPassword: string,
) =>
  request<{ ok: boolean }>('/admin/auth/change-password', {
    method: 'POST',
    token,
    body: { currentPassword, newPassword },
  });

export const getEmis = (token: string) =>
  request<EmiProps[]>('/bills', { token });

export const upsertEmi = (token: string, id: string, body: Partial<EmiProps>) =>
  request<EmiProps>(`/bills/${id}`, { method: 'PUT', token, body });

export const deleteEmi = (token: string, id: string) =>
  request<void>(`/bills/${id}`, { method: 'DELETE', token });

export const markEmiPaid = (token: string, id: string, cycle?: string) =>
  request<EmiProps>(`/bills/${id}/pay`, {
    method: 'POST',
    token,
    body: cycle ? { cycle } : {},
  });

export const markEmiUnpaid = (token: string, id: string, cycle?: string) =>
  request<EmiProps>(`/bills/${id}/unpay`, {
    method: 'POST',
    token,
    body: cycle ? { cycle } : {},
  });

/** Permanent sources plus the one-offs recorded against `cycle`, with totals. */
export const getIncome = (token: string, cycle?: string) =>
  request<IncomeProps>(
    cycle ? `/income?cycle=${encodeURIComponent(cycle)}` : '/income',
    { token },
  );

export const createIncomeSource = (
  token: string,
  body: { label: string; amount: number; cycle: string | null },
) => request<IncomeSourceProps>('/income', { method: 'POST', token, body });

export const updateIncomeSource = (
  token: string,
  id: string,
  body: { label: string; amount: number; cycle: string | null },
) =>
  request<IncomeSourceProps>(`/income/${id}`, { method: 'PUT', token, body });

export const deleteIncomeSource = (token: string, id: string) =>
  request<void>(`/income/${id}`, { method: 'DELETE', token });

/* ---------------------------------------------------------------- categories */

export const getCategories = (token: string, kind?: CategoryKind) =>
  request<CategoryProps[]>(
    kind ? `/categories?kind=${encodeURIComponent(kind)}` : '/categories',
    { token },
  );

export const createCategory = (
  token: string,
  body: { kind: CategoryKind; name: string },
) => request<CategoryProps>('/categories', { method: 'POST', token, body });

export const updateCategory = (
  token: string,
  id: string,
  body: { kind: CategoryKind; name: string },
) =>
  request<CategoryProps>(`/categories/${id}`, { method: 'PUT', token, body });

export const deleteCategory = (token: string, id: string) =>
  request<void>(`/categories/${id}`, { method: 'DELETE', token });

/* ------------------------------------------------------------------ expenses */

export const getExpenses = (token: string, cycle?: string) =>
  request<ExpenseMonthProps>(
    cycle ? `/expenses?cycle=${encodeURIComponent(cycle)}` : '/expenses',
    { token },
  );

type ExpenseBody = {
  label: string;
  amount: number;
  cycle: string;
  category: string | null;
  notes: string | null;
};

export const createExpense = (token: string, body: ExpenseBody) =>
  request<ExpenseProps>('/expenses', { method: 'POST', token, body });

export const updateExpense = (token: string, id: string, body: ExpenseBody) =>
  request<ExpenseProps>(`/expenses/${id}`, { method: 'PUT', token, body });

export const deleteExpense = (token: string, id: string) =>
  request<void>(`/expenses/${id}`, { method: 'DELETE', token });

/* ---------------------------------------------------------------- borrowings */

export const getBorrowings = (token: string) =>
  request<BorrowingSummaryProps>('/borrowings', { token });

type BorrowingBody = {
  lender: string;
  amount: number;
  startDate: string;
  dueDate: string;
  notes: string | null;
};

export const createBorrowing = (token: string, body: BorrowingBody) =>
  request<BorrowingProps>('/borrowings', { method: 'POST', token, body });

export const updateBorrowing = (
  token: string,
  id: string,
  body: BorrowingBody,
) =>
  request<BorrowingProps>(`/borrowings/${id}`, { method: 'PUT', token, body });

export const repayBorrowing = (token: string, id: string, repaidOn?: string) =>
  request<BorrowingProps>(`/borrowings/${id}/repay`, {
    method: 'POST',
    token,
    body: repaidOn ? { repaidOn } : {},
  });

export const unrepayBorrowing = (token: string, id: string) =>
  request<BorrowingProps>(`/borrowings/${id}/unrepay`, {
    method: 'POST',
    token,
    body: {},
  });

export const deleteBorrowing = (token: string, id: string) =>
  request<void>(`/borrowings/${id}`, { method: 'DELETE', token });

/* ----------------------------------------------------------------- assistant */

export type AssistantProposal = {
  kind: 'expense' | 'income' | 'emi' | 'borrowing' | 'clarify' | 'unknown';
  reply: string;
  fields: Record<string, unknown> | null;
  missing: string[];
};

export const getAssistantStatus = (token: string) =>
  request<{ configured: boolean }>('/assistant/status', { token });

export const interpretMessage = (
  token: string,
  body: { message: string; cycle?: string; kind?: string },
) =>
  request<AssistantProposal>('/assistant/interpret', {
    method: 'POST',
    token,
    body,
  });
