import type { Compound } from "../types/api";
import { COMPOUND_META } from "../lib/compounds";

export function CompoundChip({
  compound,
  laps,
}: {
  compound: Compound;
  laps?: number;
}) {
  const meta = COMPOUND_META[compound];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider"
      style={{ background: meta.color, color: meta.fg }}
    >
      <span>{meta.label}</span>
      {laps != null && <span className="telemetry">{laps}</span>}
    </span>
  );
}
