import type { Stint } from "../types/api";

/** Format total seconds as h:mm:ss.s (or m:ss.s for short races). */
export function formatRaceTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = (seconds % 60).toFixed(1).padStart(4, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

/** "SOFT (28) → HARD (50)" */
export function stintSummary(strategy: Stint[]): string {
  return strategy.map((st) => `${st.compound} (${st.length})`).join(" → ");
}
