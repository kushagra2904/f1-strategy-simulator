import type { Track } from "../types/api";

export function TrackDisplay({ track }: { track: Track | null }) {
  return (
    <section className="glass flex flex-col p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-lg font-semibold text-on-surface">
          {track ? track.name : "Circuit"}
        </h2>
        {track && <span className="hud-label">{track.laps} Laps</span>}
      </div>

      {/* Track maps are light line-art, so they sit on a fixed dark "screen"
          for visibility regardless of the active theme. */}
      <div className="mt-4 flex flex-1 items-center justify-center border border-outline bg-[#101018] p-4">
        {track ? (
          <img
            src={`/tracks/${track.file}`}
            alt={`${track.name} circuit layout`}
            className="max-h-[460px] w-full object-contain [filter:drop-shadow(0_0_18px_var(--glow))]"
          />
        ) : (
          <p className="telemetry text-on-surface-variant">Select a circuit</p>
        )}
      </div>
    </section>
  );
}
