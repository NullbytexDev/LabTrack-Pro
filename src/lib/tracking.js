import { storeTrackingOptOut, storedTrackingOptOut } from '@/lib/trackingPreference';

/**
 * The "Send Usage Statistics" preference.
 *
 * This frontend ships no analytics, pixels or third-party trackers, so no event
 * ever leaves the browser. The stored choice is kept so the switch the member
 * sees stays consistent across sessions and devices.
 */

export function setTrackingPreference(optOut) {
  storeTrackingOptOut(optOut);
}

export function trackingOptedOut() {
  return storedTrackingOptOut();
}

/** Present for the interface's event hooks; intentionally sends nothing. */
export function trackEvent() {
  return false;
}
