import { useState } from "react";
import { teamLogoSources } from "../data/assets";

/**
 * Team logo with multi-format support (svg/png/jpg/…). Falls back to a
 * team-coloured dot if no logo file is present. Give it a `key={team}` so the
 * attempt index resets when the team changes.
 */
export function TeamLogo({
  team,
  color,
  className = "",
}: {
  team: string;
  color: string;
  className?: string;
}) {
  const sources = teamLogoSources(team);
  const [index, setIndex] = useState(0);
  const src = sources[index];

  if (!src) {
    return (
      <span
        className="inline-block size-3 rounded-full"
        style={{ background: color }}
        aria-label={team}
      />
    );
  }

  return (
    <img
      src={src}
      alt={`${team} logo`}
      onError={() => setIndex((i) => i + 1)}
      className={`object-contain ${className}`}
    />
  );
}
