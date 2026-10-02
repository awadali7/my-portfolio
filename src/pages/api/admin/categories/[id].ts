import { methodNotAllowed, withAdmin } from '@/common/libs/admin-api';
import type { CategoryKind } from '@/common/types/money';
import { deleteCategory, updateCategory } from '@/services/emi';

const KINDS: CategoryKind[] = ['emi', 'income', 'expense'];

export default withAdmin(async (req, res, token) => {
  const id = req.query.id as string;

  if (req.method === 'PUT') {
    const { kind, name } = req.body ?? {};
    if (!KINDS.includes(kind)) {
      return res.status(400).json({ message: 'Unknown category kind' });
    }
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    return res
      .status(200)
      .json(await updateCategory(token, id, { kind, name: name.trim() }));
  }

  if (req.method === 'DELETE') {
    await deleteCategory(token, id);
    return res.status(204).end();
  }

  return methodNotAllowed(res, ['PUT', 'DELETE']);
});
