import { methodNotAllowed, withAdmin } from '@/common/libs/admin-api';
import { interpretMessage } from '@/services/emi';

const KINDS = ['expense', 'income', 'emi', 'borrowing'];

/**
 * Asks the backend to interpret a note. Returns a *proposal* only — nothing is
 * written until the operator confirms, which goes through the normal endpoints.
 */
export default withAdmin(async (req, res, token) => {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const { message, cycle, kind } = req.body ?? {};
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ message: 'Say something first' });
  }

  return res.status(200).json(
    await interpretMessage(token, {
      message: message.trim().slice(0, 500),
      cycle: typeof cycle === 'string' ? cycle : undefined,
      kind: KINDS.includes(kind) ? kind : undefined,
    }),
  );
});
