import { randomUUID } from 'crypto';

import { methodNotAllowed, withAdmin } from '@/common/libs/admin-api';
import { getEmis, upsertEmi } from '@/services/emi';

export default withAdmin(async (req, res, token) => {
  if (req.method === 'GET') {
    return res.status(200).json(await getEmis(token));
  }

  if (req.method === 'POST') {
    // The backend exposes create-or-replace at PUT /bills/:id, so a new EMI
    // needs an id minted here.
    const created = await upsertEmi(token, randomUUID(), req.body);
    return res.status(201).json(created);
  }

  return methodNotAllowed(res, ['GET', 'POST']);
});
