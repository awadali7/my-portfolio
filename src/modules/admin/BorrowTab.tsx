import { useRouter } from 'next/router';
import { FormEvent, useState } from 'react';
import { FiCheck, FiPlus, FiRotateCcw, FiTrash2, FiX } from 'react-icons/fi';

import { formatRupees } from '@/common/helpers/emi';
import type { AdminProfileProps } from '@/common/types/emi';
import type {
  BorrowingProps,
  BorrowingSummaryProps,
} from '@/common/types/money';

import CardPattern from './components/CardPattern';
import MoneyShell from './components/MoneyShell';

type BorrowTabProps = {
  admin: AdminProfileProps;
  initialData: BorrowingSummaryProps;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

/** Whole days from today to `iso` — negative once it has passed. */
const daysUntil = (iso: string) => {
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round(
    (startOfDay(new Date(iso)) - startOfDay(new Date())) / 86_400_000,
  );
};

const dueLabel = (borrowing: BorrowingProps) => {
  if (borrowing.repaidOn) return `Repaid ${formatDate(borrowing.repaidOn)}`;
  const days = daysUntil(borrowing.dueDate);
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days > 1) return `Due in ${days} days`;
  const late = Math.abs(days);
  return `${late} day${late === 1 ? '' : 's'} overdue`;
};

const todayValue = () => new Date().toISOString().slice(0, 10);

