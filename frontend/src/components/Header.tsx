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
    <header className="sticky top-0 z-30 border-b border-outline bg-surface/70 backdrop-blur-xl">
      {/* hot top hairline */}
      <div className="h-0.5 w-full bg-gradient-to-r from-primary via-primary/40 to-transparent" />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center bg-primary font-display text-base font-bold text-on-primary [clip-path:polygon(0_0,100%_0,100%_70%,70%_100%,0_100%)] glow-primary">
            P
          </span>
          <div className="leading-tight">
            <p className="kinetic text-sm font-bold text-on-surface">PIT WALL</p>
            <p className="hud-label text-[0.5625rem]">F1 Race Strategy</p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {TABS.map((tab) => {
            const isActive = active === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onTab(tab)}
                aria-current={isActive ? "page" : undefined}
                className={`group relative cursor-pointer px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab}
                <span
                  className={`absolute inset-x-2 bottom-0 block h-0.5 origin-left transition-transform duration-200 ${
                    isActive
                      ? "scale-x-100 bg-primary glow-primary"
                      : "scale-x-0 bg-on-surface group-hover:scale-x-100"
                  }`}
                />
              </button>
            );
          })}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
