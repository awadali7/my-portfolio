import { NextPage } from 'next';
import { NextSeo } from 'next-seo';

import { withAdminPage } from '@/common/libs/admin-page';
import type { AdminProfileProps } from '@/common/types/emi';
import type { CategoryProps } from '@/common/types/money';
import SettingsTab from '@/modules/admin/SettingsTab';
import { getCategories } from '@/services/emi';

type Props = {
  admin: AdminProfileProps;
  categories: CategoryProps[];
};

const AdminSettingsPage: NextPage<Props> = ({ admin, categories }) => (
  <>
    <NextSeo title='Settings — Money Manage' noindex nofollow />

    <SettingsTab admin={admin} initialCategories={categories} />
  </>
);

export const getServerSideProps = withAdminPage(async (token) => ({
  categories: await getCategories(token),
}));

export default AdminSettingsPage;
