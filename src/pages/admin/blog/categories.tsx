import { NextPage } from 'next';
import { NextSeo } from 'next-seo';

import { withAdminPage } from '@/common/libs/admin-page';
import type { AdminBlogCategoryProps } from '@/common/types/blog';
import type { AdminProfileProps } from '@/common/types/emi';
import BlogCategoriesTab from '@/modules/admin/BlogCategoriesTab';
import { getAdminBlogCategories } from '@/services/blog';

type Props = {
  admin: AdminProfileProps;
  categories: AdminBlogCategoryProps[];
};

const AdminBlogCategoriesPage: NextPage<Props> = ({ admin, categories }) => (
  <>
    <NextSeo title='Categories — Blog' noindex nofollow />

    <BlogCategoriesTab admin={admin} initialCategories={categories} />
  </>
);

export const getServerSideProps = withAdminPage(async (token) => ({
  categories: await getAdminBlogCategories(token),
}));

export default AdminBlogCategoriesPage;
