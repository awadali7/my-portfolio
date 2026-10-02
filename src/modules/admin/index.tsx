import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
  FiPlus,
} from 'react-icons/fi';

import {
  formatCycle,
  shiftCycle,
  sortForDisplay,
  summarise,
  toCycle,
  withStatus,
} from '@/common/helpers/emi';
import type {
  AdminProfileProps,
  EmiProps,
  EmiWithStatusProps,
  IncomeProps,
  IncomeSourceProps,
} from '@/common/types/emi';

import EmiFormModal from './components/EmiFormModal';
import EmiRow from './components/EmiRow';
import IncomePanel from './components/IncomePanel';
import SummaryCards from './components/SummaryCards';

type EmiTrackerProps = {
  admin: AdminProfileProps;
  initialEmis: EmiProps[];
  initialIncome: IncomeProps | null;
};

const EmiTracker = ({ admin, initialEmis, initialIncome }: EmiTrackerProps) => {
  const router = useRouter();
  const [emis, setEmis] = useState<EmiProps[]>(initialEmis);
  const [income, setIncome] = useState<IncomeProps | null>(initialIncome);
  const [cycle, setCycle] = useState(() => toCycle());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EmiProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isCurrentCycle = cycle === toCycle();

  const { rows, summary } = useMemo(() => {
    const decorated = emis
      .filter((emi) => !emi.archived)
      .map((emi) => withStatus(emi, cycle));
    return {
      rows: sortForDisplay(decorated),
      summary: summarise(decorated, cycle),
    };
  }, [emis, cycle]);

  /** Replace one EMI in place, keeping list order stable. */
  const replaceEmi = (updated: EmiProps) =>
    setEmis((previous) =>
      previous.some((emi) => emi.id === updated.id)
        ? previous.map((emi) => (emi.id === updated.id ? updated : emi))
        : [...previous, updated],
    );

  const call = useCallback(
    async (url: string, init: RequestInit) => {
      const response = await fetch(url, {
        headers: { 'content-type': 'application/json' },
        ...init,
      });
      if (response.status === 401) {
        // Session expired mid-use — bounce to the login page rather than
        // leaving the console in a half-broken state.
        await router.replace('/admin/login');
        throw new Error('Session expired');
      }
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || `Request failed (${response.status})`);
      }
      return response.status === 204 ? null : await response.json();
    },
    [router],
  );

  // Income is per-month, so switching the cycle has to refetch it. The initial
  // month already came from the server, so this only fires on a real change.
  useEffect(() => {
    if (cycle === initialIncome?.cycle) {
      setIncome(initialIncome);
      return;
    }
    let cancelled = false;
    call(`/api/admin/income?cycle=${cycle}`, { method: 'GET' })
      .then((data) => {
        if (!cancelled) setIncome(data as IncomeProps);
      })
      .catch(() => {
        if (!cancelled) setIncome(null);
      });
    return () => {
      cancelled = true;
    };
  }, [cycle, initialIncome, call]);

  const refreshIncome = async () => {
    setIncome(
      (await call(`/api/admin/income?cycle=${cycle}`, {
        method: 'GET',
      })) as IncomeProps,
    );
  };

  const handleAddIncome = async (values: {
    label: string;
    amount: number;
    cycle: string | null;
  }) => {
    setBusyId('income');
    try {
      await call('/api/admin/income', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      await refreshIncome();
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteIncome = async (source: IncomeSourceProps) => {
    if (!window.confirm(`Remove "${source.label}"?`)) return;
    setBusyId('income');
    setError(null);
    try {
      await call(`/api/admin/income/${source.id}`, { method: 'DELETE' });
      await refreshIncome();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Could not remove',
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleTogglePaid = async (emi: EmiWithStatusProps) => {
    setBusyId(emi.id);
    setError(null);
    try {
      const updated = await call(`/api/admin/emis/${emi.id}/pay`, {
        method: emi.isPaidThisCycle ? 'DELETE' : 'POST',
        body: JSON.stringify({ cycle }),
      });
      replaceEmi(updated);
    } catch (toggleError) {
      setError(
        toggleError instanceof Error ? toggleError.message : 'Could not update',
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleSubmit = async (
    payload: Partial<EmiProps>,
    id: string | null,
  ) => {
    const updated = await call(
      id ? `/api/admin/emis/${id}` : '/api/admin/emis',
      { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) },
    );
    replaceEmi(updated);
  };

  const handleDelete = async (emi: EmiWithStatusProps) => {
    if (!window.confirm(`Delete "${emi.name}"? This cannot be undone.`)) return;
    setBusyId(emi.id);
    setError(null);
    try {
      await call(`/api/admin/emis/${emi.id}`, { method: 'DELETE' });
      setEmis((previous) => previous.filter((item) => item.id !== emi.id));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Could not delete',
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    await router.replace('/admin/login');
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-medium'>EMI Tracker</h1>
          <p className='text-sm text-neutral-600 dark:text-neutral-400'>
            Signed in as {admin.username}
          </p>
        </div>
        <button
          type='button'
          onClick={handleLogout}
          className='flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800'
        >
          <FiLogOut size={14} /> Sign out
        </button>
      </div>

      <div className='flex flex-wrap items-center justify-between gap-3 border-y border-dashed border-neutral-300 py-3 dark:border-neutral-700'>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={() => setCycle(shiftCycle(cycle, -1))}
            aria-label='Previous month'
            className='rounded-lg border border-neutral-300 p-1.5 dark:border-neutral-700'
          >
            <FiChevronLeft size={14} />
          </button>
          <span className='min-w-[9rem] text-center text-sm font-medium'>
            {formatCycle(cycle)}
          </span>
          <button
            type='button'
            onClick={() => setCycle(shiftCycle(cycle, 1))}
            aria-label='Next month'
            className='rounded-lg border border-neutral-300 p-1.5 dark:border-neutral-700'
          >
            <FiChevronRight size={14} />
          </button>
          {!isCurrentCycle && (
            <button
              type='button'
              onClick={() => setCycle(toCycle())}
              className='text-xs text-neutral-500 underline underline-offset-2'
            >
              Today
            </button>
          )}
        </div>

        <button
          type='button'
          onClick={() => {
            setEditing(null);
            setIsModalOpen(true);
          }}
          className='flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-sm font-medium text-neutral-50 hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900'
        >
          <FiPlus size={14} /> Add
        </button>
      </div>

      <SummaryCards summary={summary} income={income} />

      <IncomePanel
        income={income}
        cycle={cycle}
        isBusy={busyId === 'income'}
        onAdd={handleAddIncome}
        onDelete={handleDeleteIncome}
      />

      {error && (
        <p
          role='alert'
          className='rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500'
        >
          {error}
        </p>
      )}

      <div className='space-y-3'>
        {rows.length === 0 ? (
          <p className='rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700'>
            Nothing tracked yet. Use Add to create your first obligation.
          </p>
        ) : (
          rows.map((emi) => (
            <EmiRow
              key={emi.id}
              emi={emi}
              isBusy={busyId === emi.id}
              onTogglePaid={handleTogglePaid}
              onEdit={(selected) => {
                setEditing(selected);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <EmiFormModal
        isOpen={isModalOpen}
        emi={editing}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default EmiTracker;
