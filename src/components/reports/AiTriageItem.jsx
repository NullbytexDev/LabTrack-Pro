const PRIORITY = {
  high: { label: 'High', chip: 'border-status-repair/40 bg-status-repair/10 text-status-repair' },
  medium: { label: 'Medium', chip: 'border-status-minor/40 bg-status-minor/10 text-status-minor' },
  low: { label: 'Low', chip: 'border-border/70 bg-secondary/60 text-muted-foreground' },
};

export default function AiTriageItem({ item }) {
  const priority = PRIORITY[item.priority] || PRIORITY.medium;

  return (
    <li className="rounded-2xl border border-border/70 bg-secondary/30 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priority.chip}`}>
          {priority.label}
        </span>
        <span className="mono-id text-xs font-semibold">{item.pc_identifier || 'Computer'}</span>
        <span className="text-[11px] text-muted-foreground">{item.lab_name}</span>
      </div>
      {item.reason && <p className="mt-2 text-xs leading-relaxed text-foreground/85">{item.reason}</p>}
      {item.action && (
        <p className="mt-1.5 text-xs leading-relaxed text-primary">
          <span className="font-semibold">Next: </span>
          {item.action}
        </p>
      )}
    </li>
  );
}