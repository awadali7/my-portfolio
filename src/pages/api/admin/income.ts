import { methodNotAllowed, withAdmin } from '@/common/libs/admin-api';
import { getIncome, updateIncome } from '@/services/emi';

export default withAdmin(async (req, res, token) => {
  if (req.method === 'GET') {
    return res.status(200).json(await getIncome(token));
  }

  if (req.method === 'PUT') {
    const { userSalary, spouseSalary } = req.body ?? {};
    if (!Number.isInteger(userSalary) || !Number.isInteger(spouseSalary)) {
      return res
        .status(400)
        .json({ message: 'userSalary and spouseSalary must be whole rupees' });
    }
    return res
      .status(200)
      .json(await updateIncome(token, { userSalary, spouseSalary }));
  }

  return methodNotAllowed(res, ['GET', 'PUT']);
});