const BorrowTab = ({ admin, initialData }: BorrowTabProps) => {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [isAdding, setIsAdding] = useState(false);
  const [lender, setLender] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState(todayValue);
  const [dueDate, setDueDate] = useState('');
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

  /** Totals are computed server-side, so refetch rather than recomputing here. */
  const refresh = async () =>
    setData(
      (await call('/api/admin/borrowings', {
        method: 'GET',
      })) as BorrowingSummaryProps,
    );

  const reset = () => {
    setLender('');
    setAmount('');
    setStartDate(todayValue());
    setDueDate('');
    setError(null);
    setIsAdding(false);
  };

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = Number(amount);
    if (!lender.trim()) return setError('Who did you borrow from?');
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return setError('Amount must be a whole number of rupees');
    }
    if (!dueDate) return setError('Set a due date');
    if (dueDate < startDate) {
      return setError('Due date cannot be before the start date');
    }

    setIsBusy(true);
    setError(null);
    try {
      await call('/api/admin/borrowings', {
        method: 'POST',
        body: JSON.stringify({
          lender: lender.trim(),
          amount: Math.trunc(parsed),
          startDate,
          dueDate,
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

  const handleToggleRepaid = async (borrowing: BorrowingProps) => {
    setIsBusy(true);
    setError(null);
    try {
      await call(`/api/admin/borrowings/${borrowing.id}/repay`, {
        method: borrowing.repaidOn ? 'DELETE' : 'POST',
        body: JSON.stringify({}),
      });
      await refresh();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error ? toggleError.message : 'Could not update',
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async (borrowing: BorrowingProps) => {
    if (
      !window.confirm(
        `Delete the ₹${borrowing.amount} from ${borrowing.lender}?`,
      )
    ) {
      return;
    }
    setIsBusy(true);
    setError(null);
    try {
      await call(`/api/admin/borrowings/${borrowing.id}`, { method: 'DELETE' });
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
  const labelText = 'text-xs text-neutral-600 dark:text-neutral-400';

  return (
    <MoneyShell
      admin={admin}
      title='Borrow'
      description='Money borrowed from people — one sum, owed back by a date.'
      actions={
        <button
          type='button'
          onClick={() => setIsAdding(true)}
          className='flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-sm font-medium text-neutral-50 hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900'
        >
          <FiPlus size={14} /> Add
        </button>
      }
    >
      <div className='space-y-5'>
        <div className='grid grid-cols-2 gap-3 lg:grid-cols-3'>
          {[
            {
              label: 'Still owed',
              value: formatRupees(data.outstandingTotal),
              hint: `${data.outstandingCount} outstanding`,
              tone:
                data.outstandingTotal > 0
                  ? 'text-neutral-900 dark:text-neutral-100'
                  : 'text-emerald-600 dark:text-emerald-400',
            },
            {
              label: 'Overdue',
              value: String(data.overdueCount),
              hint: data.overdueCount > 0 ? 'Past the due date' : 'All on time',
              tone:
                data.overdueCount > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-emerald-600 dark:text-emerald-400',
            },
            {
              label: 'Repaid',
              value: formatRupees(data.repaidTotal),
              hint: 'Settled so far',
              tone: 'text-neutral-900 dark:text-neutral-100',
            },
          ].map((card) => (
            <div
              key={card.label}
              className='relative overflow-hidden rounded-xl border border-neutral-300 p-4 dark:border-neutral-800 dark:bg-neutral-900/40'
            >
              <CardPattern />
              <p className={labelText}>{card.label}</p>
              <p className={`mt-2 text-lg font-medium ${card.tone}`}>
                {card.value}
              </p>
              <p className='mt-0.5 text-xs text-neutral-500'>{card.hint}</p>
            </div>
          ))}
        </div>

        {isAdding && (
          <form
            onSubmit={handleAdd}
            className='relative space-y-3 overflow-hidden rounded-xl border border-neutral-300 p-4 dark:border-neutral-800 dark:bg-neutral-900/40'
          >
            <CardPattern />
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              <label className='block space-y-1.5'>
                <span className={labelText}>From</span>
                <input
                  value={lender}
                  onChange={(event) => setLender(event.target.value)}
                  placeholder='Rahul'
                  autoFocus
                  className={`w-full ${inputClass}`}
                />
              </label>
              <label className='block space-y-1.5'>
                <span className={labelText}>Amount (₹)</span>
                <input
                  type='number'
                  min={1}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder='25000'
                  className={`w-full ${inputClass}`}
                />
              </label>
              <label className='block space-y-1.5'>
                <span className={labelText}>Start date</span>
                <input
                  type='date'
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className={`w-full ${inputClass}`}
                />
              </label>
              <label className='block space-y-1.5'>
                <span className={labelText}>Due date</span>
                <input
                  type='date'
                  value={dueDate}
                  min={startDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className={`w-full ${inputClass}`}
                />
              </label>
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
                Add borrowing
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

        <div className='space-y-3'>
          {data.borrowings.length === 0 ? (
            <p className='rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700'>
              Nothing borrowed. Use Add to record money you owe someone.
            </p>
          ) : (
            data.borrowings.map((borrowing) => {
              const isOverdue =
                !borrowing.repaidOn && daysUntil(borrowing.dueDate) < 0;

              return (
                <div
                  key={borrowing.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    borrowing.repaidOn
                      ? 'border-neutral-200 opacity-70 dark:border-neutral-800'
                      : isOverdue
                        ? 'border-red-500/40'
                        : 'border-neutral-300 dark:border-neutral-800'
                  } dark:bg-neutral-900/40`}
                >
                  <div className='flex flex-wrap items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <h3 className='font-medium'>{borrowing.lender}</h3>
                        {borrowing.repaidOn && (
                          <span className='bg-emerald-500/15 rounded-full px-2 py-0.5 text-[11px] text-emerald-600 dark:text-emerald-400'>
                            Repaid
                          </span>
                        )}
                      </div>
                      <p className='mt-1 text-xs text-neutral-500'>
                        Taken {formatDate(borrowing.startDate)} · due{' '}
                        {formatDate(borrowing.dueDate)}
                      </p>
                      <p
                        className={`mt-2 text-xs ${
                          borrowing.repaidOn
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isOverdue
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-neutral-500'
                        }`}
                      >
                        {dueLabel(borrowing)}
                      </p>
                    </div>
                    <span className='text-base font-medium tabular-nums'>
                      {formatRupees(borrowing.amount)}
                    </span>
                  </div>

                  <div className='mt-4 flex items-center gap-2'>
                    <button
                      type='button'
                      onClick={() => handleToggleRepaid(borrowing)}
                      disabled={isBusy}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                        borrowing.repaidOn
                          ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {borrowing.repaidOn ? <FiRotateCcw /> : <FiCheck />}
                      {borrowing.repaidOn ? 'Undo' : 'Mark repaid'}
                    </button>
                    <button
                      type='button'
                      onClick={() => handleDelete(borrowing)}
                      disabled={isBusy}
                      aria-label={`Delete borrowing from ${borrowing.lender}`}
                      className='rounded-lg border border-neutral-300 p-1.5 text-neutral-600 transition-colors hover:text-red-500 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-400'
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </MoneyShell>
  );
};

export default BorrowTab;
