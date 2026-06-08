import { useState } from "react";
import {
  HOTSPOT_COLOR,
  HOTSPOT_TYPE_LABEL,
  TRACK_HOTSPOTS,
  type Hotspot,
} from "../data/trackHotspots";

/**
 * Transparent, keyboard-accessible hit-areas placed over a circuit image at
 * normalized coordinates. Hover/focus reveals a highlight ring + info tooltip.
 * Renders nothing for tracks that have no authored hotspot data.
 */
export function TrackHotspots({ file }: { file: string }) {
  const hotspots = TRACK_HOTSPOTS[file];
  const [active, setActive] = useState<Hotspot | null>(null);

  if (!hotspots) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {hotspots.map((h) => {
        const color = HOTSPOT_COLOR[h.type];
        const isActive = active?.id === h.id;
        // tooltip flips to the left half when the hotspot is on the right edge
        const flip = h.x > 0.62;
        return (
          <div
            key={h.id}
            className="absolute"
            style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%` }}
          >
            <button
              type="button"
              aria-label={`${HOTSPOT_TYPE_LABEL[h.type]}: ${h.label}${
                h.detail ? `. ${h.detail}` : ""
              }`}
              onPointerEnter={() => setActive(h)}
              onPointerLeave={() => setActive((cur) => (cur?.id === h.id ? null : cur))}
              onFocus={() => setActive(h)}
              onBlur={() => setActive((cur) => (cur?.id === h.id ? null : cur))}
              onClick={() => setActive((cur) => (cur?.id === h.id ? null : h))}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full transition-transform duration-150 hover:scale-110 focus-visible:scale-110"
              style={{ width: 26, height: 26 }}
            >
              {/* ring marker (transparent center over the baked annotation) */}
              <span
                className="absolute inset-0 rounded-full border-2 transition-opacity duration-150"
                style={{
                  borderColor: color,
                  opacity: isActive ? 1 : 0.001,
                  boxShadow: isActive ? `0 0 12px 0 ${color}` : "none",
                }}
              />
              <span
                className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-150"
                style={{ background: color, opacity: isActive ? 1 : 0.001 }}
              />
            </button>

            {/* tooltip */}
            {isActive && (
              <div
                className="pointer-events-none absolute bottom-1/2 z-30 mb-3 w-52 -translate-y-1 border bg-surface-container/95 p-3 shadow-lg backdrop-blur-sm"
                style={{
                  borderColor: color,
                  left: flip ? "auto" : "50%",
                  right: flip ? "50%" : "auto",
                  transform: flip ? "translateX(-12px)" : "translateX(-12px)",
                }}
              >
                <p
                  className="hud-label text-[0.5625rem]"
                  style={{ color }}
                >
                  {HOTSPOT_TYPE_LABEL[h.type]}
                </p>
                <p className="font-display text-xs font-bold uppercase tracking-wide text-on-surface">
                  {h.label}
                </p>
                {h.detail && (
                  <p className="mt-1 text-xs leading-snug text-on-surface-variant">
                    {h.detail}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
