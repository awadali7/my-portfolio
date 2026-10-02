import { methodNotAllowed, withAdmin } from '@/common/libs/admin-api';
import { deleteIncomeSource, updateIncomeSource } from '@/services/emi';

export default withAdmin(async (req, res, token) => {
  const id = req.query.id as string;

  if (req.method === 'PUT') {
    const { label, amount, cycle } = req.body ?? {};
    if (typeof label !== 'string' || !label.trim()) {
      return res.status(400).json({ message: 'Label is required' });
    }
    if (!Number.isInteger(amount) || amount < 0) {
      return res.status(400).json({ message: 'Amount must be whole rupees' });
    }
    return res.status(200).json(
      await updateIncomeSource(token, id, {
        label: label.trim(),
        amount,
        cycle: typeof cycle === 'string' && cycle ? cycle : null,
      }),
    );
  }

  if (req.method === 'DELETE') {
    await deleteIncomeSource(token, id);
    return res.status(204).end();
  }

  return methodNotAllowed(res, ['PUT', 'DELETE']);
});
