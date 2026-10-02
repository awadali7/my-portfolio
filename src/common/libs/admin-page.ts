import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import type { AdminProfileProps } from '@/common/types/emi';
import { getAdminProfile } from '@/services/emi';

import { readAdminToken } from './admin-session';

const TO_LOGIN = {
  redirect: { destination: '/admin/login', permanent: false },
} as const;

/**
 * Wraps a console page's getServerSideProps: proves the session before the page
 * renders, and hands the loader the verified admin plus the bearer token.
 *
 * Every tab needs this, so it lives here rather than being copy-pasted five
 * times with five chances to forget the auth check.
 */
export function withAdminPage<P extends Record<string, unknown>>(
  load: (
    token: string,
    admin: AdminProfileProps,
    ctx: GetServerSidePropsContext,
  ) => Promise<P>,
) {
  return async (
    ctx: GetServerSidePropsContext,
  ): Promise<GetServerSidePropsResult<P & { admin: AdminProfileProps }>> => {
    const token = readAdminToken(ctx.req);
    if (!token) return TO_LOGIN;

    try {
      const admin = await getAdminProfile(token);
      const props = await load(token, admin, ctx);
      return { props: { ...props, admin } };
    } catch {
      // An expired token and a backend that is down are indistinguishable from
      // here; sending the operator to the login page is right either way.
      return TO_LOGIN;
    }
  };
}
