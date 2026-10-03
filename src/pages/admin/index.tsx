import { NextPage } from 'next';
import { NextSeo } from 'next-seo';

import { cycleFromQuery } from '@/common/helpers/money';
import { withAdminPage } from '@/common/libs/admin-page';
import type {
  AdminProfileProps,
  EmiProps,
  IncomeProps,
} from '@/common/types/emi';
import type {
  BorrowingSummaryProps,
  ExpenseMonthProps,
} from '@/common/types/money';
import DashboardTab from '@/modules/admin/DashboardTab';
import { getBorrowings, getEmis, getExpenses, getIncome } from '@/services/emi';

type Props = {
  admin: AdminProfileProps;
  emis: EmiProps[];
  income: IncomeProps | null;
  expenses: ExpenseMonthProps;
  borrowings: BorrowingSummaryProps;
  cycle: string;
};

const AdminDashboardPage: NextPage<Props> = ({
  admin,
  emis,
  income,
  expenses,
  borrowings,
  cycle,
}) => (
  <>
    <NextSeo title='Money Manage' noindex nofollow />

    <DashboardTab
      admin={admin}
      emis={emis}
      income={income}
      expenses={expenses}
      borrowings={borrowings}
      cycle={cycle}
    />
  </>
);

export const getServerSideProps = withAdminPage(async (token, _admin, ctx) => {
  const cycle = cycleFromQuery(ctx.query.cycle);
  const [emis, expenses, borrowings] = await Promise.all([
    getEmis(token),
    getExpenses(token, cycle),
    getBorrowings(token),
  ]);
  // Income is secondary here — a failure shouldn't cost the whole dashboard.
  const income = await getIncome(token, cycle).catch(() => null);
  return { emis, income, expenses, borrowings, cycle };
});

export default AdminDashboardPage;
