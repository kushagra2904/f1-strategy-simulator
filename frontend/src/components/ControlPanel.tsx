import type { Driver, Track } from "../types/api";
import { Select } from "./Select";
import { DriverSelect } from "./DriverSelect";

interface ControlPanelProps {
  drivers: Driver[];
  tracks: Track[];
  driverId: string;
  trackName: string;
  onDriverChange: (id: string) => void;
  onTrackChange: (name: string) => void;
  onOptimize: () => void;
  loading: boolean;
  disabled: boolean;
}

export function ControlPanel({
  drivers,
  tracks,
  driverId,
  trackName,
  onDriverChange,
  onTrackChange,
  onOptimize,
  loading,
  disabled,
}: ControlPanelProps) {
  return (
    <section className="glass panel-clip edge-accent flex h-full flex-col p-6">
      <div className="flex items-center gap-2">
        <h2 className="hud-label">Race Setup</h2>
        <span className="h-px flex-1 bg-outline" />
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-5">
        <DriverSelect
          drivers={drivers}
          value={driverId}
          onChange={onDriverChange}
          disabled={disabled}
        />

        <Select
          label="Circuit"
          value={trackName}
          onChange={onTrackChange}
          disabled={disabled}
        >
          {tracks.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </Select>

        <button
          type="button"
          onClick={onOptimize}
          disabled={loading || disabled}
          className={`btn-streak mt-auto w-full cursor-pointer bg-primary px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.12em] text-on-primary transition-shadow hover:shadow-[0_0_16px_0_var(--glow)] disabled:cursor-not-allowed disabled:opacity-60 [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,0_100%)] ${
            loading ? "is-running" : ""
          }`}
        >
          {loading ? "Optimizing…" : "Optimize Strategy"}
        </button>
      </div>
    </section>
  );
}
