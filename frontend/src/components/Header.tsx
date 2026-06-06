import { ThemeToggle } from "./ThemeToggle";

export type Tab = "Dashboard" | "Assets" | "Telemetry" | "Strategy";

const TABS: Tab[] = ["Dashboard", "Assets", "Telemetry", "Strategy"];

export function Header({
  active,
  onTab,
}: {
  active: Tab;
  onTab: (tab: Tab) => void;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-outline bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center bg-primary font-display font-bold text-on-primary">
            P
          </span>
          <div className="leading-tight">
            <p className="font-display text-sm font-bold tracking-wide text-on-surface">
              PIT WALL
            </p>
            <p className="hud-label text-[0.5625rem]">F1 Race Strategy</p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTab(tab)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                active === tab
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab}
              <span
                className={`mt-1 block h-px transition-colors ${
                  active === tab ? "bg-primary" : "bg-transparent"
                }`}
              />
            </button>
          ))}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
