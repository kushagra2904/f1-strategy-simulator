import type { Stint } from "../types/api";
import { COMPOUND_META } from "../lib/compounds";

export function StrategyTimeline({
  strategy,
  totalLaps,
}: {
  strategy: Stint[];
  totalLaps: number;
}) {
  if (!strategy || strategy.length === 0) return null;

  return (
    <div>
      <p className="hud-label mb-2">Stint Projection</p>
      <div className="flex h-9 w-full overflow-hidden border border-outline bg-surface-low">
        {strategy.map((stint, i) => {
          const meta = COMPOUND_META[stint.compound];
          return (
            <div
              key={i}
              className="animate-fill relative flex items-center justify-center border-r border-black/30 transition-[filter] last:border-r-0 hover:brightness-110"
              style={{
                flexGrow: stint.length,
                background: meta.color,
                color: meta.fg,
                animationDelay: `${i * 110}ms`,
              }}
              title={`${meta.label} — ${stint.length} laps`}
            >
              <span className="telemetry text-xs font-bold">{stint.length}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex items-center justify-between">
        <span className="hud-label">Lap 1</span>
        <span className="hud-label">Lap {totalLaps}</span>
      </div>
    </div>
  );
}
