import { useEffect, useState } from "react";
import type {
  Driver,
  OptimizeResponse,
  TelemetryResponse,
  Track,
} from "../types/api";
import { fetchTelemetry } from "../lib/api";
import { formatLapTime, formatRaceTime } from "../lib/format";
import { COMPOUND_META } from "../lib/compounds";
import { CompoundChip } from "./CompoundChip";
import { LapTimeChart } from "./LapTimeChart";

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass panel-clip p-4">
      <p className="hud-label">{label}</p>
      <p className="telemetry mt-1 text-xl font-bold text-on-surface">{value}</p>
    </div>
  );
}

export function TelemetryView({
  result,
  driver,
  track,
}: {
  result: OptimizeResponse;
  driver: Driver | null;
  track: Track | null;
}) {
  const [data, setData] = useState<TelemetryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const best = result.best_strategy;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const res = await fetchTelemetry({
          driver: result.driver,
          track: result.track,
          strategy: best.strategy,
          seed: result.seed,
        });
        if (!cancelled) setData(res);
      } catch (err) {
        console.error(err);
        if (!cancelled)
          setError(
            "Telemetry unavailable. The /telemetry endpoint requires the updated backend (run it locally or redeploy).",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [result.driver, result.track, result.seed, best.strategy]);

  if (loading) {
    return (
      <div className="glass panel-clip grid place-items-center py-24">
        <p className="hud-label animate-pulse-glow">Acquiring telemetry…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass panel-clip edge-accent grid place-items-center px-6 py-20 text-center">
        <div className="max-w-md space-y-2">
          <p className="hud-label text-error">Signal Lost</p>
          <p className="text-on-surface-variant">{error}</p>
        </div>
      </div>
    );
  }

  const avgPace =
    data.laps.reduce((sum, l) => sum + l.lap_time, 0) / data.laps.length;

  return (
    <div className="space-y-6">
      {/* readouts */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Readout label="Fastest Lap" value={formatLapTime(data.fastest_lap)} />
        <Readout label="Average Pace" value={formatLapTime(avgPace)} />
        <Readout label="Race Time" value={formatRaceTime(data.total_time)} />
        <Readout label="Stops" value={String(data.stints.length - 1)} />
      </div>

      {/* lap-time trace */}
      <section className="glass panel-clip edge-accent animate-reveal p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="hud-label">Lap-Time Trace</p>
          <p className="text-xs text-on-surface-variant">
            {driver?.name ?? data.driver} · {track?.name ?? data.track} · fastest
            on lap {data.fastest_lap_number}
          </p>
        </div>
        <div className="mt-4">
          <LapTimeChart
            laps={data.laps}
            safetyCarPeriods={data.safety_car_periods}
            fastestLapNumber={data.fastest_lap_number}
            totalLaps={data.track_laps}
          />
        </div>
        {/* legend */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
          {data.stints.map((s) => (
            <span key={s.stint_index} className="flex items-center gap-1.5">
              <CompoundChip compound={s.compound} />
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-full bg-secondary" />
            Fastest lap
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-4"
              style={{ background: "var(--warning)", opacity: 0.3 }}
            />
            Safety car
          </span>
        </div>
      </section>

      {/* stint table */}
      <section
        className="glass panel-clip animate-reveal overflow-x-auto p-6"
        style={{ animationDelay: "100ms" }}
      >
        <p className="hud-label mb-4">Stint Breakdown</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="hud-label text-left">
              <th className="pb-2 font-bold">Stint</th>
              <th className="pb-2 font-bold">Compound</th>
              <th className="pb-2 font-bold">Laps</th>
              <th className="pb-2 text-right font-bold">Tyre Life</th>
              <th className="pb-2 text-right font-bold">Avg</th>
              <th className="pb-2 text-right font-bold">Best</th>
            </tr>
          </thead>
          <tbody className="telemetry">
            {data.stints.map((s) => (
              <tr key={s.stint_index} className="border-t border-outline/50">
                <td className="py-2 text-on-surface-variant">
                  {s.stint_index + 1}
                </td>
                <td className="py-2">
                  <span style={{ color: COMPOUND_META[s.compound].color }}>
                    {COMPOUND_META[s.compound].label}
                  </span>
                </td>
                <td className="py-2 text-on-surface">
                  L{s.start_lap}–{s.end_lap}
                </td>
                <td className="py-2 text-right text-on-surface">{s.length}</td>
                <td className="py-2 text-right text-on-surface">
                  {formatLapTime(s.avg_time)}
                </td>
                <td className="py-2 text-right text-on-surface">
                  {formatLapTime(s.best_time)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
