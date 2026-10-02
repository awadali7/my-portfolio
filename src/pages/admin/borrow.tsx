import { NextPage } from 'next';
import { NextSeo } from 'next-seo';

import Container from '@/common/components/elements/Container';
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
    <Container className='mt-0'>
      <BorrowTab admin={admin} initialData={data} />
    </Container>
  </>
);

export const getServerSideProps = withAdminPage(async (token) => ({
  data: await getBorrowings(token),
}));

export default AdminBorrowPage;
