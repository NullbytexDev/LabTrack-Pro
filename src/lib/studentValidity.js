const STUDENT_MONTHS = 48;
const GRACE_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

/** The 48-month student window and the 3-day grace that follows it. */
export function studentWindow(profile) {
  if (!profile || profile.role !== 'student') return null;
  let until = profile.student_valid_until ? new Date(profile.student_valid_until) : null;
  if (!until || Number.isNaN(until.getTime())) {
    until = new Date(profile.created_date || Date.now());
    until.setMonth(until.getMonth() + STUDENT_MONTHS);
  }
  const deletion = new Date(until.getTime() + GRACE_DAYS * DAY_MS);
  return {
    validUntil: until,
    deletionDue: deletion,
    expired: Date.now() >= until.getTime(),
  };
}