import type {
  EmiProps,
  EmiSummaryProps,
  EmiWithStatusProps,
} from '@/common/types/emi';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** "YYYY-MM" for the month a payment settles. */
export const toCycle = (date: Date = new Date()): string =>
  `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;

export const parseCycle = (cycle: string): { year: number; month: number } => {
  const [year, month] = cycle.split('-').map(Number);
  return { year, month: month - 1 };
};

const lastDayOfMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

/**
 * The due date inside a given cycle. A `dueDay` past the end of a short month
 * (31st in February) lands on that month's last day rather than spilling into
 * the next one, which is how the lenders actually bill.
 */
export const getDueDate = (emi: EmiProps, cycle: string): Date | null => {
  const { year, month } = parseCycle(cycle);
  const lastDay = lastDayOfMonth(year, month);

  if (emi.endOfMonth) return new Date(year, month, lastDay);
  if (emi.dueDay == null) return null;
  return new Date(year, month, Math.min(emi.dueDay, lastDay));
};

/** Whole days from today to `date` — negative once the date has passed. */
const daysUntil = (date: Date, today: Date): number => {
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((startOfDay(date) - startOfDay(today)) / MS_PER_DAY);
};

/**
 * How many instalments are still owed. Three tracking styles collapse to one
 * number here so the UI never has to branch on which fields are set:
 *   installmentsTotal -> total minus paid
 *   installmentsLeft  -> as stored
 *   neither           -> null (open-ended: rent, credit card)
 */
export const getInstallmentsRemaining = (emi: EmiProps): number | null => {
  if (emi.installmentsTotal != null) {
    return Math.max(emi.installmentsTotal - (emi.installmentsPaid ?? 0), 0);
  }
  if (emi.installmentsLeft != null) return Math.max(emi.installmentsLeft, 0);
  return null;
};

const getProgressLabel = (emi: EmiProps): string => {
  if (emi.installmentsTotal != null) {
    return `${emi.installmentsPaid ?? 0} / ${emi.installmentsTotal}`;
  }
  if (emi.installmentsLeft != null) {
    return emi.installmentsLeft === 1
      ? 'Last one left'
      : `${emi.installmentsLeft} left`;
  }
  return 'Monthly';
};

const getProgressPercent = (emi: EmiProps): number | null => {
  if (emi.installmentsTotal != null && emi.installmentsTotal > 0) {
    const paid = Math.min(emi.installmentsPaid ?? 0, emi.installmentsTotal);
    return Math.round((paid / emi.installmentsTotal) * 100);
  }
  return null;
};

const formatMonth = (cycle: string): string => {
  const { year, month } = parseCycle(cycle);
  return new Date(year, month, 1).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
};

/** True when the bill has not begun as of the cycle being viewed. */
export const isNotStartedIn = (emi: EmiProps, cycle: string): boolean =>
  emi.startCycle != null && cycle < emi.startCycle;

/**
 * Month the final instalment falls in, e.g. "Ends Aug 2027".
 *
 * Counts from the first cycle that will actually be billed — for a bill
 * starting later, that is its start cycle, not the month being viewed.
 * Otherwise a loan starting in three months would show a payoff three months
 * too early.
 */
const getPayoffLabel = (emi: EmiProps, cycle: string): string | null => {
  const remaining = getInstallmentsRemaining(emi);
  if (remaining == null) return null;
  if (remaining === 0) return 'Closed';

  const firstBilled =
    emi.startCycle && cycle < emi.startCycle ? emi.startCycle : cycle;
  const { year, month } = parseCycle(firstBilled);
  // The remaining count includes that cycle's payment, hence `remaining - 1`.
  return `Ends ${formatMonth(toCycle(new Date(year, month + remaining - 1, 1)))}`;
};

export const withStatus = (
  emi: EmiProps,
  cycle: string,
  today: Date = new Date(),
): EmiWithStatusProps => {
  const remaining = getInstallmentsRemaining(emi);
  const isNotStarted = isNotStartedIn(emi, cycle);
  const dueDate = getDueDate(emi, cycle);

  return {
    ...emi,
    progressLabel: getProgressLabel(emi),
    progressPercent: getProgressPercent(emi),
    installmentsRemaining: remaining,
    isPaidThisCycle: emi.lastPaidCycle === cycle,
    isClosed: remaining === 0,
    isNotStarted,
    startLabel:
      isNotStarted && emi.startCycle
        ? `Starts ${formatMonth(emi.startCycle)}`
        : null,
    // A bill that has not started is not due in this cycle, so it must not
    // read as "overdue" — clearing the date is what keeps it out of the
    // overdue count and the amber/red styling.
    dueDate: isNotStarted || !dueDate ? null : dueDate.toISOString(),
    daysUntilDue: isNotStarted || !dueDate ? null : daysUntil(dueDate, today),
    payoffLabel: getPayoffLabel(emi, cycle),
    remainingPayout: remaining == null ? null : remaining * emi.amount,
  };
};

/**
 * Sort order for the console: unpaid before paid, then by due date, then by
 * the ones with no due date at all. This puts "what do I owe next" on top.
 */
export const sortForDisplay = (
  emis: EmiWithStatusProps[],
): EmiWithStatusProps[] =>
  [...emis].sort((a, b) => {
    // Nothing owed this month sinks: not-yet-started last of all, then paid.
    if (a.isNotStarted !== b.isNotStarted) return a.isNotStarted ? 1 : -1;
    if (a.isPaidThisCycle !== b.isPaidThisCycle) {
      return a.isPaidThisCycle ? 1 : -1;
    }
    const aDay = a.dueDate ? new Date(a.dueDate).getDate() : 99;
    const bDay = b.dueDate ? new Date(b.dueDate).getDate() : 99;
    if (aDay !== bDay) return aDay - bDay;
    return a.name.localeCompare(b.name);
  });

export const summarise = (
  emis: EmiWithStatusProps[],
  cycle: string,
): EmiSummaryProps => {
  const live = emis.filter((emi) => !emi.archived && !emi.isClosed);
  // Billed in THIS cycle: what the month's totals are about. A bill starting
  // later is still owed overall, so it stays in remainingPayout below.
  const active = live.filter((emi) => !emi.isNotStarted);
  const paid = active.filter((emi) => emi.isPaidThisCycle);

  return {
    cycle,
    monthlyTotal: active.reduce((sum, emi) => sum + emi.amount, 0),
    paidTotal: paid.reduce((sum, emi) => sum + emi.amount, 0),
    pendingTotal: active
      .filter((emi) => !emi.isPaidThisCycle)
      .reduce((sum, emi) => sum + emi.amount, 0),
    activeCount: active.length,
    paidCount: paid.length,
    upcomingCount: live.filter((emi) => emi.isNotStarted).length,
    overdueCount: active.filter(
      (emi) =>
        !emi.isPaidThisCycle &&
        emi.daysUntilDue != null &&
        emi.daysUntilDue < 0,
    ).length,
    remainingPayout: live.reduce(
      (sum, emi) => sum + (emi.remainingPayout ?? 0),
      0,
    ),
  };
};

export const formatRupees = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const formatCycle = (cycle: string): string => {
  const { year, month } = parseCycle(cycle);
  return new Date(year, month, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
};

/** "Due in 3 days" / "Due today" / "5 days overdue". */
export const formatDueLabel = (emi: EmiWithStatusProps): string => {
  if (emi.daysUntilDue == null) return 'No fixed date';
  if (emi.daysUntilDue === 0) return 'Due today';
  if (emi.daysUntilDue === 1) return 'Due tomorrow';
  if (emi.daysUntilDue > 1) return `Due in ${emi.daysUntilDue} days`;
  const overdue = Math.abs(emi.daysUntilDue);
  return `${overdue} day${overdue === 1 ? '' : 's'} overdue`;
};

export const EMI_TYPE_LABELS: Record<EmiProps['type'], string> = {
  emi: 'EMI',
  chitty: 'Chitty',
  recurring: 'Recurring',
  credit_card: 'Credit card',
};

export const shiftCycle = (cycle: string, delta: number): string => {
  const { year, month } = parseCycle(cycle);
  return toCycle(new Date(year, month + delta, 1));
};
