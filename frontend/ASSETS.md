# Driver & Team Imagery — Sourcing Guide

The app loads driver/team images **by convention** from `public/`. If an image
is missing, the UI falls back to a team-coloured initials avatar, so everything
works with zero images present. Add images incrementally.

> **Licensing (important).** This is a personal/portfolio project. Use only
> images you're allowed to: **public domain, CC0, CC BY, or CC BY-SA**. Avoid
> "all rights reserved" press photos, "fair use"/"non-free" files, and anything
> without a clear licence. For every third-party image you add, record an
> attribution entry (below) — CC BY / BY-SA *require* credit.

---

## 1. Driver portraits

**Where:** [Wikimedia Commons](https://commons.wikimedia.org) — search the
driver's name, open a photo, and check the **Licensing** section on the file
page. Acceptable: *Public domain / CC0 / CC BY / CC BY-SA*.

**Filename:** `public/drivers/<id>.<ext>` — `<id>` is the lowercase driver id.
Any of these formats work (the app tries them in this order): **`.avif`**,
`.webp`, `.jpg`, `.png`. AVIF/AV1 is great — best compression, fully supported
in current browsers — use it as-is, no conversion needed.

| id | Driver | id | Driver |
|----|--------|----|--------|
| `nor` | Lando Norris | `gas` | Pierre Gasly |
| `pia` | Oscar Piastri | `col` | Franco Colapinto |
| `lec` | Charles Leclerc | `alb` | Alex Albon |
| `ham` | Lewis Hamilton | `sai` | Carlos Sainz |
| `ver` | Max Verstappen | `law` | Liam Lawson |
| `had` | Isack Hadjar | `lin` | Arvid Lindblad |
| `rus` | George Russell | `oco` | Esteban Ocon |
| `ant` | Andrea Kimi Antonelli | `bea` | Oliver Bearman |
| `alo` | Fernando Alonso | `hul` | Nico Hülkenberg |
| `str` | Lance Stroll | `bor` | Gabriel Bortoleto |
| | | `bot` | Valtteri Bottas |
| | | `per` | Sergio Pérez |

(These ids are the source of truth in `backend/main.py`'s `DRIVERS`.)

**Prep:** either a **square headshot** or a **full-body cutout** (transparent
background) works — the driver card anchors the image to its bottom edge and
preserves aspect ratio, so cutouts display upright without cropping. Keep it
reasonably sized (long edge ~512–1024px). Format doesn't matter (AVIF/WebP/JPG/
PNG all work); [squoosh.app](https://squoosh.app) can resize/convert.

**Example:** save Verstappen's portrait as `frontend/public/drivers/ver.avif`
(or `.webp`/`.jpg`/`.png`) → it appears automatically; no code change.

---

## 2. Team logos (optional)

Logos show next to the team name on the driver card (missing ones fall back to
the livery-colour dot).

**Filename:** `public/teams/<slug>.<ext>` — any of `.svg`, `.png`, `.webp`,
`.avif`, `.jpg` (tried in that order).

| slug | Team | slug | Team |
|------|------|------|------|
| `mclaren` | McLaren | `williams` | Williams |
| `ferrari` | Ferrari | `racing-bulls` | Racing Bulls |
| `red-bull-racing` | Red Bull Racing | `haas` | Haas |
| `mercedes` | Mercedes | `audi` | Audi |
| `aston-martin` | Aston Martin | `cadillac` | Cadillac |
| `alpine` | Alpine | | |

> **Trademark note:** team names/logos are trademarks. Editorial/personal use is
> generally fine, but don't imply endorsement or affiliation. Prefer SVGs from
> the team's brand/press kit or Wikimedia. (The `teamLogo()` helper in
> `src/data/assets.ts` resolves these paths if you wire logos into the UI later.)

---

## 3. Record attribution

For each third-party image you add, append an entry to `IMAGE_ATTRIBUTIONS` in
[`src/data/assets.ts`](src/data/assets.ts). It powers the on-page **Image
Credits** footer.

```ts
export const IMAGE_ATTRIBUTIONS: Attribution[] = [
  {
    subject: "Max Verstappen portrait",
    author: "Jane Doe",
    license: "CC BY-SA 4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Max_Verstappen_2024.jpg",
  },
];
```

Public-domain/CC0 images don't legally require credit, but adding an entry is
still good practice.
