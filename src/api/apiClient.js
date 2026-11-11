/**
 * LabTrack Pro — browser API client.
 *
 * The companion server (identity, lab data, reporting and file storage) is not
 * part of this repository. Set VITE_API_ORIGIN to that service's address and
 * every call below resolves through its HTTP endpoints; the session token is
 * kept in local storage under `access_token`.
 */
import { appParams } from '@/lib/app-params';

const TOKEN_KEY = 'access_token';
const origin = () => appParams.apiOrigin || '';

const token = {
  read() {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(TOKEN_KEY) || '';
  },
  set(value) {
    if (typeof window === 'undefined') return;
    if (value) window.localStorage.setItem(TOKEN_KEY, value);
    else window.localStorage.removeItem(TOKEN_KEY);
  },
  clear() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem('token');
  },
};

function parse(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(path, { method = 'POST', body, headers = {}, raw = false } = {}) {
  const session = token.read();
  const response = await fetch(`${origin()}${path}`, {
    method,
    headers: {
      ...(raw ? {} : { 'Content-Type': 'application/json' }),
      ...(session ? { Authorization: `Bearer ${session}` } : {}),
      ...headers,
    },
    body: raw ? body : body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = parse(await response.text());
  if (!response.ok) {
    const error = new Error(payload?.error || payload?.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = payload;
    throw error;
  }
  return payload;
}

/** Functions return `{ data }` so callers keep the familiar envelope. */
const functions = {
  invoke: async (name, payload = {}) => {
    const result = await request(`/functions/${name}`, { body: payload });
    const data = result && typeof result === 'object' && 'data' in result ? result.data : result;
    return { data, status: 200 };
  },
};

const auth = {
  me: () => request('/auth/me', { method: 'GET' }),
  updateMe: (patch) => request('/auth/me', { method: 'PATCH', body: patch }),
  isAuthenticated: async () => Boolean(token.read()),
  setToken: (value) => token.set(value),
  register: (body) => request('/auth/register', { body }),
  verifyOtp: (body) => request('/auth/verify-code', { body }),
  resendOtp: (email) => request('/auth/resend-code', { body: { email } }),
  resetPasswordRequest: (email) => request('/auth/password/reset-request', { body: { email } }),
  resetPassword: (body) => request('/auth/password/reset', { body }),
  changePassword: (body) => request('/auth/password/change', { body }),
  logout: (redirectUrl) => {
    token.clear();
    if (typeof window === 'undefined') return;
    if (redirectUrl) window.location.href = redirectUrl;
    else window.location.reload();
  },
  redirectToLogin: (next) => {
    if (typeof window === 'undefined') return;
    const target = next || window.location.href;
    window.location.href = `/login?returnTo=${encodeURIComponent(target)}`;
  },
  loginWithProvider: (provider, returnTo) => {
    if (typeof window === 'undefined') return undefined;
    const url = new URL(`${origin()}/auth/provider/${provider}`);
    if (returnTo) url.searchParams.set('return_to', returnTo);
    window.location.href = url.toString();
    return undefined;
  },
};

const app = {
  getPublicSettings: () => request('/app/public-settings', { method: 'GET' }),
};

const ENTITY_OPS = [
  'filter', 'list', 'get', 'count', 'aggregate', 'create', 'bulkCreate',
  'update', 'bulkUpdate', 'updateMany', 'delete', 'deleteMany',
];

/** `api.entities.Pc.filter({ lab_id })` → POST /entities/Pc/filter */
const entities = new Proxy({}, {
  get: (_target, entity) => Object.fromEntries(
    ENTITY_OPS.map((op) => [op, (payload = {}, options = {}) =>
      request(`/entities/${String(entity)}/${op}`, { body: { payload, options } })]),
  ),
});

const upload = (path) => async ({ file }) => {
  const form = new FormData();
  form.append('file', file);
  return request(path, { body: form, raw: true });
};

const integrations = {
  Core: {
    UploadPrivateFile: upload('/files/private'),
    UploadPublicFile: upload('/files/public'),
    CreateFileSignedUrl: ({ file_uri, expires_in }) =>
      request('/files/signed-url', { body: { file_uri, expires_in } }),
  },
};

// Outbound product analytics are not part of this repository; the hook stays so
// call sites read the same, and sends nothing until VITE_API_ORIGIN is set.
const analytics = {
  track: async () => undefined,
};

export const api = { auth, app, functions, entities, integrations, analytics, token };
export default api;
