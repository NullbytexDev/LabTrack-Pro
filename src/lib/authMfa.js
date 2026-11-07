import { api } from '@/api/client';

// Kept in this tab only: a pending second factor never goes into the URL.
const CHALLENGE_KEY = 'labtrack-mfa-challenge';

/** Email and password sign-in that may ask for a second factor. */
export async function loginWithMfa(email, password) {
  const result = await api.auth.login(email, password);
  if (result.access_token) api.auth.setToken(result.access_token);
  return result;
}

export function stashMfaChallenge(challenge) {
  try {
    sessionStorage.setItem(CHALLENGE_KEY, JSON.stringify(challenge));
  } catch {
    // Storage blocked: the member is asked for a fresh sign-in instead.
  }
}

export function takeMfaChallenge() {
  try {
    const raw = sessionStorage.getItem(CHALLENGE_KEY);
    sessionStorage.removeItem(CHALLENGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** A second factor is finished on the /mfa page. */
export function continueMfa(result, returnTo) {
  stashMfaChallenge({
    mfa_session_token: result.mfa_session_token,
    methods: result.methods || [],
  });
  const url = new URL('/mfa', window.location.origin);
  const search = new URLSearchParams(returnTo ? { return_to: returnTo } : {}).toString();
  url.search = search;
  window.location.assign(url.href);
}

export function loginWithSocial(provider, returnTo) {
  api.auth.loginWithProvider(provider, returnTo);
}

export function loginWithGoogle(returnTo) {
  return loginWithSocial('google', returnTo);
}
