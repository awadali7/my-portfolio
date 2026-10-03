import { NextPage } from 'next';
import { NextSeo } from 'next-seo';

import { withAdminPage } from '@/common/libs/admin-page';
import type { AdminBlogPostRowProps } from '@/common/types/blog';
import type { AdminProfileProps } from '@/common/types/emi';
import BlogPostsTab from '@/modules/admin/BlogPostsTab';
import { getAdminBlogPosts } from '@/services/blog';

type Props = {
  admin: AdminProfileProps;
  posts: AdminBlogPostRowProps[];
};

const AdminBlogPostsPage: NextPage<Props> = ({ admin, posts }) => (
  <>
    <NextSeo title='Posts — Blog' noindex nofollow />

    <BlogPostsTab admin={admin} initialPosts={posts} />
  </>
);

export const getServerSideProps = withAdminPage(async (token) => ({
  posts: await getAdminBlogPosts(token),
}));

export default AdminBlogPostsPage;
