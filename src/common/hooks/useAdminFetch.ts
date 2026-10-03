import { useRouter } from 'next/router';
import { useCallback } from 'react';

/**
 * fetch for the console's own API routes: JSON in and out, the backend's
 * message on failure, and back to the login page when the session expires.
 */
const useAdminFetch = () => {
  const router = useRouter();

  return useCallback(
    async <T>(url: string, init: RequestInit = {}): Promise<T> => {
      const response = await fetch(url, {
        ...init,
        headers: { 'content-type': 'application/json', ...init.headers },
      });
      if (response.status === 401) {
        await router.replace('/admin/login');
        throw new Error('Your session expired. Sign in again.');
      }
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(body.message || `Request failed (${response.status})`);
      }
      return (response.status === 204 ? null : await response.json()) as T;
    },
    [router],
  );
};

export default useAdminFetch;
