import type { Driver, Track } from "../types/api";
import { Select } from "./Select";

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
    <section className="glass p-6">
      <h2 className="hud-label">Race Setup</h2>

      <div className="mt-5 space-y-5">
        <Select
          label="Driver"
          value={driverId}
          onChange={onDriverChange}
          disabled={disabled}
        >
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>

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
          className="w-full bg-primary px-4 py-3 font-semibold uppercase tracking-wide text-on-primary transition-shadow hover:shadow-[0_0_14px_0_var(--glow)] disabled:cursor-not-allowed disabled:opacity-60 [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,0_100%)]"
        >
          {loading ? "Optimizing…" : "Optimize Strategy"}
        </button>
      </div>
    </section>
  );
}
