import { FiCheck, FiEdit2, FiRotateCcw, FiTrash2 } from 'react-icons/fi';

import {
  EMI_TYPE_LABELS,
  formatDueLabel,
  formatRupees,
} from '@/common/helpers/emi';
import type { EmiWithStatusProps } from '@/common/types/emi';

type EmiRowProps = {
  emi: EmiWithStatusProps;
  isBusy: boolean;
  onTogglePaid: (emi: EmiWithStatusProps) => void;
  onEdit: (emi: EmiWithStatusProps) => void;
  onDelete: (emi: EmiWithStatusProps) => void;
};

const EmiRow = ({
  emi,
  isBusy,
  onTogglePaid,
  onEdit,
  onDelete,
}: EmiRowProps) => {
  const isOverdue =
    !emi.isPaidThisCycle && emi.daysUntilDue != null && emi.daysUntilDue < 0;
  const isDueSoon =
    !emi.isPaidThisCycle &&
    emi.daysUntilDue != null &&
    emi.daysUntilDue >= 0 &&
    emi.daysUntilDue <= 3;

  const dueTone = emi.isPaidThisCycle
    ? 'text-emerald-600 dark:text-emerald-400'
    : isOverdue
      ? 'text-red-600 dark:text-red-400'
      : isDueSoon
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-neutral-500';

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        emi.isPaidThisCycle
          ? 'border-neutral-200 opacity-70 dark:border-neutral-800'
          : isOverdue
            ? 'border-red-500/40'
            : 'border-neutral-300 dark:border-neutral-800'
      } dark:bg-neutral-900/40`}
    >
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <h3 className='font-medium'>{emi.name}</h3>
            <span className='rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'>
              {EMI_TYPE_LABELS[emi.type]}
            </span>
            {emi.isClosed && (
              <span className='bg-emerald-500/15 rounded-full px-2 py-0.5 text-[11px] text-emerald-600 dark:text-emerald-400'>
                Closed
              </span>
            )}
          </div>

          <p className='mt-1 text-xs text-neutral-500'>
            {emi.category}
            {emi.payoffLabel ? ` · ${emi.payoffLabel}` : ''}
          </p>

          <div className='mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs'>
            <span className={dueTone}>
              {emi.isPaidThisCycle ? 'Paid this month' : formatDueLabel(emi)}
            </span>
            <span className='text-neutral-500'>{emi.progressLabel}</span>
            {emi.remainingPayout != null && emi.remainingPayout > 0 && (
              <span className='text-neutral-500'>
                {formatRupees(emi.remainingPayout)} to go
              </span>
            )}
          </div>

          {emi.progressPercent != null && (
            <div className='mt-2.5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800'>
              <div
                className='h-full rounded-full bg-emerald-500 transition-all duration-500'
                style={{ width: `${emi.progressPercent}%` }}
              />
            </div>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-base font-medium tabular-nums'>
            {formatRupees(emi.amount)}
          </span>
        </div>
      </div>

      <div className='mt-4 flex items-center gap-2'>
        <button
          type='button'
          onClick={() => onTogglePaid(emi)}
          disabled={isBusy}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
            emi.isPaidThisCycle
              ? 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {emi.isPaidThisCycle ? <FiRotateCcw /> : <FiCheck />}
          {emi.isPaidThisCycle ? 'Undo' : 'Mark paid'}
        </button>

        <button
          type='button'
          onClick={() => onEdit(emi)}
          disabled={isBusy}
          aria-label={`Edit ${emi.name}`}
          className='rounded-lg border border-neutral-300 p-1.5 text-neutral-600 transition-colors hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800'
        >
          <FiEdit2 size={14} />
        </button>

        <button
          type='button'
          onClick={() => onDelete(emi)}
          disabled={isBusy}
          aria-label={`Delete ${emi.name}`}
          className='rounded-lg border border-neutral-300 p-1.5 text-neutral-600 transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-400'
        >
          <FiTrash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default EmiRow;
