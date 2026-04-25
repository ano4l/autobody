"use client";

import type { SalesPoint } from "@/lib/types";

interface Props {
  data: SalesPoint[];
}

export function SalesSparkline({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-40 items-center justify-center text-xs text-ink-500">
        No sales in this range
      </div>
    );
  }

  const width = 640;
  const height = 160;
  const padX = 20;
  const padY = 20;
  const xs = data.map((_, i) => padX + (i * (width - 2 * padX)) / Math.max(1, data.length - 1));
  const max = Math.max(...data.map((p) => Number(p.revenue)));
  const ys = data.map((p) => {
    const v = Number(p.revenue);
    const norm = max === 0 ? 0 : v / max;
    return height - padY - norm * (height - 2 * padY);
  });

  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(" ");
  const area =
    `${path} L ${xs[xs.length - 1].toFixed(1)} ${height - padY} L ${xs[0].toFixed(1)} ${height - padY} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full" role="img" aria-label="Sales trend">
      <defs>
        <linearGradient id="sales-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#C96442" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#C96442" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sales-fill)" />
      <path d={path} fill="none" stroke="#C96442" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r={2.5} fill="#C96442" />
      ))}
    </svg>
  );
}
