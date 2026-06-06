import type { SafetyCarPeriod } from "../types/api";

export function SafetyCarInfo({ periods }: { periods: SafetyCarPeriod[] }) {
  return (
    <div>
      <p className="hud-label mb-2 flex items-center gap-2">
        <span
          className="inline-block size-2"
          style={{ background: "var(--warning)" }}
        />
        Safety Car
      </p>
      {periods.length === 0 ? (
        <p className="telemetry text-sm text-on-surface-variant">
          No deployments this run
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {periods.map(([start, end], i) => (
            <li
              key={i}
              className="telemetry border border-outline px-2 py-1 text-xs text-on-surface"
            >
              L{start}–{end}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
