import { NextApiRequest, NextApiResponse } from 'next';

import { getGithubUser } from '@/services/github';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const type = (req.query.type as string) || 'personal';

  try {
    const { status, data } = await getGithubUser(type);
    return res.status(status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch GitHub data' });
  }
}
