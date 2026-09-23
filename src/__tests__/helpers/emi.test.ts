import {
  formatDueLabel,
  formatRupees,
  getDueDate,
  getInstallmentsRemaining,
  shiftCycle,
  sortForDisplay,
  summarise,
  toCycle,
  withStatus,
} from '@/common/helpers/emi';
import type { EmiProps } from '@/common/types/emi';

const emi = (overrides: Partial<EmiProps> = {}): EmiProps => ({
  id: 'emi-1',
  name: 'Test EMI',
  category: 'Test',
  type: 'emi',
  amount: 1000,
  dueDay: 15,
  endOfMonth: false,
  installmentsPaid: null,
  installmentsTotal: null,
  installmentsLeft: null,
  lastPaidCycle: null,
  archived: false,
  ...overrides,
});

describe('getDueDate', () => {
  it('uses the given day of the month', () => {
    expect(getDueDate(emi({ dueDay: 15 }), '2026-09')?.getDate()).toBe(15);
  });

  it('clamps a 31st due day to a short month rather than spilling over', () => {
    const due = getDueDate(emi({ dueDay: 31 }), '2026-02');
    expect(due?.getMonth()).toBe(1); // still February
    expect(due?.getDate()).toBe(28);
  });

  it('resolves endOfMonth to the real last day', () => {
    expect(
      getDueDate(emi({ dueDay: null, endOfMonth: true }), '2026-02')?.getDate(),
    ).toBe(28);
    expect(
      getDueDate(emi({ dueDay: null, endOfMonth: true }), '2026-09')?.getDate(),
    ).toBe(30);
  });

  it('lets endOfMonth win over a dueDay', () => {
    expect(
      getDueDate(emi({ dueDay: 5, endOfMonth: true }), '2026-09')?.getDate(),
    ).toBe(30);
  });

  it('returns null when nothing is set', () => {
    expect(getDueDate(emi({ dueDay: null }), '2026-09')).toBeNull();
  });
});

describe('getInstallmentsRemaining', () => {
  it('derives it from paid/total', () => {
    expect(
      getInstallmentsRemaining(
        emi({ installmentsPaid: 1, installmentsTotal: 12 }),
      ),
    ).toBe(11);
  });

  it('reads a count-down chit directly', () => {
    expect(getInstallmentsRemaining(emi({ installmentsLeft: 2 }))).toBe(2);
  });

  it('is null for open-ended obligations', () => {
    expect(getInstallmentsRemaining(emi())).toBeNull();
  });

  it('never goes negative when paid overshoots total', () => {
    expect(
      getInstallmentsRemaining(
        emi({ installmentsPaid: 13, installmentsTotal: 12 }),
      ),
    ).toBe(0);
  });
});

describe('withStatus', () => {
  const today = new Date(2026, 8, 22); // 22 Sep 2026

  it('labels progress for each tracking style', () => {
    expect(
      withStatus(
        emi({ installmentsPaid: 1, installmentsTotal: 12 }),
        '2026-09',
        today,
      ).progressLabel,
    ).toBe('1 / 12');
    expect(
      withStatus(emi({ installmentsLeft: 2 }), '2026-09', today).progressLabel,
    ).toBe('2 left');
    expect(
      withStatus(emi({ installmentsLeft: 1 }), '2026-09', today).progressLabel,
    ).toBe('Last one left');
    expect(withStatus(emi(), '2026-09', today).progressLabel).toBe('Monthly');
  });

  it('computes days until due, negative once overdue', () => {
    expect(withStatus(emi({ dueDay: 25 }), '2026-09', today).daysUntilDue).toBe(
      3,
    );
    expect(withStatus(emi({ dueDay: 1 }), '2026-09', today).daysUntilDue).toBe(
      -21,
    );
    expect(withStatus(emi({ dueDay: 22 }), '2026-09', today).daysUntilDue).toBe(
      0,
    );
  });

  it('marks the cycle paid only for a matching cycle', () => {
    expect(
      withStatus(emi({ lastPaidCycle: '2026-09' }), '2026-09', today)
        .isPaidThisCycle,
    ).toBe(true);
    expect(
      withStatus(emi({ lastPaidCycle: '2026-08' }), '2026-09', today)
        .isPaidThisCycle,
    ).toBe(false);
  });

  it('projects the payoff month from the instalments left', () => {
    // 11 remaining, counting this month: Sep 2026 + 10 = Jul 2027
    expect(
      withStatus(
        emi({ installmentsPaid: 1, installmentsTotal: 12 }),
        '2026-09',
        today,
      ).payoffLabel,
    ).toBe('Ends Jul 2027');
  });

  it('totals the money still owed', () => {
    expect(
      withStatus(
        emi({ amount: 1821, installmentsPaid: 1, installmentsTotal: 12 }),
        '2026-09',
        today,
      ).remainingPayout,
    ).toBe(20_031);
  });
});

describe('summarise', () => {
  const today = new Date(2026, 8, 22);
  const rows = [
    emi({ id: 'a', amount: 1000, dueDay: 1 }),
    emi({ id: 'b', amount: 2000, dueDay: 25, lastPaidCycle: '2026-09' }),
    emi({ id: 'c', amount: 500, installmentsPaid: 12, installmentsTotal: 12 }),
  ].map((row) => withStatus(row, '2026-09', today));

  it('excludes closed obligations from the month total', () => {
    const summary = summarise(rows, '2026-09');
    expect(summary.monthlyTotal).toBe(3000);
    expect(summary.activeCount).toBe(2);
  });

  it('splits paid from pending', () => {
    const summary = summarise(rows, '2026-09');
    expect(summary.paidTotal).toBe(2000);
    expect(summary.pendingTotal).toBe(1000);
    expect(summary.paidCount).toBe(1);
  });

  it('counts only unpaid past-due items as overdue', () => {
    expect(summarise(rows, '2026-09').overdueCount).toBe(1);
  });
});

describe('sortForDisplay', () => {
  it('puts unpaid first, then orders by due day', () => {
    const today = new Date(2026, 8, 22);
    const rows = [
      emi({ id: 'late', dueDay: 25 }),
      emi({ id: 'paid-early', dueDay: 2, lastPaidCycle: '2026-09' }),
      emi({ id: 'early', dueDay: 1 }),
    ].map((row) => withStatus(row, '2026-09', today));

    expect(sortForDisplay(rows).map((row) => row.id)).toEqual([
      'early',
      'late',
      'paid-early',
    ]);
  });
});

describe('cycle helpers', () => {
  it('formats a cycle as YYYY-MM', () => {
    expect(toCycle(new Date(2026, 0, 5))).toBe('2026-01');
  });

  it('rolls over year boundaries in both directions', () => {
    expect(shiftCycle('2026-12', 1)).toBe('2027-01');
    expect(shiftCycle('2026-01', -1)).toBe('2025-12');
  });
});

describe('formatting', () => {
  it('uses the Indian numbering system', () => {
    expect(formatRupees(188265)).toBe('₹1,88,265');
  });

  it('describes the due window in plain words', () => {
    const today = new Date(2026, 8, 22);
    const label = (dueDay: number) =>
      formatDueLabel(withStatus(emi({ dueDay }), '2026-09', today));

    expect(label(22)).toBe('Due today');
    expect(label(23)).toBe('Due tomorrow');
    expect(label(25)).toBe('Due in 3 days');
    expect(label(21)).toBe('1 day overdue');
    expect(label(1)).toBe('21 days overdue');
  });
});
