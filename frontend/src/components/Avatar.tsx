import { useState } from "react";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Shows the first image in `sources` that loads, falling back to team-coloured
 * initials if none do. Try multiple formats by passing several candidate URLs
 * (e.g. .avif, .webp, .jpg). Give the element a `key` that changes with the
 * subject so the attempt index resets when the subject does.
 */
export function Avatar({
  sources,
  name,
  color,
  className = "",
}: {
  sources: string[];
  name: string;
  color: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const src = sources[index];

  if (!src) {
    return (
      <div
        className={`grid place-items-center font-display font-bold text-white ${className}`}
        style={{ background: color }}
        aria-label={name}
      >
        {initials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setIndex((i) => i + 1)}
      className={className}
    />
  );
}
