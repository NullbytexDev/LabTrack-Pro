export const ROLE_META = {
  student: {
    label: 'Student',
    blurb: 'Report a faulty computer in the lab you use.',
    referenceLabel: 'Roll number',
    accent: 'from-brand-teal to-brand-mint',
  },
  lab_assistant: {
    label: 'Lab Assistant',
    blurb: 'Keep your assigned lab running and log faults.',
    referenceLabel: 'Lab Assistant ID',
    accent: 'from-brand-mint to-brand-gold',
  },
  instructor: {
    label: 'Instructor',
    blurb: 'Review reports, repair statuses and manage every lab.',
    referenceLabel: 'Instructor ID',
    accent: 'from-brand-gold to-brand-teal',
  },
};

export const ROLE_ORDER = ['student', 'lab_assistant', 'instructor'];

// Colour language for the whole app:
// available = green, minor issue = yellow, need repair = red, repaired = blue.
export const STATUS_META = {
  available: {
    label: 'Available',
    short: 'Available',
    hint: 'Working and ready to use',
    tone: 'text-status-available',
    dot: 'bg-status-available',
    chip: 'border-status-available/40 bg-status-available/12 text-status-available',
    bar: 'bg-status-available',
    ring: 'ring-status-available/45',
  },
  minor_issue: {
    label: 'Minor Issue',
    short: 'Minor',
    hint: 'Usable with a small fault',
    tone: 'text-status-minor',
    dot: 'bg-status-minor',
    chip: 'border-status-minor/40 bg-status-minor/12 text-status-minor',
    bar: 'bg-status-minor',
    ring: 'ring-status-minor/45',
  },
  need_repair: {
    label: 'Need Repair',
    short: 'Repair',
    hint: 'Out of service until repaired',
    tone: 'text-status-repair',
    dot: 'bg-status-repair',
    chip: 'border-status-repair/40 bg-status-repair/12 text-status-repair',
    bar: 'bg-status-repair',
    ring: 'ring-status-repair/45',
  },
  repaired: {
    label: 'Repaired',
    short: 'Repaired',
    hint: 'Fixed and awaiting use',
    tone: 'text-status-repaired',
    dot: 'bg-status-repaired',
    chip: 'border-status-repaired/40 bg-status-repaired/12 text-status-repaired',
    bar: 'bg-status-repaired',
    ring: 'ring-status-repaired/45',
  },
  revision_pending: {
    label: 'Revision Pending',
    short: 'Revision',
    hint: 'The reporter says the problem is not fixed',
    tone: 'text-status-revision',
    dot: 'bg-status-revision',
    chip: 'border-status-revision/45 bg-status-revision/12 text-status-revision',
    bar: 'bg-status-revision',
    ring: 'ring-status-revision/45',
  },
};

/**
 * Colour of a timeline dot on the history pages.
 * A status change is coloured by the status the computer ended up in, so a
 * computer set to Available is always green — never the action's own colour.
 */
export function eventTone(event) {
  const status = STATUS_META[event?.new_status];
  if (status) return status.dot;
  return REPORT_ACTION_META[event?.action]?.tone || 'bg-muted-foreground';
}

export const STATUS_ORDER = ['available', 'minor_issue', 'need_repair', 'repaired'];

// Only instructors may report these two conditions.
export const INSTRUCTOR_STATUSES = ['repaired', 'available'];

export const NAV_ITEMS = [
  { to: '/', label: 'Overview', key: 'overview', access: 'public' },
  { to: '/labs', label: 'Labs', key: 'labs', access: 'public' },
  { to: '/layout', label: 'Lab Layout', key: 'layout', access: 'public' },
  { to: '/reports', label: 'Reports', key: 'reports', access: 'signed-in' },
  { to: '/history', label: 'History', key: 'history', access: 'public' },
  { to: '/pulse', label: 'Lab Pulse', key: 'pulse', access: 'public' },
  { to: '/notifications', label: 'Notifications', key: 'notifications', access: 'signed-in' },
  { to: '/inbox', label: 'Inbox', key: 'inbox', access: 'signed-in' },
  { to: '/signin-logs', label: 'Sign-in Logs', key: 'signinlogs', access: 'teaser' },
  { to: '/edit', label: 'Edit Labs & PCs', key: 'edit', access: 'staff' },
  { to: '/about', label: 'About', key: 'about', access: 'public' },
];

export const REPORT_ACTION_META = {
  report_submitted: { label: 'Report submitted', tone: 'bg-status-minor' },
  report_reviewed: { label: 'Report in review', tone: 'bg-brand' },
  report_resolved: { label: 'Report resolved', tone: 'bg-status-available' },
  report_dismissed: { label: 'Report dismissed', tone: 'bg-muted-foreground' },
  status_changed: { label: 'Status changed', tone: 'bg-status-repaired' },
  pc_created: { label: 'Computer added', tone: 'bg-brand-teal' },
  pc_updated: { label: 'Computer updated', tone: 'bg-muted-foreground' },
  pc_archived: { label: 'Computer archived', tone: 'bg-muted-foreground' },
  pc_restored: { label: 'Computer restored', tone: 'bg-brand' },
  lab_created: { label: 'Lab created', tone: 'bg-brand' },
  lab_updated: { label: 'Lab updated', tone: 'bg-muted-foreground' },
  lab_archived: { label: 'Lab archived', tone: 'bg-muted-foreground' },
  lab_restored: { label: 'Lab restored', tone: 'bg-brand' },
  lab_deleted: { label: 'Lab deleted', tone: 'bg-status-repair' },
  account_created: { label: 'Account created', tone: 'bg-brand-teal' },
  account_updated: { label: 'Account updated', tone: 'bg-brand-teal' },
};

export const HISTORY_FILTERS = [
  { value: '', label: 'All activity' },
  { value: 'report_submitted', label: 'Reports submitted' },
  { value: 'report_resolved', label: 'Reports resolved' },
  { value: 'status_changed', label: 'Status changes' },
  { value: 'pc_created', label: 'Inventory changes' },
];