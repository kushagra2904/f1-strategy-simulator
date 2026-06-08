import type { Track } from "../types/api";
import { TRACK_HOTSPOTS } from "../data/trackHotspots";
import { TrackHotspots } from "./TrackHotspots";

export function TrackDisplay({ track }: { track: Track | null }) {
  return (
    <section className="glass panel-clip edge-accent flex h-full flex-col p-6">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="hud-label">Circuit</span>
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-on-surface">
            {track ? track.name : "—"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {track && TRACK_HOTSPOTS[track.file] && (
            <span className="hud-label hidden text-[0.5625rem] text-secondary sm:inline">
              ◦ Hover corners
            </span>
          )}
          {track && (
            <span className="telemetry border border-outline px-2 py-1 text-xs font-bold text-on-surface">
              {track.laps} LAPS
            </span>
          )}
        </div>
      </div>

      {/* Track maps are light line-art, so they sit on a fixed dark "screen"
          (with a telemetry grid) for visibility regardless of the active theme. */}
      <div className="relative mt-4 flex flex-1 items-center justify-center overflow-hidden border border-outline bg-[#08080d] p-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* corner ticks for a HUD frame */}
        <span className="pointer-events-none absolute left-2 top-2 size-3 border-l border-t border-primary/60" />
        <span className="pointer-events-none absolute right-2 top-2 size-3 border-r border-t border-primary/60" />
        <span className="pointer-events-none absolute bottom-2 left-2 size-3 border-b border-l border-primary/60" />
        <span className="pointer-events-none absolute bottom-2 right-2 size-3 border-b border-r border-primary/60" />

        {track ? (
          <div className="relative z-10">
            <img
              src={`/tracks/${track.file}`}
              alt={`${track.name} circuit layout`}
              className="block max-h-[520px] w-auto max-w-full object-contain [filter:drop-shadow(0_0_18px_var(--glow))]"
            />
            <TrackHotspots file={track.file} />
          </div>
        ) : (
          <p className="telemetry relative z-10 text-on-surface-variant">
            Select a circuit
          </p>
        )}
      </div>
    </section>
  );
}
