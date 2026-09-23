import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { BackendError } from '@/services/emi';

import { clearAdminCookie, readAdminToken } from './admin-session';

// Returns unknown rather than void: `return res.status(200).json(...)` is the
// idiomatic early-exit in these routes and it evaluates to the response object.
type AdminHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  token: string,
) => Promise<unknown> | unknown;

/**
 * Wraps an admin API route: requires the session cookie, forwards the token to
 * the backend, and maps backend failures onto this route's response.
 *
 * A 401 from the backend means the token expired or the account is gone, so the
 * stale cookie is cleared here — otherwise the browser keeps presenting a dead
 * token and the console shows errors instead of the login page.
 */
export const withAdmin =
  (handler: AdminHandler): NextApiHandler =>
  async (req, res) => {
    const token = readAdminToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Not signed in' });
    }

    try {
      await handler(req, res, token);
      return;
    } catch (error) {
      if (error instanceof BackendError) {
        if (error.status === 401) clearAdminCookie(res);
        return res.status(error.status).json({ message: error.message });
      }
      return res.status(502).json({ message: 'Could not reach the backend' });
    }
  };

/** 405 with the right Allow header for routes that only take some verbs. */
export const methodNotAllowed = (
  res: NextApiResponse,
  allowed: string[],
): void => {
  res.setHeader('Allow', allowed.join(', '));
  res.status(405).json({ message: 'Method not allowed' });
};
