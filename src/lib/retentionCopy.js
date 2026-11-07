export function RETENTION_HINT(label) {
  return `Notifications older than ${label} are deleted automatically by the server job, and each time an instructor opens this page. Hardware history is kept separately and is never removed by this setting.`;
}