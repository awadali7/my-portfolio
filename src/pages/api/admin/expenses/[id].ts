import { methodNotAllowed, withAdmin } from '@/common/libs/admin-api';
import { deleteExpense, updateExpense } from '@/services/emi';

const CYCLE = /^\d{4}-(0[1-9]|1[0-2])$/;

export default withAdmin(async (req, res, token) => {
  const id = req.query.id as string;

  if (req.method === 'PUT') {
    const { label, amount, cycle, category, notes } = req.body ?? {};
    if (typeof label !== 'string' || !label.trim()) {
      return res.status(400).json({ message: 'Label is required' });
    }
    if (!Number.isInteger(amount) || amount < 0) {
      return res.status(400).json({ message: 'Amount must be whole rupees' });
    }
    if (typeof cycle !== 'string' || !CYCLE.test(cycle)) {
      return res.status(400).json({ message: 'Month must be YYYY-MM' });
    }
    return res.status(200).json(
      await updateExpense(token, id, {
        label: label.trim(),
        amount,
        cycle,
        category: typeof category === 'string' && category ? category : null,
        notes: typeof notes === 'string' && notes ? notes : null,
      }),
    );
  }

  if (req.method === 'DELETE') {
    await deleteExpense(token, id);
    return res.status(204).end();
  }

  return methodNotAllowed(res, ['PUT', 'DELETE']);
});
