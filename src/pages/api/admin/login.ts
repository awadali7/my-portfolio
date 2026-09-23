import type { NextApiRequest, NextApiResponse } from 'next';

import { setAdminCookie } from '@/common/libs/admin-session';
import { adminLogin, BackendError } from '@/services/emi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body ?? {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Username and password required' });
  }

  try {
    const { accessToken, admin } = await adminLogin(username, password);
    setAdminCookie(res, accessToken);
    return res.status(200).json({ admin });
  } catch (error) {
    if (error instanceof BackendError) {
      // 429 from the backend throttler is worth surfacing verbatim; everything
      // else collapses to the generic message the backend already chose.
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(502).json({ message: 'Could not reach the backend' });
  }
}
