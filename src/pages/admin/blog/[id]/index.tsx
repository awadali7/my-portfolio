import { NextPage } from 'next';
import { NextSeo } from 'next-seo';

import { AdminPageNotFound, withAdminPage } from '@/common/libs/admin-page';
import type {
  AdminBlogCategoryProps,
  AdminBlogPostProps,
} from '@/common/types/blog';
import type { AdminProfileProps } from '@/common/types/emi';
import BlogEditorTab from '@/modules/admin/BlogEditorTab';
import { BackendError } from '@/services/backend';
import {
  getAdminBlogCategories,
  getAdminBlogPost,
  getAdminBlogPosts,
} from '@/services/blog';

type Props = {
  admin: AdminProfileProps;
  post: AdminBlogPostProps;
  categories: AdminBlogCategoryProps[];
  otherTitles: string[];
};

const AdminEditBlogPostPage: NextPage<Props> = ({
  admin,
  post,
  categories,
  otherTitles,
}) => (
  <>
    <NextSeo title='Edit post — Blog' noindex nofollow />

    {/* Keyed so moving between two posts starts a fresh editor. */}
    <BlogEditorTab
      key={post.id}
      admin={admin}
      post={post}
      categories={categories}
      otherTitles={otherTitles}
    />
  </>
);

export const getServerSideProps = withAdminPage(async (token, _admin, ctx) => {
  const id = String(ctx.params?.id ?? '');
  const [post, categories, posts] = await Promise.all([
    getAdminBlogPost(token, id).catch((error: unknown) => {
      if (error instanceof BackendError && error.status === 404) {
        throw new AdminPageNotFound();
      }
      throw error;
    }),
    getAdminBlogCategories(token),
    getAdminBlogPosts(token),
  ]);
  return {
    post,
    categories,
    otherTitles: posts.filter((row) => row.id !== id).map((row) => row.title),
  };
});

export default AdminEditBlogPostPage;
