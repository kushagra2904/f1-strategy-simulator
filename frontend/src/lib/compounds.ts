import type { Compound } from "../types/api";

// Fixed compound colours (not theme-dependent) so foreground contrast is
// deterministic in both light and dark modes.
export const COMPOUND_META: Record<
  Compound,
  { color: string; fg: string; label: string }
> = {
  SOFT: { color: "#e10600", fg: "#ffffff", label: "Soft" },
  MEDIUM: { color: "#f4c500", fg: "#1a1b22", label: "Medium" },
  HARD: { color: "#8a93a3", fg: "#ffffff", label: "Hard" },
};
