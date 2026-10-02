import { NextPage } from 'next';
import { NextSeo } from 'next-seo';

import Container from '@/common/components/elements/Container';
import { cycleFromQuery } from '@/common/helpers/money';
import { withAdminPage } from '@/common/libs/admin-page';
import type { AdminProfileProps } from '@/common/types/emi';
import type { CategoryProps, ExpenseMonthProps } from '@/common/types/money';
import ExpenseTab from '@/modules/admin/ExpenseTab';
import { getCategories, getExpenses } from '@/services/emi';

type Props = {
  admin: AdminProfileProps;
  expenses: ExpenseMonthProps;
  categories: CategoryProps[];
  cycle: string;
};

const AdminExpensePage: NextPage<Props> = ({
  admin,
  expenses,
  categories,
  cycle,
}) => (
  <>
    <NextSeo title='Expense — Money Manage' noindex nofollow />
    <Container className='mt-0'>
      <ExpenseTab
        admin={admin}
        initialMonth={expenses}
        categories={categories}
        cycle={cycle}
      />
    </Container>
  </>
);

export const getServerSideProps = withAdminPage(async (token, _admin, ctx) => {
  const cycle = cycleFromQuery(ctx.query.cycle);
  const [expenses, categories] = await Promise.all([
    getExpenses(token, cycle),
    getCategories(token, 'expense'),
  ]);
  return { expenses, categories, cycle };
});

export default AdminExpensePage;
