import { useState } from "react";
import { teamLogoSources } from "../data/assets";

/**
 * Team logo with multi-format support (svg/png/jpg/…). Renders nothing if no
 * logo file is present (team identity is still carried by the card's livery
 * stripe + name). Give it a `key={team}` so the attempt index resets when the
 * team changes.
 */
export function TeamLogo({
  team,
  className = "",
}: {
  team: string;
  className?: string;
}) {
  const sources = teamLogoSources(team);
  const [index, setIndex] = useState(0);
  const src = sources[index];

  if (!src) return null;

  return (
    <img
      src={src}
      alt={`${team} logo`}
      onError={() => setIndex((i) => i + 1)}
      className={`object-contain ${className}`}
    />
  );
}
