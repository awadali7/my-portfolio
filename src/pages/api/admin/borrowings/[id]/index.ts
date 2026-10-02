import { methodNotAllowed, withAdmin } from '@/common/libs/admin-api';
import { deleteBorrowing, updateBorrowing } from '@/services/emi';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export default withAdmin(async (req, res, token) => {
  const id = req.query.id as string;

  if (req.method === 'PUT') {
    const { lender, amount, startDate, dueDate, notes } = req.body ?? {};
    if (typeof lender !== 'string' || !lender.trim()) {
      return res.status(400).json({ message: 'Lender is required' });
    }
    if (!Number.isInteger(amount) || amount < 0) {
      return res.status(400).json({ message: 'Amount must be whole rupees' });
    }
    if (typeof startDate !== 'string' || !DATE.test(startDate)) {
      return res.status(400).json({ message: 'Start date must be YYYY-MM-DD' });
    }
    if (typeof dueDate !== 'string' || !DATE.test(dueDate)) {
      return res.status(400).json({ message: 'Due date must be YYYY-MM-DD' });
    }

    return res.status(200).json(
      await updateBorrowing(token, id, {
        lender: lender.trim(),
        amount,
        startDate,
        dueDate,
        notes: typeof notes === 'string' && notes ? notes : null,
      }),
    );
  }

  if (req.method === 'DELETE') {
    await deleteBorrowing(token, id);
    return res.status(204).end();
  }

  return methodNotAllowed(res, ['PUT', 'DELETE']);
});
