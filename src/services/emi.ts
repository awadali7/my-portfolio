import type {
  AdminProfileProps,
  EmiProps,
  IncomeProps,
} from '@/common/types/emi';

/**
 * Server-side client for awad-backend. Every call here runs inside a Next API
 * route or getServerSideProps — never in the browser — so the admin token stays
 * in an httpOnly cookie and never reaches page scripts.
 *
 * Every request authenticates with the admin bearer token. The backend's shared
 * `x-api-key` is for machine callers (scripts, the notifier) and is deliberately
 * not used from here — the console has a real session.
 *
 * The backend resource is `/bills`; the console calls them EMIs. This module is
 * the only place the two names meet.
 */
const BASE_URL = (
  process.env.BACKEND_API_URL ?? 'http://localhost:3001'
).replace(/\/$/, '');

export class BackendError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'BackendError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Admin bearer token from the session cookie, when the caller has one. */
  token?: string;
};

async function request<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (token) headers.authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const message =
      (payload as { message?: string | string[] } | null)?.message ??
      `Backend responded ${response.status}`;
    throw new BackendError(
      response.status,
      Array.isArray(message) ? message.join(', ') : message,
    );
  }

  return payload as T;
}

export const adminLogin = (username: string, password: string) =>
  request<{ accessToken: string; admin: AdminProfileProps }>(
    '/admin/auth/login',
    { method: 'POST', body: { username, password } },
  );

export const getAdminProfile = (token: string) =>
  request<AdminProfileProps>('/admin/auth/me', { token });

export const changeAdminPassword = (
  token: string,
  currentPassword: string,
  newPassword: string,
) =>
  request<{ ok: boolean }>('/admin/auth/change-password', {
    method: 'POST',
    token,
    body: { currentPassword, newPassword },
  });

export const getEmis = (token: string) =>
  request<EmiProps[]>('/bills', { token });

export const upsertEmi = (token: string, id: string, body: Partial<EmiProps>) =>
  request<EmiProps>(`/bills/${id}`, { method: 'PUT', token, body });

export const deleteEmi = (token: string, id: string) =>
  request<void>(`/bills/${id}`, { method: 'DELETE', token });

export const markEmiPaid = (token: string, id: string, cycle?: string) =>
  request<EmiProps>(`/bills/${id}/pay`, {
    method: 'POST',
    token,
    body: cycle ? { cycle } : {},
  });

export const markEmiUnpaid = (token: string, id: string, cycle?: string) =>
  request<EmiProps>(`/bills/${id}/unpay`, {
    method: 'POST',
    token,
    body: cycle ? { cycle } : {},
  });

export const getIncome = (token: string) =>
  request<IncomeProps & { id: string }>('/income', { token });

export const updateIncome = (token: string, body: IncomeProps) =>
  request<IncomeProps & { id: string }>('/income', {
    method: 'PUT',
    token,
    body,
  });
