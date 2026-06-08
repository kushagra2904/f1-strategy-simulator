import type { Strategy } from "../types/api";
import { formatRaceTime } from "../lib/format";
import { CompoundChip } from "./CompoundChip";

export function TopStrategiesList({ strategies }: { strategies: Strategy[] }) {
  if (!strategies || strategies.length <= 1) return null;

  return (
    <div>
      <p className="hud-label mb-3">Alternative Strategies</p>
      <ol className="space-y-2">
        {strategies.map((s, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-3 border-l-2 border-outline bg-surface-low/40 px-3 py-2 transition-colors hover:border-primary hover:bg-surface-container/60"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`telemetry w-6 text-center text-sm font-bold ${
                  i === 0 ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                P{i + 1}
              </span>
              <div className="flex flex-wrap gap-1">
                {s.strategy.map((st, j) => (
                  <CompoundChip key={j} compound={st.compound} laps={st.length} />
                ))}
              </div>
            </div>
            <span className="telemetry whitespace-nowrap text-sm text-on-surface">
              {formatRaceTime(s.total_time)}
              {s.delta_to_best ? (
                <span className="text-on-surface-variant"> +{s.delta_to_best}s</span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
