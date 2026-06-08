import type { ReactElement } from "react";
import { useTheme } from "../theme/theme-context";
import type { ThemeMode } from "../theme/theme-context";

const ICON: Record<ThemeMode, ReactElement> = {
  system: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  light: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
  dark: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  ),
};

const LABEL: Record<ThemeMode, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

export function ThemeToggle() {
  const { mode, cycle } = useTheme();

  return (
    <button
      type="button"
      onClick={cycle}
      title={`Theme: ${LABEL[mode]} (click to change)`}
      aria-label={`Theme: ${LABEL[mode]}. Click to change.`}
      className="glass flex cursor-pointer items-center gap-2 px-3 py-2 text-on-surface transition-colors hover:text-primary [clip-path:polygon(0_0,100%_0,100%_100%,8px_100%,0_calc(100%-8px))]"
    >
      {ICON[mode]}
      <span className="hud-label text-[0.625rem]">{LABEL[mode]}</span>
    </button>
  );
}
