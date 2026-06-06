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
            className="flex items-center justify-between gap-3 border border-outline/60 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="telemetry text-on-surface-variant">#{i + 1}</span>
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
