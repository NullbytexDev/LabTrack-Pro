/**
 * LabTrack Pro — API client
 *
 * A small, dependency-free HTTP client for the service that backs this
 * interface. Point VITE_API_BASE_URL at your own API (see README.md for the
 * endpoints each screen calls); the bearer token is kept under one storage key,
 * so any token-based backend works without touching the UI.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
const TOKEN_KEY = 'labtrack-token';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.reason = (data && data.error && data.error.reason) || (data && data.reason);
  }
}

export function getToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage blocked (private mode): the session simply does not persist.
  }
}

export function clearToken() {
  setToken(null);
}

function encodeValue(value) {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function withQuery(url, query) {
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, encodeValue(value));
  }
  const search = params.toString();
  return search ? url + '?' + search : url;
}

/** One HTTP request. Throws ApiError with the server status on failure. */
export async function request(urlPath, options = {}) {
  const { method = 'GET', body, token, headers = {}, query } = options;
  const authToken = token === undefined ? getToken() : token;
  const response = await fetch(withQuery(BASE_URL + urlPath, query), {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(authToken ? { Authorization: 'Bearer ' + authToken } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const message =
      (data.error && data.error.message) || data.message || data.detail || 'Request failed';
    throw new ApiError(message, response.status, data);
  }
  return data;
}

export const auth = {
  getToken,
  setToken,
  clearToken,

  isAuthenticated: async () => Boolean(getToken()),
  me: () => request('/auth/me'),
  updateMe: (data) => request('/auth/me', { method: 'PATCH', body: data }),

  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  verifyOtp: (payload) =>
    request('/auth/verify-otp', {
      method: 'POST',
      body: { email: payload.email, otp_code: payload.otpCode },
    }),
  resendOtp: (email) => request('/auth/resend-otp', { method: 'POST', body: { email } }),
  resetPasswordRequest: (email) =>
    request('/auth/reset-password-request', { method: 'POST', body: { email } }),
  resetPassword: (payload) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: { reset_token: payload.resetToken, new_password: payload.newPassword },
    }),
  changePassword: (payload) => request('/auth/change-password', { method: 'POST', body: payload }),
  options: () => request('/auth/options'),

  loginWithProvider: (provider, returnTo, options = {}) => {
    const url = new URL(BASE_URL + '/auth/oauth/' + provider + '/start', window.location.origin);
    url.searchParams.set('return_to', new URL(returnTo || '/', window.location.origin).href);
    if (options.manage) url.searchParams.set('manage', '1');
    window.location.assign(url.href);
  },

  redirectToLogin: (nextUrl) => {
    const target = nextUrl || window.location.href;
    window.location.href = '/login?return_to=' + encodeURIComponent(target);
  },

  logout: (redirectUrl) => {
    clearToken();
    request('/auth/logout', { method: 'POST', token: null }).catch(() => {});
    if (redirectUrl) window.location.href = redirectUrl;
  },
};

// Every record type the interface reads or writes.
export const ENTITY_NAMES = [
  'AppSetting',
  'HistoryEvent',
  'IssueReport',
  'Lab',
  'MemberLog',
  'Message',
  'Notification',
  'PC',
  'Profile',
  'SignInEvent',
];

function entityResource(name) {
  const base = '/entities/' + name;
  return {
    list: (options) => request(base, { query: { options } }),
    filter: (query, options) => request(base, { query: { query, options } }),
    get: (id) => request(base + '/' + id),
    count: (query) => request(base + '/count', { query: { query } }),
    aggregate: (params) => request(base + '/aggregate', { method: 'POST', body: params }),
    create: (data) => request(base, { method: 'POST', body: data }),
    bulkCreate: (items) => request(base + '/bulk', { method: 'POST', body: { items } }),
    bulkUpdate: (items) => request(base + '/bulk', { method: 'PATCH', body: { items } }),
    update: (id, data) => request(base + '/' + id, { method: 'PATCH', body: data }),
    updateMany: (query, update) =>
      request(base + '/update-many', { method: 'PATCH', body: { query, update } }),
    delete: (id) => request(base + '/' + id, { method: 'DELETE' }),
    deleteMany: (query) => request(base + '/delete-many', { method: 'POST', body: { query } }),

    /** Live updates over server-sent events; returns an unsubscribe function. */
    subscribe: (onEvent) => {
      if (typeof EventSource === 'undefined') return () => {};
      const stream = new EventSource(
        withQuery(BASE_URL + base + '/stream', { token: getToken() })
      );
      stream.onmessage = (event) => {
        if (!event.data) return;
        try {
          onEvent(JSON.parse(event.data));
        } catch {
          // Ignore frames that are not JSON.
        }
      };
      return () => stream.close();
    },
  };
}

export const entities = Object.fromEntries(
  ENTITY_NAMES.map((name) => [name, entityResource(name)])
);

export const app = {
  /** Public, non-secret settings the interface needs before sign-in. */
  getPublicSettings: () => request('/public-settings'),
};

export const functions = {
  /** Calls one server-side operation by name. Resolves to { data }. */
  invoke: (name, payload) =>
    request('/functions/' + name, { method: 'POST', body: payload || {} }),
};

export const api = { auth, app, entities, functions, request, getToken, setToken, clearToken };
export default api;
