import { methodNotAllowed, withAdmin } from '@/common/libs/admin-api';
import { markEmiPaid, markEmiUnpaid } from '@/services/emi';

/**
 * POST settles the cycle, DELETE reverses it. The instalment bookkeeping lives
 * in the backend so a double-tap can't advance the counter twice.
 */
export default withAdmin(async (req, res, token) => {
  const id = req.query.id as string;
  const cycle =
    typeof req.body?.cycle === 'string' ? req.body.cycle : undefined;

  if (req.method === 'POST') {
    return res.status(200).json(await markEmiPaid(token, id, cycle));
  }

  if (req.method === 'DELETE') {
    return res.status(200).json(await markEmiUnpaid(token, id, cycle));
  }

  return methodNotAllowed(res, ['POST', 'DELETE']);
});
