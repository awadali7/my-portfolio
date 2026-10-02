import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiLayers,
} from 'react-icons/fi';

import { formatRupees } from '@/common/helpers/emi';
import type { EmiSummaryProps, IncomeProps } from '@/common/types/emi';

type SummaryCardsProps = {
  summary: EmiSummaryProps;
  income: IncomeProps | null;
};

const SummaryCards = ({ summary, income }: SummaryCardsProps) => {
  const totalIncome = income ? income.total : null;
  // Negative means the month's obligations exceed what comes in — worth
  // showing plainly rather than hiding behind a percentage.
  const leftover =
    totalIncome == null ? null : totalIncome - summary.monthlyTotal;

  const cards = [
    {
      label: 'Due this month',
      value: formatRupees(summary.monthlyTotal),
      // Upcoming ones are deliberately excluded from the total above, so say
      // so rather than leaving the count looking wrong.
      hint:
        summary.upcomingCount > 0
          ? `${summary.activeCount} active · ${summary.upcomingCount} upcoming`
          : `${summary.activeCount} active`,
      icon: <FiLayers />,
      tone: 'text-neutral-900 dark:text-neutral-100',
    },
    {
      label: 'Paid',
      value: formatRupees(summary.paidTotal),
      hint: `${summary.paidCount} of ${summary.activeCount} settled`,
      icon: <FiCheckCircle />,
      tone: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Still pending',
      value: formatRupees(summary.pendingTotal),
      hint:
        summary.overdueCount > 0
          ? `${summary.overdueCount} overdue`
          : 'On track',
      icon: summary.overdueCount > 0 ? <FiAlertCircle /> : <FiClock />,
      tone:
        summary.overdueCount > 0
          ? 'text-red-600 dark:text-red-400'
          : 'text-amber-600 dark:text-amber-400',
    },
    {
      label: leftover == null ? 'Total remaining' : 'Left after EMIs',
      value: formatRupees(leftover ?? summary.remainingPayout),
      hint:
        leftover == null
          ? 'Across all instalments'
          : `of ${formatRupees(totalIncome as number)} income`,
      icon: <FiLayers />,
      tone:
        leftover != null && leftover < 0
          ? 'text-red-600 dark:text-red-400'
          : 'text-neutral-900 dark:text-neutral-100',
    },
  ];

  return (
    <div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
      {cards.map((card) => (
        <div
          key={card.label}
          className='rounded-xl border border-neutral-300 p-4 dark:border-neutral-800 dark:bg-neutral-900/40'
        >
          <div className='flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400'>
            <span className={card.tone}>{card.icon}</span>
            {card.label}
          </div>
          <p className={`mt-2 text-lg font-medium ${card.tone}`}>
            {card.value}
          </p>
          <p className='mt-0.5 text-xs text-neutral-500'>{card.hint}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
