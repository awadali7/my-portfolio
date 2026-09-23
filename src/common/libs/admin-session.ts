import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';

/**
 * The admin session is the backend-issued JWT held in an httpOnly cookie.
 * Keeping it out of localStorage means page scripts (and anything injected
 * into them) can't read it, and the browser never sees BACKEND_API_KEY at all.
 */
export const ADMIN_COOKIE = 'admin_token';

/** Matches ADMIN_JWT_EXPIRES_IN on the backend — 12h. */
const MAX_AGE_SECONDS = 12 * 60 * 60;

export const setAdminCookie = (res: NextApiResponse, token: string): void => {
  const parts = [
    `${ADMIN_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${MAX_AGE_SECONDS}`,
  ];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
};

export const clearAdminCookie = (res: NextApiResponse): void => {
  const parts = [
    `${ADMIN_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
};

export const readAdminToken = (
  req: NextApiRequest | GetServerSidePropsContext['req'],
): string | null => req.cookies?.[ADMIN_COOKIE] || null;
