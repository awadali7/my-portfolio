import { toBlogCategoryInput } from '@/common/helpers/blog';
import { methodNotAllowed, withAdmin } from '@/common/libs/admin-api';
import { deleteBlogCategory, updateBlogCategory } from '@/services/blog';

export default withAdmin(async (req, res, token) => {
  const id = req.query.id as string;

  if (req.method === 'PUT') {
    const input = toBlogCategoryInput(req.body);
    if (typeof input === 'string') {
      return res.status(400).json({ message: input });
    }
    return res.status(200).json(await updateBlogCategory(token, id, input));
  }

  if (req.method === 'DELETE') {
    await deleteBlogCategory(token, id);
    return res.status(204).end();
  }

  return methodNotAllowed(res, ['PUT', 'DELETE']);
});
