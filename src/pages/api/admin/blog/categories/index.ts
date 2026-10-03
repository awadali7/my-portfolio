import { toBlogCategoryInput } from '@/common/helpers/blog';
import { methodNotAllowed, withAdmin } from '@/common/libs/admin-api';
import { createBlogCategory, getAdminBlogCategories } from '@/services/blog';

export default withAdmin(async (req, res, token) => {
  if (req.method === 'GET') {
    return res.status(200).json(await getAdminBlogCategories(token));
  }

  if (req.method === 'POST') {
    const input = toBlogCategoryInput(req.body);
    if (typeof input === 'string') {
      return res.status(400).json({ message: input });
    }
    return res.status(201).json(await createBlogCategory(token, input));
  }

  return methodNotAllowed(res, ['GET', 'POST']);
});
