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

**Filename:** `public/drivers/<id>.webp` — `<id>` is the lowercase driver id.

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

**Prep:** crop roughly **square**, face-centred, ~**256–512px**, then convert to
**`.webp`**. Easiest: drop the image into [squoosh.app](https://squoosh.app),
choose WebP, resize, download. CLI alternative: `cwebp -q 82 in.jpg -o nor.webp`.

**Example:** save Verstappen's portrait as
`frontend/public/drivers/ver.webp` → it appears automatically; no code change.

---

## 2. Team logos (optional)

We already theme each team with its livery colour, so logos are optional.

**Filename:** `public/teams/<slug>.svg`

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
