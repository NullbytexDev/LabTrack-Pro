import { api } from '@/api/apiClient';

const SESSION_KEY = 'labtrack-session-id';
let pendingRecord = null;

export function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = (crypto.randomUUID && crypto.randomUUID()) || `s-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function describeDevice() {
  const agent = navigator.userAgent;
  if (/android/i.test(agent)) return 'Android device';
  if (/iphone|ipad|ipod/i.test(agent)) return 'iOS device';
  if (/macintosh|mac os/i.test(agent)) return 'Mac';
  if (/windows/i.test(agent)) return 'Windows PC';
  if (/linux/i.test(agent)) return 'Linux device';
  return 'Browser';
}

/** Registers this browser session once — a new page or a reload is still the same session. */
export function recordSession(user) {
  if (!user?.id) return Promise.resolve(null);
  if (pendingRecord) return pendingRecord;
  pendingRecord = api.functions
    .invoke('signInEvents', {
      action: 'record',
      session_id: getSessionId(),
      device: describeDevice(),
      method: 'Email and password or linked provider',
    })
    .catch(() => null);
  return pendingRecord;
}

export function resetSessionRecord() {
  pendingRecord = null;
  sessionStorage.removeItem(SESSION_KEY);
}