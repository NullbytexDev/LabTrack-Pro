const PREFIX = 'labtrack:2fa-pass:';
const TTL_MS = 1000 * 60 * 60 * 24 * 30;

/**
 * The two-factor pass belongs to a signed-in session, not to one browser tab.
 * It is granted after a code is accepted and cleared on sign-out or at the next
 * sign-in, so a fresh sign-in always asks for a code but reopening the app while
 * still signed in does not.
 */
export function hasPass(userId) {
  if (!userId) return false;
  const raw = localStorage.getItem(PREFIX + userId);
  const at = Number(raw);
  return Boolean(raw) && Number.isFinite(at) && Date.now() - at < TTL_MS;
}

export function grantPass(userId) {
  if (userId) localStorage.setItem(PREFIX + userId, String(Date.now()));
}

export function clearPasses() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(PREFIX))
    .forEach((key) => localStorage.removeItem(key));
  Object.keys(sessionStorage)
    .filter((key) => key.startsWith(PREFIX))
    .forEach((key) => sessionStorage.removeItem(key));
}