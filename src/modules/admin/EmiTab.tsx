import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { FiPlus } from 'react-icons/fi';

import { sortForDisplay, summarise, withStatus } from '@/common/helpers/emi';
import type {
  AdminProfileProps,
  EmiProps,
  EmiWithStatusProps,
  IncomeProps,
} from '@/common/types/emi';
import type { CategoryProps } from '@/common/types/money';

import EmiFormModal from './components/EmiFormModal';
import EmiRow from './components/EmiRow';
import MoneyShell from './components/MoneyShell';
import MonthSwitcher from './components/MonthSwitcher';
import SummaryCards from './components/SummaryCards';

type EmiTabProps = {
  admin: AdminProfileProps;
  initialEmis: EmiProps[];
  income: IncomeProps | null;
  categories: CategoryProps[];
  cycle: string;
};

const EmiTab = ({
  admin,
  initialEmis,
  income,
  categories,
  cycle,
}: EmiTabProps) => {
  const router = useRouter();
  const [emis, setEmis] = useState<EmiProps[]>(initialEmis);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EmiProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { rows, summary } = useMemo(() => {
    const decorated = emis
      .filter((emi) => !emi.archived)
      .map((emi) => withStatus(emi, cycle));
    return {
      rows: sortForDisplay(decorated),
      summary: summarise(decorated, cycle),
    };
  }, [emis, cycle]);

  const replaceEmi = (updated: EmiProps) =>
    setEmis((previous) =>
      previous.some((emi) => emi.id === updated.id)
        ? previous.map((emi) => (emi.id === updated.id ? updated : emi))
        : [...previous, updated],
    );

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

  return (
    <MoneyShell
      admin={admin}
      title='EMI'
      description='Recurring obligations — loans, chits, rent and cards.'
      cycle={cycle}
      actions={
        <div className='flex flex-wrap items-center gap-3'>
          <MonthSwitcher cycle={cycle} />
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
      }
    >
      <div className='space-y-5'>
        <SummaryCards summary={summary} income={income} />

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
      </div>

      <EmiFormModal
        isOpen={isModalOpen}
        emi={editing}
        categories={categories}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </MoneyShell>
  );
};

export default EmiTab;
