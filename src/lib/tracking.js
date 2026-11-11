import { api } from '@/api/apiClient';
import { storeTrackingOptOut, storedTrackingOptOut } from '@/lib/trackingPreference';

/**
 * The one gate for "Send Usage Statistics".
 *
 * The choice is cached so the app can answer without a request, and it is read
 * again when the app loads so the platform's own analytics follows it too.
 */

export function setTrackingPreference(optOut) {
  storeTrackingOptOut(optOut);
}

export function trackingOptedOut() {
  return storedTrackingOptOut();
}

/** Sends one usage event. Returns false — and sends nothing — when switched off. */
export function trackEvent(eventName, properties = {}) {
  if (trackingOptedOut()) return false;
  try {
    api.analytics.track({ eventName, properties });
    return true;
  } catch {
    return false;
  }
}