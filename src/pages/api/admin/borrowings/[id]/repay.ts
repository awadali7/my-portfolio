import { methodNotAllowed, withAdmin } from '@/common/libs/admin-api';
import { repayBorrowing, unrepayBorrowing } from '@/services/emi';

/** POST settles the borrowing, DELETE reopens it. */
export default withAdmin(async (req, res, token) => {
  const id = req.query.id as string;

  if (req.method === 'POST') {
    const repaidOn =
      typeof req.body?.repaidOn === 'string' ? req.body.repaidOn : undefined;
    return res.status(200).json(await repayBorrowing(token, id, repaidOn));
  }

  if (req.method === 'DELETE') {
    return res.status(200).json(await unrepayBorrowing(token, id));
  }

  return methodNotAllowed(res, ['POST', 'DELETE']);
});
