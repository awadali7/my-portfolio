/**
 * Mirrors the `Bill` model served by awad-backend (`GET /bills`). The backend
 * calls these "bills" because it also tracks rent and a credit card; the admin
 * console calls them EMIs because that is what the household calls them. The
 * single translation point is `src/services/emi.ts`.
 */
export type EmiType = 'emi' | 'chitty' | 'recurring' | 'credit_card';

export type EmiProps = {
  id: string;
  name: string;
  category: string;
  type: EmiType;
  /** Whole rupees — every obligation tracked here bills in whole rupees. */
  amount: number;
  /** Day of month (1-31), clamped to the month's last day. Null = not set. */
  dueDay: number | null;
  /** Due on the last calendar day of the month (overrides dueDay). */
  endOfMonth: boolean;
  installmentsPaid: number | null;
  installmentsTotal: number | null;
  /** Count-down style chits (e.g. Pocketly) use this instead of paid/total. */
  installmentsLeft: number | null;
  /** "YYYY-MM" of the cycle last marked paid. */
  lastPaidCycle: string | null;
  archived: boolean;
};

/** Everything the UI needs that is derived rather than stored. */
export type EmiWithStatusProps = EmiProps & {
  /** "1 / 12", "2 left", or "Monthly" for open-ended items. */
  progressLabel: string;
  /** 0-100, or null when the item has no fixed end. */
  progressPercent: number | null;
  installmentsRemaining: number | null;
  isPaidThisCycle: boolean;
  /** Fully paid off — no instalments remain. */
  isClosed: boolean;
  /** ISO date of this cycle's due date, or null when no due day is set. */
  dueDate: string | null;
  daysUntilDue: number | null;
  /** "Ends Aug 2027", or null when open-ended. */
  payoffLabel: string | null;
  /** Total still owed across remaining instalments, or null when open-ended. */
  remainingPayout: number | null;
};

export type EmiSummaryProps = {
  /** "YYYY-MM" the summary covers. */
  cycle: string;
  monthlyTotal: number;
  paidTotal: number;
  pendingTotal: number;
  activeCount: number;
  paidCount: number;
  overdueCount: number;
  /** Sum of every remaining instalment on closed-ended items. */
  remainingPayout: number;
};

export type IncomeProps = {
  userSalary: number;
  spouseSalary: number;
};

export type EmiFormValues = {
  name: string;
  category: string;
  type: EmiType;
  amount: number | string;
  dueDay: number | string;
  endOfMonth: boolean;
  installmentsPaid: number | string;
  installmentsTotal: number | string;
  installmentsLeft: number | string;
};

export type AdminProfileProps = {
  id: string;
  username: string;
  name: string | null;
  lastLoginAt: string | null;
};
