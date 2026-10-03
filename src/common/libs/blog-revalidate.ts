import type { NextApiResponse } from 'next';

/**
 * Rebuilds a post's static page so a publish, edit, unpublish or delete shows
 * at once. Never fails the admin action: if the rebuild can't run right now,
 * the page's hourly revalidation catches up.
 */
export const revalidateBlogPost = async (
  res: NextApiResponse,
  slug: string,
): Promise<boolean> => {
  try {
    await res.revalidate(`/blog/${slug}`);
    return true;
  } catch {
    return false;
  }
};
