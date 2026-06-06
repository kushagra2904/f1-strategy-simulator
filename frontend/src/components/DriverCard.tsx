import type { Driver } from "../types/api";

export function DriverCard({ driver }: { driver: Driver | null }) {
  if (!driver) return null;

  return (
    <section className="glass relative overflow-hidden p-5 pl-6">
      {/* team-colour livery stripe */}
      <span
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ background: driver.team_color }}
      />
      <p className="hud-label">Driver</p>
      <h2 className="font-display text-2xl font-bold text-on-surface">
        {driver.name}
      </h2>
      <div className="mt-2 flex items-center gap-2">
        <span
          className="inline-block size-3 rounded-full"
          style={{ background: driver.team_color }}
        />
        <span className="text-sm text-on-surface-variant">{driver.team}</span>
      </div>
    </section>
  );
}
