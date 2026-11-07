import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const TOOLTIP_STYLE = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 12,
  fontSize: 12,
  color: 'hsl(var(--foreground))',
};

export default function StatusDonut({ data, total }) {
  if (!data.length) {
    return (
      <section className="surface p-5">
        <h2 className="text-sm font-semibold">Condition mix</h2>
        <p className="mt-3 text-sm text-muted-foreground">Nothing to chart until computers are added.</p>
      </section>
    );
  }

  return (
    <section className="surface p-5">
      <h2 className="text-sm font-semibold">Condition mix</h2>
      <p className="text-[11px] text-muted-foreground">{total} active computers</p>

      <div className="relative mt-1 h-[168px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={74}
              paddingAngle={data.length > 1 ? 3 : 0}
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((slice) => (
                <Cell key={slice.key} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: 'hsl(var(--foreground))' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {data.map((slice) => (
          <li key={slice.key} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: slice.color }} aria-hidden="true" />
            <span className="truncate">{slice.name}</span>
            <span className="ml-auto tabular-nums text-foreground">{slice.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}