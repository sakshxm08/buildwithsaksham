import type { Blocks } from "../../../lib/blog";

const card = "rounded-2xl border border-current/15 bg-current/5";
const fmtNum = (n: number) =>
  Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, "");

export function TldrBox({ items }: { items: string[] }) {
  return (
    <aside className="my-8 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">
        TL;DR
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((t) => (
          <li key={t} className="flex gap-2">
            <span className="text-indigo-500">▸</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function StatCards({ stats }: { stats: Blocks["stats"] }) {
  const cols = stats.length >= 4 ? "md:grid-cols-4" : stats.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
  return (
    <div className={`my-8 grid grid-cols-2 gap-4 ${cols}`}>
      {stats.map((s) => (
        <div key={s.value + s.label} className={`${card} p-4`}>
          <p className="text-3xl font-extrabold text-indigo-500">{s.value}</p>
          <p className="mt-1 text-sm opacity-75">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

export function ChartBlock({ chart }: { chart: NonNullable<Blocks["chart"]> }) {
  const max = Math.max(...chart.items.map((i) => Math.abs(i.value)), 1);
  return (
    <figure className={`my-10 p-6 ${card}`}>
      {chart.title && (
        <figcaption className="text-lg font-semibold">{chart.title}</figcaption>
      )}
      <div className="mt-5 space-y-4">
        {chart.items.map((i) => (
          <div key={i.label} className="group">
            <div className="flex justify-between gap-4 text-sm">
              <span>{i.label}</span>
              <span className="font-semibold tabular-nums">
                {fmtNum(i.value)}
                {chart.unit}
              </span>
            </div>
            <div className="mt-1 h-3 overflow-hidden rounded-full bg-current/10">
              <div
                className="h-full rounded-full bg-indigo-500 transition-colors group-hover:bg-emerald-500"
                style={{ width: `${Math.max(2, (Math.abs(i.value) / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      {chart.note && <p className="mt-4 text-xs opacity-60">{chart.note}</p>}
    </figure>
  );
}

export function FlowBlock({ flow }: { flow: NonNullable<Blocks["flow"]> }) {
  return (
    <figure className={`my-10 p-6 ${card}`}>
      {flow.title && (
        <figcaption className="text-lg font-semibold">{flow.title}</figcaption>
      )}
      {flow.kind === "timeline" ? (
        <ol className="mt-6 space-y-6 border-l-2 border-indigo-500/40 pl-6">
          {flow.steps.map((s) => (
            <li key={s.label + s.text} className="relative">
              <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-indigo-500" />
              <p className="font-semibold">{s.label}</p>
              {s.text && <p className="text-sm opacity-75">{s.text}</p>}
            </li>
          ))}
        </ol>
      ) : (
        <ol className="mt-6 grid gap-4 md:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
          {flow.steps.map((s, i) => (
            <li key={s.label + s.text} className="rounded-xl border border-current/15 p-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="mt-3 font-semibold">{s.label}</p>
              {s.text && <p className="mt-1 text-sm opacity-75">{s.text}</p>}
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}
