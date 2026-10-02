import { methodNotAllowed, withAdmin } from '@/common/libs/admin-api';
import { getAssistantStatus } from '@/services/emi';

export default withAdmin(async (req, res, token) => {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  return res.status(200).json(await getAssistantStatus(token));
});
