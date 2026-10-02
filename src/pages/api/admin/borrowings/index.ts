import { methodNotAllowed, withAdmin } from '@/common/libs/admin-api';
import { createBorrowing, getBorrowings } from '@/services/emi';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

const validate = (body: Record<string, unknown>) => {
  if (typeof body.lender !== 'string' || !body.lender.trim()) {
    return 'Lender is required';
  }
  if (!Number.isInteger(body.amount) || (body.amount as number) < 0) {
    return 'Amount must be whole rupees';
  }
  if (typeof body.startDate !== 'string' || !DATE.test(body.startDate)) {
    return 'Start date must be YYYY-MM-DD';
  }
  if (typeof body.dueDate !== 'string' || !DATE.test(body.dueDate)) {
    return 'Due date must be YYYY-MM-DD';
  }
  return null;
};

export default withAdmin(async (req, res, token) => {
  if (req.method === 'GET') {
    return res.status(200).json(await getBorrowings(token));
  }

  if (req.method === 'POST') {
    const body = req.body ?? {};
    const problem = validate(body);
    if (problem) return res.status(400).json({ message: problem });

    return res.status(201).json(
      await createBorrowing(token, {
        lender: (body.lender as string).trim(),
        amount: body.amount as number,
        startDate: body.startDate as string,
        dueDate: body.dueDate as string,
        notes: typeof body.notes === 'string' && body.notes ? body.notes : null,
      }),
    );
  }

  return methodNotAllowed(res, ['GET', 'POST']);
});
