import moment from 'moment';

export function timeAgo(value) {
  if (!value) return '—';
  const parsed = moment(value);
  return parsed.isValid() ? parsed.fromNow() : '—';
}

export function formatDateTime(value) {
  if (!value) return '—';
  const parsed = moment(value);
  return parsed.isValid() ? parsed.format('D MMM YYYY · HH:mm') : '—';
}

export function formatDay(value) {
  if (!value) return '—';
  const parsed = moment(value);
  return parsed.isValid() ? parsed.format('D MMM YYYY') : '—';
}

/** A lab always shows a name: its own, or one built from its code. */
export function labTitle(lab) {
  const name = String(lab?.name || '').trim();
  if (name) return name;
  const digits = String(lab?.code || '').replace(/\D/g, '');
  return lab?.code ? `Lab ${digits || lab.code}` : 'Untitled lab';
}

export function roleLabel(role) {
  if (!role) return 'Member';
  return role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}