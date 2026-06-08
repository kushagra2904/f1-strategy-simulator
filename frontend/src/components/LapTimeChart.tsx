import { useMemo, useState } from "react";
import type { LapTelemetry, SafetyCarPeriod } from "../types/api";
import { COMPOUND_META } from "../lib/compounds";
import { formatLapTime } from "../lib/format";

// viewBox geometry — the SVG scales to its container while keeping this ratio.
const VW = 820;
const VH = 340;
const PAD = { top: 20, right: 16, bottom: 34, left: 58 };
const PLOT_W = VW - PAD.left - PAD.right;
const PLOT_H = VH - PAD.top - PAD.bottom;

/**
 * Hand-built SVG lap-time trace. Faster laps sit higher; the line is segmented
 * by tyre compound, with pit-stop markers, safety-car bands, the fastest lap
 * highlighted, and a hover crosshair + readout. No chart dependency.
 */
export function LapTimeChart({
  laps,
  safetyCarPeriods,
  fastestLapNumber,
  totalLaps,
}: {
  laps: LapTelemetry[];
  safetyCarPeriods: SafetyCarPeriod[];
  fastestLapNumber: number;
  totalLaps: number;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const { xFor, yFor, tMin, tMax, segments, pitLaps, byLap } = useMemo(() => {
    const times = laps.map((l) => l.lap_time);
    const lo = Math.min(...times);
    const hi = Math.max(...times);
    const pad = (hi - lo) * 0.12 || 1;
    const tMin = lo - pad;
    const tMax = hi + pad;

    const xFor = (lap: number) =>
      PAD.left +
      (totalLaps > 1 ? ((lap - 1) / (totalLaps - 1)) * PLOT_W : PLOT_W / 2);
    // smaller time -> higher on screen (top)
    const yFor = (t: number) =>
      PAD.top + ((t - tMin) / (tMax - tMin)) * PLOT_H;

    // group consecutive laps into stints for per-compound colouring
    const segments: LapTelemetry[][] = [];
    for (const l of laps) {
      const cur = segments[segments.length - 1];
      if (cur && cur[0].stint_index === l.stint_index) cur.push(l);
      else segments.push([l]);
    }

    const pitLaps = laps.filter((l) => l.pit_in).map((l) => l.lap);
    const byLap = new Map(laps.map((l) => [l.lap, l]));

    return { xFor, yFor, tMin, tMax, segments, pitLaps, byLap };
  }, [laps, totalLaps]);

  const baseline = PAD.top + PLOT_H;

  // y-axis ticks (lap-time values)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => tMax - f * (tMax - tMin));
  // x-axis ticks (lap numbers)
  const step = totalLaps > 40 ? 10 : totalLaps > 20 ? 5 : 2;
  const xTicks: number[] = [1];
  for (let l = step; l < totalLaps; l += step) xTicks.push(l);
  xTicks.push(totalLaps);

  const hoverLap = hover != null ? byLap.get(hover) ?? null : null;

  function handleMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * VW;
    const frac = (px - PAD.left) / PLOT_W;
    const lap = Math.round(frac * (totalLaps - 1)) + 1;
    setHover(Math.max(1, Math.min(totalLaps, lap)));
  }

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      className="h-auto w-full select-none"
      role="img"
      aria-label="Predicted lap time per lap, segmented by tyre compound"
    >
      {/* safety-car bands */}
      {safetyCarPeriods.map(([start, end], i) => {
        const x = xFor(start);
        const w = xFor(end) - x || 2;
        return (
          <rect
            key={`sc-${i}`}
            x={x}
            y={PAD.top}
            width={w}
            height={PLOT_H}
            fill="var(--warning)"
            opacity={0.12}
          />
        );
      })}

      {/* gridlines + y labels */}
      {yTicks.map((t, i) => {
        const y = yFor(t);
        return (
          <g key={`y-${i}`}>
            <line
              x1={PAD.left}
              x2={VW - PAD.right}
              y1={y}
              y2={y}
              stroke="var(--outline)"
              strokeWidth={1}
              opacity={0.5}
            />
            <text
              x={PAD.left - 8}
              y={y + 4}
              textAnchor="end"
              className="telemetry"
              fontSize={11}
              fill="var(--on-surface-variant)"
            >
              {formatLapTime(t)}
            </text>
          </g>
        );
      })}

      {/* x labels */}
      {xTicks.map((l, i) => (
        <text
          key={`x-${i}`}
          x={xFor(l)}
          y={VH - 12}
          textAnchor="middle"
          className="telemetry"
          fontSize={11}
          fill="var(--on-surface-variant)"
        >
          {l}
        </text>
      ))}

      {/* per-stint area + line */}
      {segments.map((seg, i) => {
        const meta = COMPOUND_META[seg[0].compound];
        const pts = seg.map((l) => `${xFor(l.lap)},${yFor(l.lap_time)}`);
        const linePts = pts.join(" ");
        const areaPts = `${xFor(seg[0].lap)},${baseline} ${linePts} ${xFor(
          seg[seg.length - 1].lap,
        )},${baseline}`;
        return (
          <g key={`seg-${i}`}>
            <polygon points={areaPts} fill={meta.color} opacity={0.1} />
            <polyline
              points={linePts}
              fill="none"
              stroke={meta.color}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>
        );
      })}

      {/* pit-stop markers */}
      {pitLaps.map((lap, i) => (
        <g key={`pit-${i}`}>
          <line
            x1={xFor(lap)}
            x2={xFor(lap)}
            y1={PAD.top}
            y2={baseline}
            stroke="var(--on-surface)"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.5}
          />
          <text
            x={xFor(lap)}
            y={PAD.top - 6}
            textAnchor="middle"
            className="telemetry"
            fontSize={9}
            fill="var(--on-surface-variant)"
          >
            PIT
          </text>
        </g>
      ))}

      {/* fastest lap */}
      {byLap.get(fastestLapNumber) && (
        <circle
          cx={xFor(fastestLapNumber)}
          cy={yFor(byLap.get(fastestLapNumber)!.lap_time)}
          r={4}
          fill="var(--secondary)"
          stroke="var(--surface)"
          strokeWidth={1.5}
        />
      )}

      {/* hover crosshair + readout */}
      {hoverLap && (
        <g pointerEvents="none">
          <line
            x1={xFor(hoverLap.lap)}
            x2={xFor(hoverLap.lap)}
            y1={PAD.top}
            y2={baseline}
            stroke="var(--primary)"
            strokeWidth={1}
            opacity={0.8}
          />
          <circle
            cx={xFor(hoverLap.lap)}
            cy={yFor(hoverLap.lap_time)}
            r={4}
            fill="var(--primary)"
            stroke="var(--surface)"
            strokeWidth={1.5}
          />
          {(() => {
            const bw = 132;
            const bh = 58;
            const tx = Math.min(
              Math.max(xFor(hoverLap.lap) + 10, PAD.left),
              VW - bw - 2,
            );
            const ty = PAD.top + 4;
            const meta = COMPOUND_META[hoverLap.compound];
            return (
              <g>
                <rect
                  x={tx}
                  y={ty}
                  width={bw}
                  height={bh}
                  rx={2}
                  fill="var(--surface-container)"
                  stroke="var(--outline-strong)"
                  strokeWidth={1}
                  opacity={0.97}
                />
                <text
                  x={tx + 10}
                  y={ty + 18}
                  className="telemetry"
                  fontSize={11}
                  fontWeight={700}
                  fill="var(--on-surface)"
                >
                  LAP {hoverLap.lap}
                  {hoverLap.safety_car ? "  · SC" : ""}
                </text>
                <text
                  x={tx + 10}
                  y={ty + 34}
                  className="telemetry"
                  fontSize={11}
                  fill={meta.color}
                >
                  {meta.label} · age {hoverLap.tire_age}
                </text>
                <text
                  x={tx + 10}
                  y={ty + 50}
                  className="telemetry"
                  fontSize={12}
                  fontWeight={700}
                  fill="var(--on-surface)"
                >
                  {formatLapTime(hoverLap.lap_time)}
                </text>
              </g>
            );
          })()}
        </g>
      )}

      {/* pointer capture overlay */}
      <rect
        x={PAD.left}
        y={PAD.top}
        width={PLOT_W}
        height={PLOT_H}
        fill="transparent"
        onPointerMove={handleMove}
        onPointerLeave={() => setHover(null)}
      />
    </svg>
  );
}
