import Link from 'next/link';
import { useMemo } from 'react';
import { FiAlertCircle, FiArrowRight } from 'react-icons/fi';

import {
  formatCycle,
  formatDueLabel,
  formatRupees,
  sortForDisplay,
  summarise,
  withStatus,
} from '@/common/helpers/emi';
import type {
  AdminProfileProps,
  EmiProps,
  IncomeProps,
} from '@/common/types/emi';
import type {
  BorrowingSummaryProps,
  ExpenseMonthProps,
} from '@/common/types/money';

import CardPattern from './components/CardPattern';
import MoneyShell from './components/MoneyShell';
import MonthSwitcher from './components/MonthSwitcher';

type DashboardTabProps = {
  admin: AdminProfileProps;
  emis: EmiProps[];
  income: IncomeProps | null;
  expenses: ExpenseMonthProps;
  borrowings: BorrowingSummaryProps;
  cycle: string;
};

const DashboardTab = ({
  admin,
  emis,
  income,
  expenses,
  borrowings,
  cycle,
}: DashboardTabProps) => {
  const { summary, upcoming } = useMemo(() => {
    const decorated = emis
      .filter((emi) => !emi.archived)
      .map((emi) => withStatus(emi, cycle));
    return {
      summary: summarise(decorated, cycle),
      // What still needs paying, soonest first.
      upcoming: sortForDisplay(decorated)
        .filter((emi) => !emi.isPaidThisCycle && !emi.isNotStarted)
        .slice(0, 5),
    };
  }, [emis, cycle]);

  const totalIncome = income?.total ?? 0;
  const totalOut = summary.monthlyTotal + expenses.total;
  const leftover = totalIncome - totalOut;

  const cards = [
    {
      label: 'Income',
      value: formatRupees(totalIncome),
      hint: income
        ? `${formatRupees(income.permanentTotal)} recurring`
        : 'Not set',
      tone: 'text-neutral-900 dark:text-neutral-100',
    },
    {
      label: 'EMIs due',
      value: formatRupees(summary.monthlyTotal),
      hint: `${summary.paidCount} of ${summary.activeCount} paid`,
      tone: 'text-neutral-900 dark:text-neutral-100',
    },
    {
      label: 'Expenses',
      value: formatRupees(expenses.total),
      hint: `${expenses.expenses.length} recorded`,
      tone: 'text-neutral-900 dark:text-neutral-100',
    },
    {
      label: 'Borrowed',
      value: formatRupees(borrowings.outstandingTotal),
      hint:
        borrowings.overdueCount > 0
          ? `${borrowings.overdueCount} overdue`
          : `${borrowings.outstandingCount} outstanding`,
      tone:
        borrowings.overdueCount > 0
          ? 'text-red-600 dark:text-red-400'
          : 'text-neutral-900 dark:text-neutral-100',
    },
    {
      label: leftover < 0 ? 'Short by' : 'Left over',
      value: formatRupees(Math.abs(leftover)),
      hint: `after ${formatRupees(totalOut)} out`,
      tone:
        leftover < 0
          ? 'text-red-600 dark:text-red-400'
          : 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <MoneyShell
      admin={admin}
      title='Dashboard'
      description={`Everything for ${formatCycle(cycle)} in one place.`}
      cycle={cycle}
      actions={<MonthSwitcher cycle={cycle} />}
    >
      <div className='space-y-5'>
        <div className='grid grid-cols-2 gap-3 lg:grid-cols-5'>
          {cards.map((card) => (
            <div
              key={card.label}
              className='relative relative overflow-hidden overflow-hidden rounded-xl border border-neutral-300 p-4 dark:border-neutral-800 dark:bg-neutral-900/40'
            >
              <CardPattern />
              <p className='relative text-xs text-neutral-600 dark:text-neutral-400'>
                {card.label}
              </p>
              <p className={`mt-2 text-lg font-medium ${card.tone}`}>
                {card.value}
              </p>
              <p className='mt-0.5 text-xs text-neutral-500'>{card.hint}</p>
            </div>
          ))}
        </div>

        {summary.overdueCount > 0 && (
          <p className='flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500'>
            <FiAlertCircle size={15} />
            {summary.overdueCount} payment
            {summary.overdueCount === 1 ? ' is' : 's are'} overdue.
          </p>
        )}

        <div className='grid gap-4 lg:grid-cols-2'>
          <section className='relative overflow-hidden rounded-xl border border-neutral-300 p-4 dark:border-neutral-800 dark:bg-neutral-900/40'>
            <CardPattern />
            <div className='flex items-center justify-between'>
              <h2 className='text-sm font-medium'>Still to pay</h2>
              <Link
                href='/admin/emi'
                className='flex items-center gap-1 text-xs text-neutral-500 hover:underline'
              >
                All EMIs <FiArrowRight size={12} />
              </Link>
            </div>
            <ul className='mt-3 divide-y divide-neutral-200 dark:divide-neutral-800'>
              {upcoming.length === 0 ? (
                <li className='py-2 text-sm text-neutral-500'>
                  Everything settled for this month.
                </li>
              ) : (
                upcoming.map((emi) => (
                  <li
                    key={emi.id}
                    className='flex items-center justify-between gap-3 py-2'
                  >
                    <div className='min-w-0'>
                      <p className='truncate text-sm'>{emi.name}</p>
                      <p className='text-xs text-neutral-500'>
                        {formatDueLabel(emi)}
                      </p>
                    </div>
                    <span className='text-sm tabular-nums'>
                      {formatRupees(emi.amount)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className='relative overflow-hidden rounded-xl border border-neutral-300 p-4 dark:border-neutral-800 dark:bg-neutral-900/40'>
            <CardPattern />
            <div className='flex items-center justify-between'>
              <h2 className='text-sm font-medium'>Where it went</h2>
              <Link
                href='/admin/expense'
                className='flex items-center gap-1 text-xs text-neutral-500 hover:underline'
              >
                All expenses <FiArrowRight size={12} />
              </Link>
            </div>
            <ul className='mt-3 space-y-2'>
              {expenses.byCategory.length === 0 ? (
                <li className='text-sm text-neutral-500'>
                  No expenses recorded for {formatCycle(cycle)}.
                </li>
              ) : (
                expenses.byCategory.slice(0, 5).map((row) => (
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
                            expenses.total > 0
                              ? Math.round((row.amount / expenses.total) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </div>
    </MoneyShell>
  );
};

export default DashboardTab;
