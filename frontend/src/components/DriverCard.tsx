import type { Driver } from "../types/api";
import { driverPortraitSources } from "../data/assets";
import { Avatar } from "./Avatar";
import { TeamLogo } from "./TeamLogo";

export function DriverCard({ driver }: { driver: Driver | null }) {
  if (!driver) return null;

  return (
    <section className="glass relative flex items-end justify-between gap-3 overflow-hidden pl-6">
      {/* team-colour livery stripe */}
      <span
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ background: driver.team_color }}
      />
      {/* team-colour glow behind the cutout */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-2/3"
        style={{
          background: `radial-gradient(120% 90% at 80% 70%, ${driver.team_color}33, transparent 70%)`,
        }}
      />

      <div className="relative z-10 py-6">
        <p className="hud-label">Driver</p>
        <TeamLogo
          key={driver.team}
          team={driver.team}
          className="mt-2 mb-2 h-10 w-auto max-w-[180px]"
        />
        <h2 className="font-display text-2xl font-bold text-on-surface">
          {driver.name}
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">{driver.team}</p>
      </div>

      {/* full-body cutout, anchored to the bottom edge */}
      <Avatar
        key={driver.id}
        sources={driverPortraitSources(driver.id)}
        name={driver.name}
        color={driver.team_color}
        className="relative z-10 h-48 w-32 self-end object-contain object-bottom"
      />
    </section>
  );
}
