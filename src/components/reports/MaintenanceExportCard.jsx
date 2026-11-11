import React, { useEffect, useRef, useState } from 'react';
import { api } from '@/api/apiClient';
import { Image } from '@/components/ui/image';
import { MEDIA_ORIGIN } from '@/components/ui/image-helpers';
import { buildMaintenancePdf, maintenanceCsv } from '@/lib/maintenancePdf';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Download, FileSpreadsheet, FileText, Loader2, TriangleAlert } from 'lucide-react';

// The app's own report artwork, used as the section preview.
const PREVIEW_ART = `${MEDIA_ORIGIN}/images/public/33441a290_generated_image.png`;

const FORMATS = [
  {
    key: 'pdf',
    label: 'PDF report',
    note: 'Summary, repaired computers and the full work log',
    ext: '.pdf',
    icon: FileText,
  },
  {
    key: 'csv',
    label: 'CSV log',
    note: 'The same rows, ready for a spreadsheet',
    ext: '.csv',
    icon: FileSpreadsheet,
  },
];

export default function MaintenanceExportCard() {
  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState('');
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const resetTimer = useRef(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    []
  );

  const busy = Boolean(activeKey);

  const selectFormat = () => {
    setError('');
    setSaved('');
    setOpen((value) => !value);
  };

  const download = async (format) => {
    if (busy) return;
    setActiveKey(format.key);
    setError('');
    setSaved('');

    try {
      const response = await api.functions.invoke('maintenanceReport', {});
      const data = response.data;
      if (!data || data.error) throw new Error(data?.error || 'The report could not be built.');

      const stamp = new Date().toISOString().slice(0, 10);
      const filename = `labtrack-maintenance-${stamp}${format.ext}`;

      if (format.key === 'pdf') {
        buildMaintenancePdf(data).save(filename);
      } else {
        const blob = new Blob([maintenanceCsv(data)], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      }

      setSaved(filename);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setSaved(''), 6000);
    } catch (err) {
      setError(err?.message || 'The report could not be built.');
    } finally {
      setActiveKey('');
    }
  };

  return (
    <section className="surface relative overflow-hidden">
      <div aria-hidden="true" className="tex-stripes pointer-events-none absolute inset-x-0 top-0 h-40 opacity-40" />

      <div className="relative p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/25">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold">Maintenance report</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              One clean file with every repair, status change and computer marked repaired.
            </p>
          </div>
        </div>

        <div className="relative mt-4 overflow-hidden rounded-2xl border border-border/70">
          <Image
            src={PREVIEW_ART}
            alt="Preview of the LabTrack Pro maintenance report"
            fittingType="fill"
            className="h-36 w-full"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent"
          />
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
            <span className="glass-chip text-[10px] uppercase tracking-[0.16em]">Report preview</span>
            <span className="mono-id rounded-full bg-background/70 px-2 py-0.5 text-[10px] text-muted-foreground backdrop-blur-sm">
              PDF · CSV
            </span>
          </div>
          {busy && <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-primary/15" />}
        </div>

        <button
          type="button"
          onClick={selectFormat}
          aria-expanded={open}
          className={cn(
            'glow-hover mt-4 flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold',
            open
              ? 'border-primary/45 bg-primary/10 text-primary'
              : 'border-primary/30 bg-primary/[0.06] text-primary hover:bg-primary/[0.12]'
          )}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Select format
          <ChevronDown className={cn('h-4 w-4 transition-transform duration-300', open && 'rotate-180')} aria-hidden="true" />
        </button>

        <div
          className={cn(
            'grid transition-all duration-300 ease-out',
            open ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <div className="overflow-hidden">
            <div
              role="group"
              aria-label="Report formats"
              className="overflow-hidden rounded-2xl border border-border bg-card/70"
            >
              {FORMATS.map((format, index) => {
                const Icon = format.icon;
                const working = activeKey === format.key;
                return (
                  <button
                    key={format.key}
                    type="button"
                    disabled={busy}
                    aria-busy={working}
                    onClick={() => download(format)}
                    className={cn(
                      'group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-primary/[0.06] disabled:cursor-not-allowed disabled:opacity-70',
                      index > 0 && 'border-t border-border/60'
                    )}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{format.label}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{format.note}</span>
                    </span>
                    <span className="ml-auto shrink-0 text-muted-foreground">
                      {working ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
                      ) : (
                        <span className="mono-id text-xs">{format.ext}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {busy && (
          <p className="mt-3 flex items-center gap-2 text-xs text-primary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Building your report…
          </p>
        )}

        {!busy && saved && (
          <p className="mt-3 flex items-center gap-2 text-xs text-status-available">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Saved to your downloads
            <span className="mono-id truncate text-muted-foreground">{saved}</span>
          </p>
        )}

        {error && (
          <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-destructive">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    </section>
  );
}