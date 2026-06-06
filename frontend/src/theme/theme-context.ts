import { createContext, useContext } from "react";

export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
  /** What the user picked. `system` follows the OS appearance. */
  mode: ThemeMode;
  /** The concrete theme currently applied. */
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  /** Advance system → light → dark → system. */
  cycle: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

export const THEME_STORAGE_KEY = "pitwall-theme";
