/**
 * The stored "Send Usage Statistics" choice. Kept in its own module with no
 * imports so the SDK client can read it while it initializes.
 */

export const TRACKING_KEY = 'labtrack-tracking-optout';

/** True when the member has switched usage statistics off. */
export function storedTrackingOptOut() {
  try {
    return window.localStorage.getItem(TRACKING_KEY) === '1';
  } catch {
    // Storage blocked (private mode): send nothing.
    return true;
  }
}

export function storeTrackingOptOut(optOut) {
  try {
    window.localStorage.setItem(TRACKING_KEY, optOut ? '1' : '0');
  } catch {
    // Nothing to remember; the next choice is asked again.
  }
}