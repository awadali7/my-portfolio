import { useRouter } from 'next/router';
import { useState } from 'react';

import { formatCycle, formatRupees } from '@/common/helpers/emi';
import type {
  AdminProfileProps,
  IncomeProps,
  IncomeSourceProps,
} from '@/common/types/emi';

import CardPattern from './components/CardPattern';
import IncomePanel from './components/IncomePanel';
import MoneyShell from './components/MoneyShell';
import MonthSwitcher from './components/MonthSwitcher';

type IncomeTabProps = {
  admin: AdminProfileProps;
  initialIncome: IncomeProps | null;
  cycle: string;
};

const IncomeTab = ({ admin, initialIncome, cycle }: IncomeTabProps) => {
  const router = useRouter();
  const [income, setIncome] = useState<IncomeProps | null>(initialIncome);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const refresh = async () =>
    setIncome(
      (await call(`/api/admin/income?cycle=${cycle}`, {
        method: 'GET',
      })) as IncomeProps,
    );

  const handleAdd = async (values: {
    label: string;
    amount: number;
    cycle: string | null;
  }) => {
    setIsBusy(true);
    try {
      await call('/api/admin/income', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      await refresh();
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async (source: IncomeSourceProps) => {
    if (!window.confirm(`Remove "${source.label}"?`)) return;
    setIsBusy(true);
    setError(null);
    try {
      await call(`/api/admin/income/${source.id}`, { method: 'DELETE' });
      await refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Could not remove',
      );
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <MoneyShell
      admin={admin}
      title='Income'
      description='Permanent sources count every month; one-offs count once.'
      cycle={cycle}
      actions={<MonthSwitcher cycle={cycle} />}
    >
      <div className='space-y-5'>
        <div className='grid gap-3 sm:grid-cols-3'>
          {[
            {
              label: `Total for ${formatCycle(cycle)}`,
              value: income ? formatRupees(income.total) : '—',
            },
            {
              label: 'Every month',
              value: income ? formatRupees(income.permanentTotal) : '—',
            },
            {
              label: 'This month only',
              value: income ? formatRupees(income.monthlyTotal) : '—',
            },
          ].map((card) => (
            <div
              key={card.label}
              className='relative overflow-hidden rounded-xl border border-neutral-300 p-4 dark:border-neutral-800 dark:bg-neutral-900/40'
            >
              <CardPattern />
              <p className='text-xs text-neutral-600 dark:text-neutral-400'>
                {card.label}
              </p>
              <p className='mt-2 text-lg font-medium'>{card.value}</p>
            </div>
          ))}
        </div>

        {error && (
          <p
            role='alert'
            className='rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500'
          >
            {error}
          </p>
        )}

        <IncomePanel
          income={income}
          cycle={cycle}
          isBusy={isBusy}
          onAdd={handleAdd}
          onDelete={handleDelete}
        />
      </div>
    </MoneyShell>
  );
};

export default IncomeTab;
