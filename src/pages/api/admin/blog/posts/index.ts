import { toBlogPostInput } from '@/common/helpers/blog';
import { methodNotAllowed, withAdmin } from '@/common/libs/admin-api';
import { createBlogPost, getAdminBlogPosts } from '@/services/blog';

export default withAdmin(async (req, res, token) => {
  if (req.method === 'GET') {
    return res.status(200).json(await getAdminBlogPosts(token));
  }

  if (req.method === 'POST') {
    const input = toBlogPostInput(req.body);
    if (typeof input === 'string') {
      return res.status(400).json({ message: input });
    }
    // New posts are drafts, so there is no public page to rebuild yet.
    return res.status(201).json(await createBlogPost(token, input));
  }

  return methodNotAllowed(res, ['GET', 'POST']);
});
