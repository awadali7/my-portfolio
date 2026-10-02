import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';

import { formatCycle, formatRupees } from '@/common/helpers/emi';
import type { AdminProfileProps } from '@/common/types/emi';
import type {
  CategoryProps,
  ExpenseMonthProps,
  ExpenseProps,
} from '@/common/types/money';

import CardPattern from './components/CardPattern';
import MoneyShell from './components/MoneyShell';
import MonthSwitcher from './components/MonthSwitcher';

type ExpenseTabProps = {
  admin: AdminProfileProps;
  initialMonth: ExpenseMonthProps;
  categories: CategoryProps[];
  cycle: string;
};

const ExpenseTab = ({
  admin,
  initialMonth,
  categories,
  cycle,
}: ExpenseTabProps) => {
  const router = useRouter();
  const [month, setMonth] = useState<ExpenseMonthProps>(initialMonth);
  const [isAdding, setIsAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const call = async (url: string, init: RequestInit) => {
    const response = await fetch(url, {
      headers: { 'content-type': 'application/json' },
      ...init,
    });
    if (response.status === 401) {
      await router.replace('/admin/login');
      throw new Error('Session expired');
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || `Request failed (${response.status})`);
    }
    return response.status === 204 ? null : await response.json();
  };

  /** Totals and the category breakdown are computed server-side, so refetch. */
  const refresh = async () => {
    setMonth(
      (await call(`/api/admin/expenses?cycle=${cycle}`, {
        method: 'GET',
      })) as ExpenseMonthProps,
    );
  };

  const reset = () => {
    setLabel('');
    setAmount('');
    setCategory('');
    setError(null);
    setIsAdding(false);
  };

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = Number(amount);
    if (!label.trim()) return setError('Give it a name');
    if (!Number.isFinite(parsed) || parsed < 0) {
      return setError('Amount must be a whole number of rupees');
    }

    setIsBusy(true);
    setError(null);
    try {
      await call('/api/admin/expenses', {
        method: 'POST',
        body: JSON.stringify({
          label: label.trim(),
          amount: Math.trunc(parsed),
          cycle,
          category: category.trim() || null,
          notes: null,
        }),
      });
      await refresh();
      reset();
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Could not add');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async (expense: ExpenseProps) => {
    if (!window.confirm(`Delete "${expense.label}"?`)) return;
    setIsBusy(true);
    setError(null);
    try {
      await call(`/api/admin/expenses/${expense.id}`, { method: 'DELETE' });
      await refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Could not delete',
      );
    } finally {
      setIsBusy(false);
    }
  };

  const inputClass =
    'rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700';

  return (
    <MoneyShell
      admin={admin}
      title='Expense'
      description='One-off spending, counted against the month it belongs to.'
      cycle={cycle}
      actions={
        <div className='flex flex-wrap items-center gap-3'>
          <MonthSwitcher cycle={cycle} />
          <button
            type='button'
            onClick={() => setIsAdding(true)}
            className='flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-sm font-medium text-neutral-50 hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900'
          >
            <FiPlus size={14} /> Add
          </button>
        </div>
      }
    >
      <div className='space-y-5'>
        <div className='grid gap-3 sm:grid-cols-3'>
          <div className='relative overflow-hidden rounded-xl border border-neutral-300 p-4 dark:border-neutral-800 dark:bg-neutral-900/40'>
            <CardPattern />
            <p className='text-xs text-neutral-600 dark:text-neutral-400'>
              Spent in {formatCycle(cycle)}
            </p>
            <p className='mt-2 text-lg font-medium'>
              {formatRupees(month.total)}
            </p>
            <p className='mt-0.5 text-xs text-neutral-500'>
              {month.expenses.length} item
              {month.expenses.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className='rounded-xl border border-neutral-300 p-4 dark:border-neutral-800 dark:bg-neutral-900/40 sm:col-span-2'>
            <p className='text-xs text-neutral-600 dark:text-neutral-400'>
              By category
            </p>
            {month.byCategory.length === 0 ? (
              <p className='mt-2 text-sm text-neutral-500'>Nothing yet</p>
            ) : (
              <ul className='mt-2 space-y-1.5'>
                {month.byCategory.map((row) => (
                  <li key={row.category}>
                    <div className='flex items-center justify-between text-xs'>
                      <span>{row.category}</span>
                      <span className='tabular-nums'>
                        {formatRupees(row.amount)}
                      </span>
                    </div>
                    <div className='mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800'>
                      <div
                        className='h-full rounded-full bg-neutral-500'
                        style={{
                          width: `${
                            month.total > 0
                              ? Math.round((row.amount / month.total) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {isAdding && (
          <form
            onSubmit={handleAdd}
            className='relative space-y-3 overflow-hidden rounded-xl border border-neutral-300 p-4 dark:border-neutral-800 dark:bg-neutral-900/40'
          >
            <CardPattern />
            <div className='flex flex-wrap gap-2'>
              <input
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder='Weekly shop'
                autoFocus
                className={`min-w-0 flex-1 ${inputClass}`}
              />
              <input
                list='expense-categories'
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder='Category'
                className={`w-40 ${inputClass}`}
              />
              <datalist id='expense-categories'>
                {categories.map((item) => (
                  <option key={item.id} value={item.name} />
                ))}
              </datalist>
              <input
                type='number'
                min={0}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder='8400'
                className={`w-32 ${inputClass}`}
              />
            </div>

            {error && (
              <p role='alert' className='text-sm text-red-500'>
                {error}
              </p>
            )}

            <div className='flex gap-2'>
              <button
                type='submit'
                disabled={isBusy}
                className='rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-50 hover:bg-neutral-700 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900'
              >
                Add expense
              </button>
              <button
                type='button'
                onClick={reset}
                className='flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs dark:border-neutral-700'
              >
                <FiX size={12} /> Cancel
              </button>
            </div>
          </form>
        )}

        {!isAdding && error && (
          <p
            role='alert'
            className='rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500'
          >
            {error}
          </p>
        )}

        <div className='space-y-2'>
          {month.expenses.length === 0 ? (
            <p className='rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700'>
              Nothing recorded for {formatCycle(cycle)}.
            </p>
          ) : (
            month.expenses.map((expense) => (
              <div
                key={expense.id}
                className='flex items-center justify-between gap-3 rounded-xl border border-neutral-300 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/40'
              >
                <div className='min-w-0'>
                  <p className='truncate text-sm font-medium'>
                    {expense.label}
                  </p>
                  <p className='text-xs text-neutral-500'>
                    {expense.category || 'Uncategorised'}
                  </p>
                </div>
                <div className='flex items-center gap-3'>
                  <span className='text-sm tabular-nums'>
                    {formatRupees(expense.amount)}
                  </span>
                  <button
                    type='button'
                    onClick={() => handleDelete(expense)}
                    disabled={isBusy}
                    aria-label={`Delete ${expense.label}`}
                    className='rounded p-1 text-neutral-500 transition-colors hover:text-red-500 disabled:opacity-50'
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MoneyShell>
  );
};

export default ExpenseTab;
