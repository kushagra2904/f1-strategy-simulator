import type { Compound, Driver, OptimizeResponse, Track } from "../types/api";
import { formatRaceTime } from "../lib/format";
import { COMPOUND_META } from "../lib/compounds";
import { CompoundChip } from "./CompoundChip";
import { StrategyTimeline } from "./StrategyTimeline";
import { SafetyCarInfo } from "./SafetyCarInfo";

const COMPOUND_ORDER: Compound[] = ["SOFT", "MEDIUM", "HARD"];

/** Total laps run on each compound across the optimal stint plan. */
function compoundUsage(strategy: { compound: Compound; length: number }[]) {
  const totals: Record<Compound, number> = { SOFT: 0, MEDIUM: 0, HARD: 0 };
  for (const s of strategy) totals[s.compound] += s.length;
  return totals;
}

export function StrategyView({
  result,
  driver,
  track,
}: {
  result: OptimizeResponse;
  driver: Driver | null;
  track: Track | null;
}) {
  const best = result.best_strategy;
  const usage = compoundUsage(best.strategy);
  const maxDelta = Math.max(
    ...result.top_5_strategies.map((s) => s.delta_to_best ?? 0),
    0.01,
  );

  return (
    <div className="space-y-6">
      {/* ---- Recommended strategy headline ---- */}
      <section className="glass panel-clip edge-accent animate-reveal p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="hud-label">Recommended Strategy</p>
            <h2 className="mt-1 font-display text-2xl font-bold uppercase tracking-wide text-on-surface text-glow">
              {best.strategy.length - 1}-Stop
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              {driver?.name ?? result.driver} · {track?.name ?? result.track} ·{" "}
              {result.track_laps} laps
            </p>
          </div>
          <div className="text-right">
            <p className="hud-label">Projected Race Time</p>
            <p className="telemetry mt-1 text-3xl font-bold text-primary">
              {formatRaceTime(best.total_time)}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {best.strategy.map((stint, i) => (
            <CompoundChip key={i} compound={stint.compound} laps={stint.length} />
          ))}
        </div>
        <div className="mt-4">
          <StrategyTimeline strategy={best.strategy} totalLaps={result.track_laps} />
        </div>
      </section>

      {/* ---- Compound allocation ---- */}
      <section
        className="glass panel-clip animate-reveal p-6"
        style={{ animationDelay: "80ms" }}
      >
        <p className="hud-label">Compound Allocation</p>
        <div className="mt-4 space-y-3">
          {COMPOUND_ORDER.filter((c) => usage[c] > 0).map((c) => {
            const meta = COMPOUND_META[c];
            const pct = Math.round((usage[c] / result.track_laps) * 100);
            return (
              <div key={c} className="flex items-center gap-3">
                <span className="w-16">
                  <CompoundChip compound={c} />
                </span>
                <div className="h-2 flex-1 overflow-hidden bg-surface-low">
                  <div
                    className="animate-fill h-full"
                    style={{ width: `${pct}%`, background: meta.color }}
                  />
                </div>
                <span className="telemetry w-20 text-right text-sm text-on-surface">
                  {usage[c]} laps
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---- Top-5 comparison ---- */}
      <section
        className="glass panel-clip animate-reveal p-6"
        style={{ animationDelay: "160ms" }}
      >
        <p className="hud-label mb-4">Strategy Comparison</p>
        <ol className="space-y-3">
          {result.top_5_strategies.map((s, i) => {
            const delta = s.delta_to_best ?? 0;
            return (
              <li
                key={i}
                className={`border-l-2 p-3 transition-colors ${
                  i === 0
                    ? "border-primary bg-primary-muted/20"
                    : "border-outline bg-surface-low/40 hover:border-outline-strong"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`telemetry text-sm font-bold ${
                        i === 0 ? "text-primary" : "text-on-surface-variant"
                      }`}
                    >
                      P{i + 1}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {s.strategy.map((st, j) => (
                        <CompoundChip
                          key={j}
                          compound={st.compound}
                          laps={st.length}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="telemetry whitespace-nowrap text-sm text-on-surface">
                    {formatRaceTime(s.total_time)}
                  </span>
                </div>

                {/* delta-to-best bar */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden bg-surface-low">
                    <div
                      className="h-full bg-primary/70"
                      style={{ width: `${(delta / maxDelta) * 100}%` }}
                    />
                  </div>
                  <span className="telemetry w-16 text-right text-xs text-on-surface-variant">
                    {delta === 0 ? "BEST" : `+${delta.toFixed(2)}s`}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ---- Safety car context ---- */}
      <section
        className="glass panel-clip animate-reveal p-6"
        style={{ animationDelay: "240ms" }}
      >
        <SafetyCarInfo periods={result.safety_car_periods} />
      </section>
    </div>
  );
}
