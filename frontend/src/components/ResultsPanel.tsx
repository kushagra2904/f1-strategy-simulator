import type { OptimizeResponse } from "../types/api";
import { formatRaceTime } from "../lib/format";
import { CompoundChip } from "./CompoundChip";
import { StrategyTimeline } from "./StrategyTimeline";
import { SafetyCarInfo } from "./SafetyCarInfo";
import { TopStrategiesList } from "./TopStrategiesList";

export function ResultsPanel({ result }: { result: OptimizeResponse }) {
  const best = result.best_strategy;

  return (
    <section className="glass space-y-6 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="hud-label">Optimal Race Time</p>
          <p className="telemetry mt-1 text-4xl font-bold text-on-surface">
            {formatRaceTime(best.total_time)}
          </p>
        </div>
        <div className="text-right">
          <p className="hud-label">Stops</p>
          <p className="telemetry mt-1 text-3xl font-bold text-primary">
            {best.strategy.length - 1}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {best.strategy.map((stint, i) => (
          <CompoundChip key={i} compound={stint.compound} laps={stint.length} />
        ))}
      </div>

      <StrategyTimeline strategy={best.strategy} totalLaps={result.track_laps} />
      <SafetyCarInfo periods={result.safety_car_periods} />
      <TopStrategiesList strategies={result.top_5_strategies} />
    </section>
  );
}
