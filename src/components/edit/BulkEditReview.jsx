import React from 'react';
import { STATUS_META } from '@/lib/constants';
import { OS_OPTIONS, STORAGE_OPTIONS, CPU_BRAND_OPTIONS } from '@/components/edit/PcConfigFields';

const LABELS = { os: 'Operating system', os_version: 'OS version', ram_gb: 'RAM', storage_gb: 'Storage capacity', storage_type: 'Storage type', cpu_brand: 'Processor brand', cpu_model: 'Processor model' };
const OPTIONS = { os: OS_OPTIONS, storage_type: STORAGE_OPTIONS, cpu_brand: CPU_BRAND_OPTIONS };

export default function BulkEditReview({ value, configuration }) {
  const rows = [
    ...(value.status !== 'unchanged' ? [['Computer status', STATUS_META[value.status]?.label || value.status]] : []),
    ...(value.changeNotes ? [['Notes', value.notes || 'Clear existing notes']] : []),
    ...Object.entries(configuration).map(([key, val]) => [LABELS[key] || key,
      val === '' || val == null ? 'Clear existing value'
        : OPTIONS[key]?.find((option) => option.value === val)?.label
          || (key === 'ram_gb' || key === 'storage_gb' ? `${val} GB` : String(val))]),
  ];
  return (
    <div className="space-y-4">
      <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-secondary/20">
        {rows.map(([label, text]) => (
          <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
            <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
            <dd className="min-w-0 whitespace-pre-wrap break-words text-sm font-medium">{text}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs leading-relaxed text-muted-foreground">Only the fields listed above will change. Computer identifiers, reports and repair history will be preserved.</p>
    </div>
  );
}