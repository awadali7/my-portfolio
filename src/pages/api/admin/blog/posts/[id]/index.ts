import { toBlogPostInput } from '@/common/helpers/blog';
import { methodNotAllowed, withAdmin } from '@/common/libs/admin-api';
import { revalidateBlogPost } from '@/common/libs/blog-revalidate';
import {
  deleteBlogPost,
  getAdminBlogPost,
  updateBlogPost,
} from '@/services/blog';

export default withAdmin(async (req, res, token) => {
  const id = req.query.id as string;

  if (req.method === 'GET') {
    return res.status(200).json(await getAdminBlogPost(token, id));
  }

  if (req.method === 'PUT') {
    const input = toBlogPostInput(req.body);
    if (typeof input === 'string') {
      return res.status(400).json({ message: input });
    }
    const post = await updateBlogPost(token, id, input);
    // A live post shows the edit at once; a draft has no public page.
    if (post.status === 'published') await revalidateBlogPost(res, post.slug);
    return res.status(200).json(post);
  }

  if (req.method === 'DELETE') {
    const post = await getAdminBlogPost(token, id);
    await deleteBlogPost(token, id);
    // Turns the live page into a 404 straight away.
    if (post.status === 'published') await revalidateBlogPost(res, post.slug);
    return res.status(204).end();
  }

  return methodNotAllowed(res, ['GET', 'PUT', 'DELETE']);
});
