/**
 * Server-side client for awad-backend. Every call made through here runs in a
 * Next API route, getServerSideProps, getStaticProps or an edge route, never in
 * the browser, so the admin token stays in an httpOnly cookie and the backend
 * URL never reaches page scripts.
 *
 * Admin calls authenticate with the admin bearer token. The backend's shared
 * `x-api-key` is for machine callers (scripts, the notifier) and is
 * deliberately not used from here: the console has a real session. Public blog
 * reads send no credentials at all.
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

export async function request<T>(
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

  return readResponse<T>(response);
}

/**
 * Sends a body as-is, e.g. a multipart image upload, keeping its content type
 * (and so its multipart boundary) untouched.
 */
export async function sendRaw<T>(
  path: string,
  {
    token,
    body,
    contentType,
  }: { token?: string; body: Buffer; contentType: string },
): Promise<T> {
  const headers: Record<string, string> = { 'content-type': contentType };
  if (token) headers.authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body,
    cache: 'no-store',
  });

  return readResponse<T>(response);
}

/** JSON on success; a BackendError carrying the backend's message otherwise. */
async function readResponse<T>(response: Response): Promise<T> {
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

/** "?page=2&q=next" from the defined, non-empty values; "" when none are. */
export const toQueryString = (
  params: Record<string, string | number | undefined | null>,
): string => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
};
