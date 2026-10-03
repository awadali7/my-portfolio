import { methodNotAllowed, withAdmin } from '@/common/libs/admin-api';
import { revalidateBlogPost } from '@/common/libs/blog-revalidate';
import { publishBlogPost } from '@/services/blog';

export default withAdmin(async (req, res, token) => {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const post = await publishBlogPost(token, req.query.id as string);
  await revalidateBlogPost(res, post.slug);
  return res.status(200).json(post);
});
