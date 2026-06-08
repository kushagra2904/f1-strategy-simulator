import type { OptimizeResponse } from "../types/api";
import { formatRaceTime } from "../lib/format";
import { useCountUp } from "../lib/useCountUp";
import { CompoundChip } from "./CompoundChip";
import { StrategyTimeline } from "./StrategyTimeline";
import { SafetyCarInfo } from "./SafetyCarInfo";
import { TopStrategiesList } from "./TopStrategiesList";

export function ResultsPanel({ result }: { result: OptimizeResponse }) {
  const best = result.best_strategy;
  const animatedTime = useCountUp(best.total_time);

  const hasAlternatives = result.top_5_strategies.length > 1;

  return (
    <section className="glass panel-clip edge-accent animate-reveal p-6">
      <div className="grid gap-x-8 gap-y-6 lg:grid-cols-2">
        {/* left: headline + chips + stint timeline */}
        <div className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="hud-label">Optimal Race Time</p>
              <p className="telemetry mt-1 text-4xl font-bold text-on-surface text-glow tabular-nums">
                {formatRaceTime(animatedTime)}
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
              <CompoundChip
                key={i}
                compound={stint.compound}
                laps={stint.length}
              />
            ))}
          </div>

          <StrategyTimeline
            strategy={best.strategy}
            totalLaps={result.track_laps}
          />

          {/* safety car sits under the timeline when there are no alternatives
              to balance, otherwise it moves to the right column */}
          {!hasAlternatives && (
            <SafetyCarInfo periods={result.safety_car_periods} />
          )}
        </div>

        {/* right: alternatives + safety car */}
        {hasAlternatives && (
          <div className="space-y-6">
            <TopStrategiesList strategies={result.top_5_strategies} />
            <SafetyCarInfo periods={result.safety_car_periods} />
          </div>
        )}
      </div>
    </section>
  );
}
