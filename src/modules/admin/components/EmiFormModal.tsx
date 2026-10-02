import { FormEvent, useEffect, useState } from 'react';

import ModalWrapper from '@/common/components/elements/ModalWrapper';
import { EMI_TYPE_LABELS } from '@/common/helpers/emi';
import type { EmiProps, EmiType } from '@/common/types/emi';

type EmiFormModalProps = {
  isOpen: boolean;
  /** null = creating a new one. */
  emi: EmiProps | null;
  onClose: () => void;
  onSubmit: (payload: Partial<EmiProps>, id: string | null) => Promise<void>;
};

type FormState = {
  name: string;
  category: string;
  type: EmiType;
  amount: string;
  dueDay: string;
  endOfMonth: boolean;
  /** Empty = this tracking style isn't in use. */
  installmentsPaid: string;
  installmentsTotal: string;
  /** "YYYY-MM" from a month input. Empty = already running. */
  startCycle: string;
};

const EMPTY: FormState = {
  name: '',
  category: '',
  type: 'emi',
  amount: '',
  dueDay: '',
  endOfMonth: false,
  installmentsPaid: '',
  installmentsTotal: '',
  startCycle: '',
};

const toFormState = (emi: EmiProps | null): FormState =>
  emi
    ? {
        name: emi.name,
        category: emi.category,
        type: emi.type,
        amount: String(emi.amount),
        dueDay: emi.dueDay == null ? '' : String(emi.dueDay),
        endOfMonth: emi.endOfMonth,
        installmentsPaid:
          emi.installmentsPaid == null ? '' : String(emi.installmentsPaid),
        installmentsTotal:
          emi.installmentsTotal == null ? '' : String(emi.installmentsTotal),
        startCycle: emi.startCycle ?? '',
      }
    : EMPTY;

/** '' -> null so the backend stores "not tracked this way" rather than 0. */
const toNullableInt = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
};

const EmiFormModal = ({
  isOpen,
  emi,
  onClose,
  onSubmit,
}: EmiFormModalProps) => {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Reset whenever the modal opens so a previous edit never bleeds into the
  // next one (including "edit A, close, add new").
  useEffect(() => {
    if (isOpen) {
      setForm(toFormState(emi));
      setError(null);
    }
  }, [isOpen, emi]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const amount = Number(form.amount);
    if (!form.name.trim()) return setError('Name is required');
    if (!Number.isFinite(amount) || amount < 0) {
      return setError('Amount must be a whole number of rupees');
    }

    const dueDay = toNullableInt(form.dueDay);
    if (dueDay != null && (dueDay < 1 || dueDay > 31)) {
      return setError('Due day must be between 1 and 31');
    }

    setIsSaving(true);
    try {
      await onSubmit(
        {
          name: form.name.trim(),
          category: form.category.trim() || EMI_TYPE_LABELS[form.type],
          type: form.type,
          amount: Math.trunc(amount),
          dueDay: form.endOfMonth ? null : dueDay,
          endOfMonth: form.endOfMonth,
          installmentsPaid: toNullableInt(form.installmentsPaid),
          installmentsTotal: toNullableInt(form.installmentsTotal),
          // Pocketly-style bills are still stored as "N left"; the form no
          // longer edits that, so carry the stored value through rather than
          // clearing it on an unrelated edit. Setting a total switches the
          // bill to paid/total tracking, so the countdown is dropped then.
          installmentsLeft:
            toNullableInt(form.installmentsTotal) != null
              ? null
              : emi?.installmentsLeft ?? null,
          startCycle: form.startCycle.trim() || null,
          // Preserved on edit so saving a field change doesn't silently
          // un-pay the current month.
          lastPaidCycle: emi?.lastPaidCycle ?? null,
          archived: emi?.archived ?? false,
        },
        emi?.id ?? null,
      );
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Could not save',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700';
  const labelClass = 'block space-y-1.5';
  const labelText = 'text-xs text-neutral-600 dark:text-neutral-400';

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        className='mx-auto max-w-lg space-y-4 rounded-xl border border-neutral-300 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900'
      >
        <h2 className='text-lg font-medium'>
          {emi ? 'Edit obligation' : 'Add obligation'}
        </h2>

        <label className={labelClass}>
          <span className={labelText}>Name</span>
          <input
            className={inputClass}
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder='TVS Credit – Refrigerator'
            required
          />
        </label>

        <div className='grid grid-cols-2 gap-3'>
          <label className={labelClass}>
            <span className={labelText}>Category</span>
            <input
              className={inputClass}
              value={form.category}
              onChange={(event) => update('category', event.target.value)}
              placeholder='Appliance EMI'
            />
          </label>

          <label className={labelClass}>
            <span className={labelText}>Type</span>
            <select
              className={inputClass}
              value={form.type}
              onChange={(event) =>
                update('type', event.target.value as EmiType)
              }
            >
              {Object.entries(EMI_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <label className={labelClass}>
            <span className={labelText}>Amount (₹)</span>
            <input
              className={inputClass}
              type='number'
              min={0}
              value={form.amount}
              onChange={(event) => update('amount', event.target.value)}
              placeholder='1821'
              required
            />
          </label>

          <label className={labelClass}>
            <span className={labelText}>Due day</span>
            <input
              className={inputClass}
              type='number'
              min={1}
              max={31}
              value={form.dueDay}
              onChange={(event) => update('dueDay', event.target.value)}
              disabled={form.endOfMonth}
              placeholder='25'
            />
          </label>
        </div>

        <label className='flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400'>
          <input
            type='checkbox'
            checked={form.endOfMonth}
            onChange={(event) => update('endOfMonth', event.target.checked)}
          />
          Due at end of month
        </label>

        <label className={labelClass}>
          <span className={labelText}>
            Starts (leave blank if it is already running)
          </span>
          <input
            className={inputClass}
            type='month'
            value={form.startCycle}
            onChange={(event) => update('startCycle', event.target.value)}
          />
        </label>

        <fieldset className='space-y-3 rounded-lg border border-neutral-300 p-3 dark:border-neutral-800'>
          <legend className='px-1 text-xs text-neutral-600 dark:text-neutral-400'>
            Progress — leave blank for open-ended bills like rent
          </legend>

          <div className='grid grid-cols-2 gap-3'>
            <label className={labelClass}>
              <span className={labelText}>Paid</span>
              <input
                className={inputClass}
                type='number'
                min={0}
                value={form.installmentsPaid}
                onChange={(event) =>
                  update('installmentsPaid', event.target.value)
                }
                placeholder='1'
              />
            </label>
            <label className={labelClass}>
              <span className={labelText}>Total</span>
              <input
                className={inputClass}
                type='number'
                min={0}
                value={form.installmentsTotal}
                onChange={(event) =>
                  update('installmentsTotal', event.target.value)
                }
                placeholder='12'
              />
            </label>
          </div>
        </fieldset>

        {error && (
          <p
            role='alert'
            className='rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500'
          >
            {error}
          </p>
        )}

        <div className='flex justify-end gap-2 pt-1'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={isSaving}
            className='rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-50 hover:bg-neutral-700 disabled:opacity-60 dark:bg-neutral-100 dark:text-neutral-900'
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default EmiFormModal;
