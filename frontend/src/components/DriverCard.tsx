import type { Driver } from "../types/api";
import { driverPortraitSources } from "../data/assets";
import { Avatar } from "./Avatar";
import { TeamLogo } from "./TeamLogo";

/** 3-letter race code derived from the driver's surname (e.g. "Max Verstappen" -> "VER"). */
function driverCode(name: string): string {
  const last = name.trim().split(/\s+/).pop() ?? name;
  return last.slice(0, 3).toUpperCase();
}

export function DriverCard({ driver }: { driver: Driver | null }) {
  if (!driver) return null;

  const code = driverCode(driver.name);

  return (
    <section className="glass panel-clip edge-accent relative flex min-h-[180px] items-stretch justify-between gap-4 overflow-hidden pl-6">
      {/* team-colour livery stripe */}
      <span
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ background: driver.team_color }}
      />
      {/* giant ghosted race code watermark, centred behind the content */}
      <span
        aria-hidden
        className="kinetic pointer-events-none absolute right-[18%] top-1/2 hidden -translate-y-1/2 select-none text-[10rem] font-bold leading-none opacity-[0.06] sm:block"
      >
        {code}
      </span>
      {/* team-colour glow behind the cutout */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-2/3"
        style={{
          background: `radial-gradient(120% 90% at 85% 70%, ${driver.team_color}40, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex flex-col justify-center py-6">
        <div className="flex items-center gap-2">
          <p className="hud-label">Driver</p>
          <span
            className="telemetry text-[0.625rem] font-bold tracking-widest"
            style={{ color: driver.team_color }}
          >
            {code}
          </span>
        </div>
        <TeamLogo
          key={driver.team}
          team={driver.team}
          className="mt-2 mb-2 h-10 w-auto max-w-[180px]"
        />
        <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-on-surface lg:text-3xl">
          {driver.name}
        </h2>

        {/* thin stat strip */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ background: driver.team_color }}
            />
            <span className="text-on-surface-variant">{driver.team}</span>
          </span>
          <span className="telemetry text-on-surface-variant">
            CODE <span className="text-on-surface">{code}</span>
          </span>
          <span className="hud-label text-[0.5625rem]">2026 Season</span>
        </div>
      </div>

      {/* full-body cutout, anchored to the bottom edge */}
      <Avatar
        key={driver.id}
        sources={driverPortraitSources(driver.id)}
        name={driver.name}
        color={driver.team_color}
        className="relative z-10 h-56 w-36 self-end object-contain object-bottom"
      />
    </section>
  );
}
