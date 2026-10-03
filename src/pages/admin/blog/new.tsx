import { NextPage } from 'next';
import { NextSeo } from 'next-seo';

import { withAdminPage } from '@/common/libs/admin-page';
import type { AdminBlogCategoryProps } from '@/common/types/blog';
import type { AdminProfileProps } from '@/common/types/emi';
import BlogEditorTab from '@/modules/admin/BlogEditorTab';
import { getAdminBlogCategories, getAdminBlogPosts } from '@/services/blog';

type Props = {
  admin: AdminProfileProps;
  categories: AdminBlogCategoryProps[];
  otherTitles: string[];
};

const AdminNewBlogPostPage: NextPage<Props> = ({
  admin,
  categories,
  otherTitles,
}) => (
  <>
    <NextSeo title='New post — Blog' noindex nofollow />

    <BlogEditorTab
      admin={admin}
      post={null}
      categories={categories}
      otherTitles={otherTitles}
    />
  </>
);

export const getServerSideProps = withAdminPage(async (token) => {
  const [categories, posts] = await Promise.all([
    getAdminBlogCategories(token),
    getAdminBlogPosts(token),
  ]);
  return { categories, otherTitles: posts.map((post) => post.title) };
});

export default AdminNewBlogPostPage;
