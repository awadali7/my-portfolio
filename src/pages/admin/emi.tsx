import { NextPage } from 'next';
import { NextSeo } from 'next-seo';

import { cycleFromQuery } from '@/common/helpers/money';
import { withAdminPage } from '@/common/libs/admin-page';
import type {
  AdminProfileProps,
  EmiProps,
  IncomeProps,
} from '@/common/types/emi';
import type { CategoryProps } from '@/common/types/money';
import EmiTab from '@/modules/admin/EmiTab';
import { getCategories, getEmis, getIncome } from '@/services/emi';

type Props = {
  admin: AdminProfileProps;
  emis: EmiProps[];
  income: IncomeProps | null;
  categories: CategoryProps[];
  cycle: string;
};

const AdminEmiPage: NextPage<Props> = ({
  admin,
  emis,
  income,
  categories,
  cycle,
}) => (
  <>
    <NextSeo title='EMI — Money Manage' noindex nofollow />

    <EmiTab
      admin={admin}
      initialEmis={emis}
      income={income}
      categories={categories}
      cycle={cycle}
    />
  </>
);

export const getServerSideProps = withAdminPage(async (token, _admin, ctx) => {
  const cycle = cycleFromQuery(ctx.query.cycle);
  const [emis, categories] = await Promise.all([
    getEmis(token),
    getCategories(token, 'emi'),
  ]);
  const income = await getIncome(token, cycle).catch(() => null);
  return { emis, income, categories, cycle };
});

export default AdminEmiPage;
