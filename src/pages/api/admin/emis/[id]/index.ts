import { methodNotAllowed, withAdmin } from '@/common/libs/admin-api';
import { deleteEmi, upsertEmi } from '@/services/emi';

export default withAdmin(async (req, res, token) => {
  const id = req.query.id as string;

  if (req.method === 'PUT') {
    return res.status(200).json(await upsertEmi(token, id, req.body));
  }

  if (req.method === 'DELETE') {
    await deleteEmi(token, id);
    return res.status(204).end();
  }

  return methodNotAllowed(res, ['PUT', 'DELETE']);
});
