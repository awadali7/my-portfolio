import { FormEvent, useState } from 'react';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';

import { formatCycle, formatRupees } from '@/common/helpers/emi';
import type { IncomeProps, IncomeSourceProps } from '@/common/types/emi';

import CardPattern from './CardPattern';

type IncomePanelProps = {
  income: IncomeProps | null;
  cycle: string;
  isBusy: boolean;
  onAdd: (values: {
    label: string;
    amount: number;
    cycle: string | null;
  }) => Promise<void>;
  onDelete: (source: IncomeSourceProps) => Promise<void>;
};

const IncomePanel = ({
  income,
  cycle,
  isBusy,
  onAdd,
  onDelete,
}: IncomePanelProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setLabel('');
    setAmount('');
    setIsPermanent(false);
    setError(null);
    setIsAdding(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = Number(amount);
    if (!label.trim()) return setError('Give it a name');
    if (!Number.isFinite(parsed) || parsed < 0) {
      return setError('Amount must be a whole number of rupees');
    }

    setError(null);
    try {
      await onAdd({
        label: label.trim(),
        amount: Math.trunc(parsed),
        // Permanent income is stored with no cycle, so it counts every month.
        cycle: isPermanent ? null : cycle,
      });
      reset();
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Could not add');
    }
  };

  if (!income) {
    return (
      <div className='rounded-xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700'>
        Income is unavailable right now.
      </div>
    );
  }

  const renderRow = (source: IncomeSourceProps) => (
    <li
      key={source.id}
      className='flex items-center justify-between gap-3 py-1.5'
    >
      <span className='min-w-0 flex-1 truncate text-sm'>{source.label}</span>
      <span className='text-sm tabular-nums'>
        {formatRupees(source.amount)}
      </span>
      <button
        type='button'
        onClick={() => onDelete(source)}
        disabled={isBusy}
        aria-label={`Remove ${source.label}`}
        className='rounded p-1 text-neutral-500 transition-colors hover:text-red-500 disabled:opacity-50'
      >
        <FiTrash2 size={13} />
      </button>
    </li>
  );

  return (
    <div className='relative overflow-hidden rounded-xl border border-neutral-300 p-4 dark:border-neutral-800 dark:bg-neutral-900/40'>
      <CardPattern />
      <div className='flex items-center justify-between gap-3'>
        <h2 className='text-sm font-medium'>Income</h2>
        <span className='text-sm font-medium tabular-nums'>
          {formatRupees(income.total)}
        </span>
      </div>

      <div className='mt-3 grid gap-4 sm:grid-cols-2'>
        <div>
          <p className='text-xs uppercase tracking-wide text-neutral-500'>
            Every month
          </p>
          <ul className='mt-1 divide-y divide-neutral-200 dark:divide-neutral-800'>
            {income.permanent.length === 0 ? (
              <li className='py-1.5 text-sm text-neutral-500'>None yet</li>
            ) : (
              income.permanent.map(renderRow)
            )}
          </ul>
        </div>

        <div>
          <p className='text-xs uppercase tracking-wide text-neutral-500'>
            {formatCycle(cycle)} only
          </p>
          <ul className='mt-1 divide-y divide-neutral-200 dark:divide-neutral-800'>
            {income.monthly.length === 0 ? (
              <li className='py-1.5 text-sm text-neutral-500'>
                None this month
              </li>
            ) : (
              income.monthly.map(renderRow)
            )}
          </ul>
        </div>
      </div>

      {isAdding ? (
        <form
          onSubmit={handleSubmit}
          className='mt-4 space-y-3 border-t border-dashed border-neutral-300 pt-3 dark:border-neutral-700'
        >
          <div className='flex flex-wrap gap-2'>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder='Diwali bonus'
              autoFocus
              className='min-w-0 flex-1 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700'
            />
            <input
              type='number'
              min={0}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder='15000'
              className='w-32 rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700'
            />
          </div>

          <label className='flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400'>
            <input
              type='checkbox'
              checked={isPermanent}
              onChange={(event) => setIsPermanent(event.target.checked)}
            />
            Repeats every month (otherwise counts only towards{' '}
            {formatCycle(cycle)})
          </label>

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
              Add
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
      ) : (
        <button
          type='button'
          onClick={() => setIsAdding(true)}
          className='mt-3 flex items-center gap-1.5 text-xs text-neutral-600 underline-offset-2 hover:underline dark:text-neutral-400'
        >
          <FiPlus size={13} /> Add income
        </button>
      )}
    </div>
  );
};

export default IncomePanel;
