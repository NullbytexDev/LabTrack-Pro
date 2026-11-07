// Notifications — role-aware: instructor report inbox, and member report updates
import React, { useCallback, useEffect, useState } from 'react';
import { api } from '@/api/client';
import PageTexture from '@/components/common/PageTexture';
import PageLoader from '@/components/common/PageLoader';
import SignInRequired from '@/components/common/SignInRequired';
import EmptyState from '@/components/common/EmptyState';
import NotificationIllustration from '@/components/common/NotificationIllustration';
import NotificationCard from '@/components/notifications/NotificationCard';
import NotificationDetail from '@/components/notifications/NotificationDetail';
import UpdateCard from '@/components/notifications/UpdateCard';
import RevisionDialog from '@/components/notifications/RevisionDialog';
import DeleteNotificationDialog from '@/components/notifications/DeleteNotificationDialog';
import useProfile from '@/hooks/useProfile';
import { RETENTION_HINT } from '@/lib/retentionCopy';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Bell, Clock, Inbox, BellRing, Trash2 } from 'lucide-react';

const TABS = [
  { value: 'open', label: 'Open' },
  { value: 'in_review', label: 'In review' },
  { value: 'closed', label: 'Resolved' },
  { value: 'all', label: 'All' },
];

export default function Notifications() {
  const { user, role, isInstructor, loading: profileLoading } = useProfile();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('open');
  const [active, setActive] = useState(null);
  const [revisionTarget, setRevisionTarget] = useState(null);
  const [savingRetention, setSavingRetention] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await api.functions.invoke('listNotifications', {});
      setData(response.data);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.error || 'Notifications could not be loaded.');
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  // New updates and read flags appear on their own, without a page refresh.
  useEffect(() => {
    if (!user) return;
    const timer = window.setInterval(load, 20000);
    const refresh = () => load();
    window.addEventListener('focus', refresh);
    window.addEventListener('labtrack:notifications-updated', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('labtrack:notifications-updated', refresh);
    };
  }, [user, load]);

  const markRead = async (notification) => {
    if (notification.is_read) return;
    try {
      await api.functions.invoke('listNotifications', {
        action: 'mark_read',
        notification_id: notification.id,
      });
      window.dispatchEvent(new Event('labtrack:notifications-updated'));
      load();
    } catch {
      // A failed read-flag update must not block the page.
    }
  };

  const changeRetention = async (value) => {
    setSavingRetention(true);
    try {
      const response = await api.functions.invoke('retentionSettings', { action: 'set', value });
      setData((current) => (current ? { ...current, retention: { ...current.retention, ...response.data } } : current));
      toast({ title: 'Retention updated', description: `Notifications now expire after ${response.data.label}.` });
      load();
    } catch (err) {
      toast({ title: 'Could not save', description: err?.response?.data?.error || 'Try again.', variant: 'destructive' });
    } finally {
      setSavingRetention(false);
    }
  };

  const deleteNotification = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.functions.invoke('listNotifications', { action: 'delete', notification_id: deleteTarget.id });
      if (active?.id === deleteTarget.id) setActive(null);
      setDeleteTarget(null);
      await load();
      window.dispatchEvent(new Event('labtrack:notifications-updated'));
      toast({ title: 'Notification deleted' });
    } catch (err) {
      toast({ title: 'Could not delete', description: err?.response?.data?.error || 'Try again.', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const deleteAllNotifications = async () => {
    setDeleting(true);
    try {
      await api.functions.invoke('listNotifications', { action: 'delete_all' });
      setDeleteAllOpen(false);
      await load();
      window.dispatchEvent(new Event('labtrack:notifications-updated'));
      toast({ title: 'Notifications cleared', description: 'Every notification addressed to you has been removed.' });
    } catch (err) {
      toast({ title: 'Could not delete', description: err?.response?.data?.error || 'Try again.', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const notifications = data?.notifications || [];
  const updates = data?.updates || [];
  const filtered = notifications.filter((item) => {
    if (tab === 'all') return true;
    if (tab === 'closed') return item.report_status === 'resolved' || item.report_status === 'dismissed';
    // A follow-up awaiting another look is still an open issue for the instructor.
    if (tab === 'open') return item.report_status === 'open' || item.report_status === 'revision_pending';
    return item.report_status === tab;
  });

  return (
    <div className="relative">
      <PageTexture variant="rings" />
      <div className="mx-auto w-full max-w-5xl px-4 pt-12 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              {isInstructor ? 'Instructor inbox' : 'Your notifications'}
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">
              {isInstructor ? 'Reports from the labs' : 'Updates on your reports'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {isInstructor
                ? 'Every student and lab assistant report lands here. Reviewing a report updates the computer and tells the reporter what you found.'
                : 'When an instructor acts on a report you filed, their note appears here. If the fault is still there, tell them from this page.'}
            </p>
          </div>
          {data && (
            <div className="flex flex-wrap gap-2">
              {data.counts?.unread > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <BellRing className="h-3.5 w-3.5" aria-hidden="true" /> {data.counts.unread} unread
                </span>
              )}
              {isInstructor && (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-status-minor/30 bg-status-minor/10 px-3 py-1 text-xs font-medium text-status-minor">
                    <Bell className="h-3.5 w-3.5" aria-hidden="true" /> {data.counts?.open || 0} open
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-xs">
                    <Inbox className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" /> {data.counts?.inReview || 0} in review
                  </span>
                </>
              )}
              {data.counts?.revision > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-status-revision/40 bg-status-revision/10 px-3 py-1 text-xs font-medium text-status-revision">
                  {data.counts.revision} awaiting revision
                </span>
              )}
            </div>
          )}
        </header>

        {profileLoading ? (
          <PageLoader label="Checking permissions" />
        ) : !user ? (
          <div className="mt-6">
            <SignInRequired
              title="Sign-in required"
              description="Notifications are tied to your LabTrack account. Sign in to see report updates addressed to you."
            />
          </div>
        ) : (
          <>
            {isInstructor && (
              <section aria-label="Notification retention" className="surface mt-7 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                      <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">Notification retention</p>
                      <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
                        {data
                          ? RETENTION_HINT(data.retention.label)
                          : 'Expired notifications are removed by the server, not by a browser timer.'}
                      </p>
                    </div>
                  </div>
                  <div className="sm:w-52">
                    <Select value={data?.retention?.value || ''} onValueChange={changeRetention} disabled={!data || savingRetention}>
                      <SelectTrigger aria-label="Notification retention period">
                        <SelectValue placeholder="Loading…" />
                      </SelectTrigger>
                      <SelectContent>
                        {(data?.retention?.options || []).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {data?.removedNow > 0 && (
                      <p className="mt-1.5 text-[11px] text-muted-foreground">{data.removedNow} expired removal(s) applied just now.</p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {error && (
              <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/[0.07] px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}

            {isInstructor && (
              <div role="tablist" aria-label="Filter notifications" className="mt-6 flex flex-wrap gap-1.5">
                {TABS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    role="tab"
                    aria-selected={tab === item.value}
                    onClick={() => setTab(item.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      tab === item.value
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-border/70 bg-card/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 space-y-3">
              {data === null && !error && <PageLoader label="Loading notifications" />}

              {data && isInstructor && filtered.length === 0 && (
                <EmptyState
                  illustration={<NotificationIllustration />}
                  title={tab === 'open' ? 'No open reports' : 'Nothing here right now'}
                  description={
                    tab === 'open'
                      ? 'When a student or lab assistant reports an issue, it appears here for review.'
                      : 'Try another filter to see reports at other stages.'
                  }
                />
              )}
              {data &&
                isInstructor &&
                filtered.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onOpen={(item) => {
                      setActive(item);
                      markRead(item);
                    }}
                  />
                ))}

              {data && updates.length > 0 && (
                <section aria-label="Updates addressed to you" className="pt-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {isInstructor ? 'Review updates for instructors' : 'Report updates'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setDeleteAllOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" /> Delete all
                    </button>
                  </div>
                  <div className="space-y-3">
                    {updates.map((notification) => (
                      <UpdateCard
                        key={notification.id}
                        notification={notification}
                        onOpen={isInstructor ? markRead : markRead}
                        onRevision={isInstructor ? undefined : setRevisionTarget}
                        onDelete={setDeleteTarget}
                      />
                    ))}
                  </div>
                </section>
              )}

              {data && !isInstructor && updates.length === 0 && (
                <EmptyState
                  illustration={<NotificationIllustration />}
                  title="No updates yet"
                  description="When an instructor reviews a report you filed, their note lands here with the computer and lab."
                />
              )}
            </div>
          </>
        )}
      </div>

      <NotificationDetail
        notification={active}
        open={Boolean(active)}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
        onUpdated={() => {
          load();
          window.dispatchEvent(new Event('labtrack:notifications-updated'));
        }}
      />

      <RevisionDialog
        notification={revisionTarget}
        open={Boolean(revisionTarget)}
        onOpenChange={(open) => {
          if (!open) setRevisionTarget(null);
        }}
        onSubmitted={load}
      />

      <DeleteNotificationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete this notification?"
        description={
          deleteTarget
            ? `${deleteTarget.pc_identifier || 'This update'}${deleteTarget.lab_name ? ` in ${deleteTarget.lab_name}` : ''} will be removed from your notifications. The report itself is not affected.`
            : ''
        }
        onConfirm={deleteNotification}
        busy={deleting}
      />

      <DeleteNotificationDialog
        open={deleteAllOpen}
        onOpenChange={setDeleteAllOpen}
        title="Delete all your notifications?"
        description="Every notification addressed to you will be removed. Reports, computers and labs are not affected."
        confirmLabel="Delete all"
        onConfirm={deleteAllNotifications}
        busy={deleting}
      />
    </div>
  );
}