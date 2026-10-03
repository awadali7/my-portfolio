import { NextPage } from 'next';
import { NextSeo } from 'next-seo';

import { withAdminPage } from '@/common/libs/admin-page';
import type { AdminProfileProps } from '@/common/types/emi';
import type { BorrowingSummaryProps } from '@/common/types/money';
import BorrowTab from '@/modules/admin/BorrowTab';
import { getBorrowings } from '@/services/emi';

type Props = {
  admin: AdminProfileProps;
  data: BorrowingSummaryProps;
};

const AdminBorrowPage: NextPage<Props> = ({ admin, data }) => (
  <>
    <NextSeo title='Borrow — Money Manage' noindex nofollow />

    <BorrowTab admin={admin} initialData={data} />
  </>
);

export const getServerSideProps = withAdminPage(async (token) => ({
  data: await getBorrowings(token),
}));

export default AdminBorrowPage;
