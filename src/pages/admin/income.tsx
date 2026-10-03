import { NextPage } from 'next';
import { NextSeo } from 'next-seo';

import { cycleFromQuery } from '@/common/helpers/money';
import { withAdminPage } from '@/common/libs/admin-page';
import type { AdminProfileProps, IncomeProps } from '@/common/types/emi';
import IncomeTab from '@/modules/admin/IncomeTab';
import { getIncome } from '@/services/emi';

type Props = {
  admin: AdminProfileProps;
  income: IncomeProps | null;
  cycle: string;
};

const AdminIncomePage: NextPage<Props> = ({ admin, income, cycle }) => (
  <>
    <NextSeo title='Income — Money Manage' noindex nofollow />

    <IncomeTab admin={admin} initialIncome={income} cycle={cycle} />
  </>
);

export const getServerSideProps = withAdminPage(async (token, _admin, ctx) => {
  const cycle = cycleFromQuery(ctx.query.cycle);
  return { income: await getIncome(token, cycle), cycle };
});

export default AdminIncomePage;
