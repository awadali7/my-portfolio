import { methodNotAllowed, withAdmin } from '@/common/libs/admin-api';
import type { CategoryKind } from '@/common/types/money';
import { createCategory, getCategories } from '@/services/emi';

const KINDS: CategoryKind[] = ['emi', 'income', 'expense'];

export default withAdmin(async (req, res, token) => {
  if (req.method === 'GET') {
    const kind = req.query.kind as CategoryKind | undefined;
    if (kind && !KINDS.includes(kind)) {
      return res.status(400).json({ message: 'Unknown category kind' });
    }
    return res.status(200).json(await getCategories(token, kind));
  }

  if (req.method === 'POST') {
    const { kind, name } = req.body ?? {};
    if (!KINDS.includes(kind)) {
      return res.status(400).json({ message: 'Unknown category kind' });
    }
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }
    return res
      .status(201)
      .json(await createCategory(token, { kind, name: name.trim() }));
  }

  return methodNotAllowed(res, ['GET', 'POST']);
});
