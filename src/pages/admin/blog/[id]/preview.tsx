import { NextPage } from 'next';
import Link from 'next/link';
import { NextSeo } from 'next-seo';

import { extractHeadings } from '@/common/helpers/blog';
import { AdminPageNotFound, withAdminPage } from '@/common/libs/admin-page';
import type { AdminBlogPostProps, BlogHeadingProps } from '@/common/types/blog';
import type { AdminProfileProps } from '@/common/types/emi';
import BlogArticle from '@/modules/blog/components/BlogArticle';
import { BackendError } from '@/services/backend';
import { getAdminBlogPost } from '@/services/blog';

type Props = {
  admin: AdminProfileProps;
  post: AdminBlogPostProps;
  headings: BlogHeadingProps[];
};

/**
 * The saved version of any post, drafts included, in the public article
 * layout. Only reachable with an admin session, and never indexed.
 */
const AdminBlogPreviewPage: NextPage<Props> = ({ post, headings }) => (
  <>
    <NextSeo title={`Preview: ${post.title}`} noindex nofollow />
    <BlogArticle
      post={{ ...post, related: [] }}
      headings={headings}
      banner={
        <div className='mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200'>
          <span>
            {post.status === 'published'
              ? 'Preview of the saved version. Readers see the live page.'
              : 'Draft preview. Only signed-in admins can see this page.'}
          </span>
          <Link
            href={`/admin/blog/${post.id}`}
            className='font-medium underline underline-offset-2'
          >
            Back to the editor
          </Link>
        </div>
      }
    />
  </>
);

export const getServerSideProps = withAdminPage(async (token, _admin, ctx) => {
  const post = await getAdminBlogPost(
    token,
    String(ctx.params?.id ?? ''),
  ).catch((error: unknown) => {
    if (error instanceof BackendError && error.status === 404) {
      throw new AdminPageNotFound();
    }
    throw error;
  });
  return { post, headings: extractHeadings(post.content) };
});

export default AdminBlogPreviewPage;
