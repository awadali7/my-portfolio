import type { NextApiRequest, NextApiResponse } from 'next';

import { clearAdminCookie } from '@/common/libs/admin-session';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }
  clearAdminCookie(res);
  return res.status(200).json({ ok: true });
}
