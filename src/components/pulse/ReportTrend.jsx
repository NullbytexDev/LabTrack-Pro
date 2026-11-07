import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TOOLTIP_STYLE = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 12,
  fontSize: 12,
};

const DAYS = 14;

export default function ReportTrend({ reports }) {
  const { data, total } = useMemo(() => {
    const buckets = Array.from({ length: DAYS }, (_, index) => {
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      day.setDate(day.getDate() - (DAYS - 1 - index));
      return {
        key: day.toISOString().slice(0, 10),
        label: day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        reported: 0,
        resolved: 0,
      };
    });
    const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));

    reports.forEach((report) => {
      const submitted = byKey.get((report.created_date || '').slice(0, 10));
      if (submitted) submitted.reported += 1;
      if (report.status === 'resolved' && report.handled_at) {
        const handled = byKey.get(report.handled_at.slice(0, 10));
        if (handled) handled.resolved += 1;
      }
    });

    return { data: buckets, total: buckets.reduce((sum, bucket) => sum + bucket.reported, 0) };
  }, [reports]);

  return (
    <section className="surface p-5">
      <header className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">Report pressure · 14 days</h2>
        <span className="text-[11px] text-muted-foreground">{total} reported</span>
      </header>

      {total === 0 ? (
        <p className="mt-4 rounded-2xl border border-border/70 bg-secondary/40 px-4 py-6 text-center text-sm text-muted-foreground">
          No faults reported in the last two weeks. The labs are quiet.
        </p>
      ) : (
        <div className="mt-3 h-[190px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 6, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pulseTrendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={18}
              />
              <YAxis
                allowDecimals={false}
                width={34}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: 'hsl(var(--foreground))' }} />
              <Area
                type="monotone"
                dataKey="reported"
                name="Reported"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#pulseTrendFill)"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                name="Resolved"
                stroke="hsl(var(--brand-teal))"
                strokeWidth={2}
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}