import { api, request, setToken } from '@/api/client';
import { takeMfaChallenge } from '@/lib/authMfa';

// Two-factor sign-in, enrollment and factor management. The challenge token
// lives in memory for the length of a screen, never in the URL or storage.

export class MfaError extends Error {
  constructor(message, status, retryAfter) {
    super(message);
    this.name = 'MfaError';
    this.status = status;
    this.retryAfter = retryAfter;
  }

  // The challenge is gone (expired or used up): sign in again.
  get mustSignInAgain() {
    return this.status === 401;
  }
}

async function mfaRequest(suffix, { method = 'POST', body, token, headers } = {}) {
  try {
    return await request('/auth/mfa/' + suffix, { method, body, token, headers });
  } catch (error) {
    const retryAfter = Number((error.data && error.data.retry_after) || 0) || null;
    throw new MfaError(error.message, error.status, retryAfter);
  }
}

// One credential for a sign-in challenge, then for the management grant. Each
// success may rotate it, so it is swapped on every response.
export function mfaSession(challenge) {
  let credential = challenge.mfa_session_token;
  const call = async (suffix, body, method) => {
    const result = await mfaRequest(suffix, { method, body, token: credential });
    if (result.mfa_management_token) credential = result.mfa_management_token;
    if (result.access_token) setToken(result.access_token);
    return result;
  };

  return {
    // method: 'totp' | 'sms'
    verify: (code, method, rememberDevice) =>
      call('verify', { code, method, remember_device: rememberDevice }),
    sendSignInCode: () => call('resend'),

    setupAuthenticator: () => call('totp/setup', {}),
    confirmAuthenticator: (code, rememberDevice = false) =>
      call('totp/verify', { code, remember_device: rememberDevice }),
    sendPhoneCode: (phoneNumber) => call('sms/send-code', { phone_number: phoneNumber }),
    confirmPhone: (code, rememberDevice = false) =>
      call('sms/verify', { code, remember_device: rememberDevice }),

    status: () => call('status', undefined, 'GET'),
    sendProofCode: () => call('sms/send-code', { phone_number: '' }),
    removeMethod: (method, code, proofMethod) =>
      call('disable', { method, code, verification_method: proofMethod }),
    forgetDevices: (code, proofMethod) =>
      call('trusted-devices/clear', { code, method: proofMethod }),
  };
}

/** Password sign-in that opens factor management instead of signing in. */
export function signInToManageMfa(email, password) {
  return mfaRequest('login', {
    body: { email, password },
    headers: { 'X-Mfa-Action': 'manage' },
  });
}

let resumed;

/** Picks up a pending second factor when /mfa opens. */
export function resumeMfa() {
  resumed ||= (async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('mfa_code');
    if (code) {
      params.delete('mfa_code');
      const rest = params.toString();
      window.history.replaceState(null, '', window.location.pathname + (rest ? '?' + rest : ''));
      const result = await mfaRequest('exchange', { body: { code } });
      if (result.access_token) setToken(result.access_token);
      return result;
    }
    return takeMfaChallenge();
  })();
  return resumed;
}

/** Which sign-in methods the deployment offers, and its MFA policy. */
export async function loadSignInOptions() {
  return api.auth.options();
}

/** provider: 'google' | 'microsoft' | 'facebook' | 'apple' | 'sso' */
export async function signInWithProvider(provider, returnTo, options = {}) {
  return api.auth.loginWithProvider(provider, returnTo, options);
}

/** After the second step: hand the session to a popup, or continue. */
export function finishSignIn(accessToken, returnTo) {
  if (new URLSearchParams(window.location.search).get('popup') === '1' && window.opener) {
    window.opener.postMessage({ access_token: accessToken }, window.location.origin);
    window.close();
    return;
  }
  window.location.href = returnTo;
}
