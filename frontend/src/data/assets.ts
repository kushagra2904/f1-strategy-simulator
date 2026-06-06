// Driver/team image asset wiring (Phase 3).
//
// Images are resolved by CONVENTION from /public, so adding an image is just
// dropping a correctly-named file in — no code change needed. If the file is
// absent the UI falls back gracefully (team-coloured initials avatar), so the
// app looks complete with zero images present.
//
// See frontend/ASSETS.md for how to source CC-licensed imagery and record
// attribution. Every third-party image you add MUST get an entry in
// IMAGE_ATTRIBUTIONS below (it powers the on-page credits).

// Portrait formats tried in order (first that loads wins). AVIF first since
// it has the best compression and broad modern-browser support.
const PORTRAIT_FORMATS = ["avif", "webp", "jpg", "png"] as const;

/**
 * Candidate portrait paths for a driver, most-preferred first, e.g.
 * driverPortraitSources("VER") -> ["/drivers/ver.avif", "/drivers/ver.webp", ...].
 * Avatar tries each in turn, so any one of these formats works.
 */
export function driverPortraitSources(driverId: string): string[] {
  const base = `/drivers/${driverId.toLowerCase()}`;
  return PORTRAIT_FORMATS.map((ext) => `${base}.${ext}`);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Logo formats tried in order. SVG first (crispest), then raster formats.
const LOGO_FORMATS = ["svg", "png", "webp", "avif", "jpg"] as const;

/**
 * Candidate logo paths for a team, most-preferred first, e.g.
 * teamLogoSources("Red Bull Racing") -> ["/teams/red-bull-racing.svg", ...].
 */
export function teamLogoSources(teamName: string): string[] {
  const base = `/teams/${slugify(teamName)}`;
  return LOGO_FORMATS.map((ext) => `${base}.${ext}`);
}

export interface Attribution {
  /** What the image is, e.g. "Max Verstappen portrait". */
  subject: string;
  /** Credited author/photographer. */
  author: string;
  /** Licence string, e.g. "CC BY-SA 4.0" or "Public domain". */
  license: string;
  /** Link to the source page (e.g. the Wikimedia Commons file page). */
  sourceUrl: string;
}

// The driver cutouts and team logos shipped here are official F1/team assets
// (copyrighted/trademarked), used non-commercially in this personal, unaffiliated
// project — NOT CC-licensed. Update `author`/`sourceUrl` below to the actual
// place you downloaded them from if it differs.
export const IMAGE_ATTRIBUTIONS: Attribution[] = [
  {
    subject: "Driver portraits (full-body cutouts)",
    author: "Formula 1 / the respective teams",
    license: "© All rights reserved — used non-commercially, personal project",
    sourceUrl: "https://www.formula1.com/en/drivers",
  },
  {
    subject: "Team logos",
    author: "The respective Formula 1 teams",
    license: "Trademarks of their owners — used editorially",
    sourceUrl: "https://www.formula1.com/en/teams",
  },
];
